import React from 'react';
import { CheckCircle2, Clock, ListTodo, Flag } from 'lucide-react';

const isDone = (t) => t.completed || t.status === 'completed';

export default function TaskStats({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter(isDone).length;
  const inProgress = tasks.filter((t) => !isDone(t) && t.status === 'in-progress').length;
  const highPriority = tasks.filter(
    (t) => !isDone(t) && (t.priority === 'urgent' || t.priority === 'high')
  ).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      title: 'Total',
      value: total,
      subtext: `${total - completed} still open`,
      icon: ListTodo,
      tone: 'bg-primary-soft text-primary-soft-foreground',
    },
    {
      title: 'In progress',
      value: inProgress,
      subtext: 'Being worked on',
      icon: Clock,
      tone: 'bg-info-soft text-info-soft-foreground',
    },
    {
      title: 'Completed',
      value: completed,
      icon: CheckCircle2,
      tone: 'bg-success-soft text-success-soft-foreground',
      progress: completionRate,
    },
    {
      title: 'High priority',
      value: highPriority,
      subtext: highPriority > 0 ? 'Needs attention' : 'All clear',
      icon: Flag,
      tone: 'bg-accent-soft text-accent-soft-foreground',
    },
  ];

  return (
    <section aria-label="Task summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <span className={`flex items-center justify-center size-8 rounded-lg ${stat.tone}`}>
                <Icon className="size-4" />
              </span>
            </div>
            <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
              {stat.value}
            </p>

            {stat.progress !== undefined ? (
              <div className="mt-3">
                <div
                  role="progressbar"
                  aria-label="Completion rate"
                  aria-valuenow={stat.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                >
                  <div
                    className="h-full rounded-full bg-success transition-[width] duration-500 ease-out"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                  {stat.progress}% done
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">{stat.subtext}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
