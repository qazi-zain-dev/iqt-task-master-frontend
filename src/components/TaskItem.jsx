import React from 'react';
import { Check, Calendar, Pencil, Trash2, Folder, AlertCircle } from 'lucide-react';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', className: 'bg-danger-soft text-danger-soft-foreground' },
  high: { label: 'High', className: 'bg-accent-soft text-accent-soft-foreground' },
  medium: { label: 'Medium', className: 'bg-info-soft text-info-soft-foreground' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
};

const MAX_VISIBLE_TAGS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const getDueDateInfo = (dateString, isCompleted) => {
  if (!dateString) return null;
  const raw = new Date(dateString);
  if (Number.isNaN(raw.getTime())) return null;

  const due = new Date(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((due - today) / DAY_MS);

  const formatted = due.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: due.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });

  if (isCompleted) return { label: formatted, tone: 'plain' };
  if (diffDays < 0) return { label: `Overdue · ${formatted}`, tone: 'overdue' };
  if (diffDays === 0) return { label: 'Due today', tone: 'today' };
  if (diffDays === 1) return { label: 'Due tomorrow', tone: 'plain' };
  return { label: formatted, tone: 'plain' };
};

function DueDate({ info }) {
  if (info.tone === 'overdue') {
    return (
      <span className="chip bg-danger-soft text-danger-soft-foreground">
        <AlertCircle className="size-3.5" />
        {info.label}
      </span>
    );
  }
  if (info.tone === 'today') {
    return (
      <span className="chip bg-warning-soft text-warning-soft-foreground">
        <Calendar className="size-3.5" />
        {info.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
      <Calendar className="size-3.5" />
      {info.label}
    </span>
  );
}

export default function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  viewMode = 'list',
}) {
  const isCompleted = task.completed || task.status === 'completed';
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const dueDateInfo = getDueDateInfo(task.dueDate, isCompleted);
  const tags = Array.isArray(task.tags) ? task.tags : [];
  const hiddenTagCount = tags.length - MAX_VISIBLE_TAGS;

  const checkbox = (
    <button
      type="button"
      role="checkbox"
      aria-checked={isCompleted}
      aria-label={`Complete "${task.title}"`}
      onClick={() => onToggleComplete(task._id)}
      className="group/check -m-2 flex size-10 shrink-0 items-center justify-center rounded-lg"
    >
      <span
        className={`flex size-5 items-center justify-center rounded-md border-2 transition-colors duration-150 ${
          isCompleted
            ? 'border-success bg-success text-success-foreground'
            : 'border-input group-hover/check:border-primary'
        }`}
      >
        {isCompleted && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );

  const title = (
    <h3
      className={`text-[15px] sm:text-base font-semibold leading-snug break-words ${
        viewMode === 'grid' ? 'line-clamp-3' : ''
      } ${
        isCompleted
          ? 'text-muted-foreground line-through decoration-muted-foreground/60'
          : 'text-foreground'
      }`}
    >
      {task.title}
    </h3>
  );

  const actions = (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => onEdit(task)}
        aria-label={`Edit "${task.title}"`}
        title="Edit"
        className="icon-btn size-9"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(task._id)}
        aria-label={`Delete "${task.title}"`}
        title="Delete"
        className="icon-btn size-9 hover:bg-danger-soft hover:text-danger-soft-foreground"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );

  const priorityChip = (
    <span className={`chip ${priority.className}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {priority.label}
      <span className="sr-only"> priority</span>
    </span>
  );

  const categoryChip = (
    <span className="chip bg-muted text-muted-foreground">
      <Folder className="size-3.5" />
      {task.category || 'General'}
    </span>
  );

  const tagList = tags.length > 0 && (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      {tags.slice(0, MAX_VISIBLE_TAGS).map((tag, idx) => (
        <span key={`${tag}-${idx}`}>#{tag}</span>
      ))}
      {hiddenTagCount > 0 && <span>+{hiddenTagCount} more</span>}
    </span>
  );

  const description = task.description && (
    <p
      className={`mt-1 text-sm text-muted-foreground break-words ${
        viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-2'
      }`}
    >
      {task.description}
    </p>
  );

  if (viewMode === 'grid') {
    return (
      <li className="card flex flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {priorityChip}
            {categoryChip}
          </div>
          <div className="-mr-2 -my-1">{actions}</div>
        </div>

        <div className="mt-3 flex-1">
          <div className="flex items-start gap-3">
            {checkbox}
            <div className="min-w-0 flex-1 pt-px">{title}</div>
          </div>
          {description}
          {tagList && <div className="mt-2">{tagList}</div>}
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          {dueDateInfo ? (
            <DueDate info={dueDateInfo} />
          ) : (
            <span className="text-xs text-muted-foreground">No due date</span>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className="card flex items-start gap-3 p-3 pl-4 sm:p-4">
      <div className="pt-0.5">{checkbox}</div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 pt-0.5">{title}</div>
          <div className="-mr-1 -mt-1.5">{actions}</div>
        </div>

        {description}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {priorityChip}
          {categoryChip}
          {dueDateInfo && <DueDate info={dueDateInfo} />}
          {tagList}
        </div>
      </div>
    </li>
  );
}
