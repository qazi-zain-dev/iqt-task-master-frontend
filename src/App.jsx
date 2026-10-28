import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import TaskStats from './components/TaskStats';
import FilterBar from './components/FilterBar';
import TaskItem from './components/TaskItem';
import TaskModal from './components/TaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import WeatherWidget from './components/WeatherWidget';
import GitHubSyncModal from './components/GitHubSyncModal';
import NotificationToast from './components/NotificationToast';
import useDebouncedValue from './hooks/useDebouncedValue';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompleted,
} from './services/api';
import { Plus, Inbox, SearchX, AlertCircle } from 'lucide-react';

const DEFAULT_FILTERS = {
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  sortBy: 'newest',
};

const TODAY_LABEL = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState('list');
  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const { status, priority, category, sortBy } = filters;
  const queryParams = useMemo(
    () => ({ search: debouncedSearch, status, priority, category, sortBy }),
    [debouncedSearch, status, priority, category, sortBy]
  );
  const requestId = useRef(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchTaskList = useCallback(async () => {
    const current = ++requestId.current;
    try {
      setLoading(true);
      setError(null);
      const res = await getTasks(queryParams);
      if (current === requestId.current) setTasks(res.data || []);
    } catch {
      if (current === requestId.current) {
        setError("Couldn't reach the task server. Check that the backend is running, then try again.");
      }
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchTaskList();
  }, [fetchTaskList]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all';

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      if (editingTask) {
        await updateTask(editingTask._id, taskData);
        showToast('Task updated', 'success');
      } else {
        await createTask(taskData);
        showToast('Task created', 'success');
      }
      setIsModalOpen(false);
      setEditingTask(null);
      fetchTaskList();
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't save the task. Please try again.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                completed: !t.completed,
                status: !t.completed ? 'completed' : 'pending',
              }
            : t
        )
      );
      const res = await toggleTaskCompleted(id);
      showToast(res.message || 'Task status updated', 'info');
      fetchTaskList();
    } catch {
      showToast("Couldn't update the task status", 'error');
      fetchTaskList();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setIsSubmitting(true);
      await deleteTask(deletingTask._id);
      showToast('Task deleted', 'success');
      setDeletingTask(null);
      fetchTaskList();
    } catch {
      showToast("Couldn't delete the task", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportGitHubIssue = async (issueData) => {
    try {
      await createTask(issueData);
      const { title } = issueData;
      showToast(`Imported “${title.length > 40 ? `${title.slice(0, 40)}…` : title}”`, 'success');
      fetchTaskList();
      return true;
    } catch {
      showToast("Couldn't import the GitHub issue", 'error');
      return false;
    }
  };

  const handleAddFromWeather = async (weatherTask) => {
    try {
      await createTask(weatherTask);
      showToast('Weather tip added as a task', 'success');
      fetchTaskList();
      return true;
    } catch {
      showToast("Couldn't add the weather task", 'error');
      return false;
    }
  };

  const isInitialLoad = loading && tasks.length === 0 && !error;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar onOpenCreateModal={openCreateModal} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{TODAY_LABEL}</p>
          <h1 className="mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My tasks
          </h1>
        </div>

        <TaskStats tasks={tasks} />

        <WeatherWidget onAddTaskFromWeather={handleAddFromWeather} />

        <div className="space-y-4">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            taskCount={tasks.length}
            isRefreshing={loading && !isInitialLoad}
            onRefresh={fetchTaskList}
            onImportGitHub={() => setIsGitHubOpen(true)}
          />

          {error && (
            <div
              role="alert"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-danger-soft p-4 text-sm text-danger-soft-foreground"
            >
              <span className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </span>
              <button type="button" onClick={fetchTaskList} className="btn btn-secondary h-9 shrink-0">
                Try again
              </button>
            </div>
          )}

          {isInitialLoad ? (
            <ul className="flex flex-col gap-3" aria-busy="true" aria-label="Loading tasks">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="card flex items-start gap-4 p-4">
                  <div className="skeleton size-5 shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="skeleton h-4 w-2/5" />
                    <div className="skeleton h-3 w-4/5" />
                    <div className="flex gap-2 pt-1">
                      <div className="skeleton h-5 w-16 rounded-full" />
                      <div className="skeleton h-5 w-20 rounded-full" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : tasks.length === 0 && !error ? (
            <div className="card border-dashed flex flex-col items-center px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                {hasActiveFilters ? <SearchX className="size-6" /> : <Inbox className="size-6" />}
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                {hasActiveFilters ? 'No matching tasks' : 'No tasks yet'}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {hasActiveFilters
                  ? 'Nothing matches these filters. Try a different search or clear the filters.'
                  : 'Your board is clear. Create a task to start organizing your work.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="btn btn-secondary"
                  >
                    Clear filters
                  </button>
                )}
                <button type="button" onClick={openCreateModal} className="btn btn-primary">
                  <Plus className="size-4" strokeWidth={2.5} />
                  New task
                </button>
              </div>
            </div>
          ) : (
            <ul
              aria-label="Tasks"
              aria-busy={loading}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
                  : 'flex flex-col gap-3'
              }
            >
              {tasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsModalOpen(true);
                  }}
                  onDelete={() => setDeletingTask(task)}
                  viewMode={viewMode}
                />
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="mt-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">TaskMaster Pro</span> · Full-stack REST app
          </p>
          <p className="text-center">React · Tailwind · Express · MongoDB · Open-Meteo &amp; GitHub APIs</p>
        </div>
      </footer>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={!!deletingTask}
        taskTitle={deletingTask?.title}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingTask(null)}
        isDeleting={isSubmitting}
      />

      <GitHubSyncModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
        onImportIssue={handleImportGitHubIssue}
      />

      <NotificationToast toast={toast} onClose={dismissToast} />
    </div>
  );
}
