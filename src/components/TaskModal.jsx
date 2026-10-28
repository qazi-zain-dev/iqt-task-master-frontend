import React, { useState, useEffect, useId, useRef } from 'react';
import { X, AlertCircle, Folder, CircleDot, Loader2 } from 'lucide-react';
import Dialog from './Dialog';
import Select from './Select';

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  category: 'General',
  status: 'pending',
  dueDate: '',
  tagsString: '',
};

const PRIORITIES = [
  { id: 'low', label: 'Low', activeClass: 'peer-checked:bg-muted peer-checked:text-foreground peer-checked:border-input' },
  { id: 'medium', label: 'Medium', activeClass: 'peer-checked:bg-info-soft peer-checked:text-info-soft-foreground peer-checked:border-info-soft-foreground' },
  { id: 'high', label: 'High', activeClass: 'peer-checked:bg-accent-soft peer-checked:text-accent-soft-foreground peer-checked:border-accent-soft-foreground' },
  { id: 'urgent', label: 'Urgent', activeClass: 'peer-checked:bg-danger-soft peer-checked:text-danger-soft-foreground peer-checked:border-danger-soft-foreground' },
];

const CATEGORIES = ['General', 'Development', 'Design', 'Work', 'Personal'];

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);
  const titleEdited = useRef(false);
  const id = useId();
  const fieldId = (name) => `${id}-${name}`;

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        category: initialData.category || 'General',
        status: initialData.status || (initialData.completed ? 'completed' : 'pending'),
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
        tagsString: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
    titleEdited.current = false;
  }, [initialData, isOpen]);

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') titleEdited.current = true;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] && value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTitleBlur = () => {
    if (titleEdited.current && !formData.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Give your task a title' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrors({ title: 'Give your task a title' });
      titleRef.current?.focus();
      return;
    }

    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      category: formData.category,
      status: formData.status,
      completed: formData.status === 'completed',
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      tags,
    });
  };

  const isEditing = Boolean(initialData);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      labelledBy={fieldId('heading')}
      initialFocusRef={titleRef}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 id={fieldId('heading')} className="text-lg font-semibold text-foreground">
            {isEditing ? 'Edit task' : 'New task'}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isEditing ? 'Update the details below.' : 'Capture what needs to get done.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="icon-btn -mr-2 -mt-1"
        >
          <X className="size-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label htmlFor={fieldId('title')} className="field-label">
              Title <span className="text-danger-soft-foreground" aria-hidden="true">*</span>
            </label>
            <input
              ref={titleRef}
              id={fieldId('title')}
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleTitleBlur}
              placeholder="e.g. Ship the authentication API"
              aria-required="true"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? fieldId('title-error') : undefined}
              className={`field ${errors.title ? 'border-danger focus-visible:border-danger' : ''}`}
            />
            {errors.title && (
              <p
                id={fieldId('title-error')}
                className="mt-1.5 flex items-center gap-1.5 text-sm text-danger-soft-foreground"
              >
                <AlertCircle className="size-4 shrink-0" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={fieldId('description')} className="field-label">
              Description
            </label>
            <textarea
              id={fieldId('description')}
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Context, acceptance criteria, notes…"
              className="field h-auto min-h-[5.5rem] resize-y py-2.5 leading-relaxed"
            />
          </div>

          <fieldset>
            <legend className="field-label">Priority</legend>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <label key={p.id} className="relative">
                  <input
                    type="radio"
                    name="priority"
                    value={p.id}
                    checked={formData.priority === p.id}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${p.activeClass}`}
                  >
                    {p.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={fieldId('category')} className="field-label">
                Category
              </label>
              <Select
                id={fieldId('category')}
                name="category"
                icon={Folder}
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor={fieldId('status')} className="field-label">
                Status
              </label>
              <Select
                id={fieldId('status')}
                name="status"
                icon={CircleDot}
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </Select>
            </div>

            <div>
              <label htmlFor={fieldId('dueDate')} className="field-label">
                Due date
              </label>
              <input
                id={fieldId('dueDate')}
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="field"
              />
            </div>

            <div>
              <label htmlFor={fieldId('tags')} className="field-label">
                Tags
              </label>
              <input
                id={fieldId('tags')}
                type="text"
                name="tagsString"
                value={formData.tagsString}
                onChange={handleChange}
                placeholder="frontend, api, bug"
                aria-describedby={fieldId('tags-hint')}
                className="field"
              />
              <p id={fieldId('tags-hint')} className="mt-1.5 text-xs text-muted-foreground">
                Separate tags with commas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary min-w-32">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : isEditing ? (
              'Save changes'
            ) : (
              'Create task'
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
