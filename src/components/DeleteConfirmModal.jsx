import React, { useRef } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import Dialog from './Dialog';

export default function DeleteConfirmModal({
  isOpen,
  taskTitle,
  onConfirm,
  onClose,
  isDeleting,
}) {
  const cancelRef = useRef(null);

  const handleClose = () => {
    if (!isDeleting) onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      role="alertdialog"
      labelledBy="delete-task-title"
      describedBy="delete-task-desc"
      initialFocusRef={cancelRef}
      className="max-w-md"
    >
      <div className="flex gap-4 p-5 sm:p-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger-soft-foreground">
          <Trash2 className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 id="delete-task-title" className="text-lg font-semibold text-foreground">
            Delete this task?
          </h2>
          <p id="delete-task-desc" className="mt-1 text-sm text-muted-foreground break-words">
            <span className="font-medium text-foreground">“{taskTitle}”</span> will be permanently
            removed. This can’t be undone.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
        <button
          ref={cancelRef}
          type="button"
          onClick={handleClose}
          disabled={isDeleting}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="btn btn-danger min-w-32"
        >
          {isDeleting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Deleting…
            </>
          ) : (
            'Delete task'
          )}
        </button>
      </div>
    </Dialog>
  );
}
