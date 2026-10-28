import React from 'react';
import { Check, Plus } from 'lucide-react';

export default function Navbar({ onOpenCreateModal }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <a href="/" className="flex items-center gap-2.5 rounded-lg min-w-0">
          <span className="flex items-center justify-center size-9 shrink-0 rounded-lg bg-primary text-primary-foreground">
            <Check className="size-5" strokeWidth={3} />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground truncate">
            TaskMaster
          </span>
        </a>

        <button
          type="button"
          onClick={onOpenCreateModal}
          aria-label="New task"
          className="btn btn-primary px-3 sm:px-4"
        >
          <Plus className="size-5" strokeWidth={2.5} />
          <span className="hidden sm:inline">New task</span>
        </button>
      </div>
    </header>
  );
}
