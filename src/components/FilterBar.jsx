import React from 'react';
import {
  Search,
  Flag,
  Folder,
  ArrowUpDown,
  LayoutGrid,
  List,
  RefreshCw,
  X,
} from 'lucide-react';
import Select from './Select';
import GithubIcon from './GithubIcon';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
];

const PRIORITIES = [
  { id: 'all', label: 'All priorities' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'dueDate', label: 'Due date' },
  { id: 'priority', label: 'Priority' },
  { id: 'title', label: 'Title (A–Z)' },
];

const VIEW_MODES = [
  { id: 'list', label: 'List view', icon: List },
  { id: 'grid', label: 'Grid view', icon: LayoutGrid },
];

const segmentClass = (isActive) =>
  `h-9 rounded-md text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'bg-surface text-foreground shadow-sm shadow-black/5'
      : 'text-muted-foreground hover:text-foreground'
  }`;

export default function FilterBar({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  taskCount,
  isRefreshing,
  onRefresh,
  onImportGitHub,
  categories = ['Work', 'Personal', 'Development', 'Design', 'General'],
}) {
  return (
    <section aria-label="Filter and sort tasks" className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks by title or description"
            className="field pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              aria-label="Clear search"
              className="icon-btn size-8 absolute right-1 top-1/2 -translate-y-1/2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            icon={Flag}
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            aria-label="Filter by priority"
            className="flex-1 min-w-[9.5rem] lg:flex-none lg:w-40"
          >
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>

          <Select
            icon={Folder}
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            aria-label="Filter by category"
            className="flex-1 min-w-[9.5rem] lg:flex-none lg:w-44"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select
            icon={ArrowUpDown}
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            aria-label="Sort tasks"
            className="flex-1 min-w-[9.5rem] lg:flex-none lg:w-40"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Filter by status"
          className="flex w-full sm:w-auto overflow-x-auto no-scrollbar rounded-lg bg-muted p-1"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = filters.status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange('status', tab.id)}
                aria-pressed={isActive}
                className={`flex-1 sm:flex-none shrink-0 px-3 whitespace-nowrap ${segmentClass(isActive)}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2">
          <p role="status" className="text-sm text-muted-foreground tabular-nums">
            {isRefreshing ? (
              'Updating…'
            ) : (
              <>
                <span className="sr-only">Showing </span>
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onImportGitHub}
              aria-haspopup="dialog"
              aria-label="Import from GitHub"
              className="btn btn-secondary h-9 px-3"
            >
              <GithubIcon className="size-4" />
              Import<span className="hidden sm:inline"> from GitHub</span>
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh tasks"
              title="Refresh"
              className="icon-btn"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <div role="group" aria-label="Layout" className="flex rounded-lg bg-muted p-1">
              {VIEW_MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onViewModeChange(id)}
                  aria-pressed={viewMode === id}
                  aria-label={label}
                  title={label}
                  className={`w-9 flex items-center justify-center ${segmentClass(viewMode === id)}`}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
