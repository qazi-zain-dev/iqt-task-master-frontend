import React, { useState, useEffect } from 'react';
import { X, Plus, ExternalLink, Search, Check, AlertCircle, Loader2, Inbox } from 'lucide-react';
import { getGitHubIssues } from '../services/api';
import Dialog from './Dialog';
import GithubIcon from './GithubIcon';

const POPULAR_REPOS = [
  'facebook/react',
  'tailwindlabs/tailwindcss',
  'vercel/next.js',
  'nodejs/node',
  'microsoft/vscode',
];

const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/;

export default function GitHubSyncModal({ isOpen, onClose, onImportIssue }) {
  const [repo, setRepo] = useState('facebook/react');
  const [repoInput, setRepoInput] = useState('');
  const [inputError, setInputError] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importedIds, setImportedIds] = useState(new Set());
  const [importingId, setImportingId] = useState(null);

  const fetchIssues = async (targetRepo) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getGitHubIssues(targetRepo);
      setIssues(res.data || []);
    } catch {
      setError(`Couldn't load issues for ${targetRepo}. Check the repository exists and is public.`);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchIssues(repo);
    }
  }, [isOpen, repo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = repoInput.trim();
    if (!REPO_PATTERN.test(value)) {
      setInputError('Use the format owner/repo, e.g. vercel/next.js');
      return;
    }
    setInputError(null);
    setRepoInput('');
    if (value === repo) fetchIssues(value);
    else setRepo(value);
  };

  const handleImport = async (issue) => {
    setImportingId(issue.id);
    const ok = await onImportIssue({
      title: `[GH #${issue.number}] ${issue.title}`,
      description: `Issue Link: ${issue.html_url}\n\n${issue.body || 'No description provided.'}`,
      category: 'Development',
      priority: 'high',
      tags: ['github', ...(issue.labels || []).slice(0, 2)],
    });
    setImportingId(null);
    if (ok) setImportedIds((prev) => new Set([...prev, issue.id]));
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="github-sync-title"
      describedBy="github-sync-desc"
      className="max-w-2xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <GithubIcon className="size-5" />
          </span>
          <div>
            <h2 id="github-sync-title" className="text-lg font-semibold text-foreground">
              Import GitHub issues
            </h2>
            <p id="github-sync-desc" className="mt-0.5 text-sm text-muted-foreground">
              Turn open issues from any public repository into tasks.
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="icon-btn -mr-2 -mt-1">
          <X className="size-5" />
        </button>
      </div>

      <div className="space-y-3 border-b border-border px-5 py-4">
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="github-repo" className="field-label">
            Repository
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="github-repo"
                type="text"
                value={repoInput}
                onChange={(e) => {
                  setRepoInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="owner/repo"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={Boolean(inputError)}
                aria-describedby={inputError ? 'github-repo-error' : undefined}
                className={`field pl-9 ${inputError ? 'border-danger focus-visible:border-danger' : ''}`}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Fetch
            </button>
          </div>
          {inputError && (
            <p id="github-repo-error" className="mt-1.5 flex items-center gap-1.5 text-sm text-danger-soft-foreground">
              <AlertCircle className="size-4 shrink-0" />
              {inputError}
            </p>
          )}
        </form>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="shrink-0 text-xs font-medium text-muted-foreground">Popular</span>
          {POPULAR_REPOS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRepo(r)}
              aria-pressed={repo === r}
              className={`chip h-8 px-3 transition-colors duration-150 ${
                repo === r
                  ? 'bg-primary-soft text-primary-soft-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4" aria-busy={loading}>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Open issues in <span className="text-foreground">{repo}</span>
        </h3>

        {loading ? (
          <ul className="space-y-3" aria-label="Loading issues">
            {[0, 1, 2].map((i) => (
              <li key={i} className="card p-4 space-y-2.5">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-1/2" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-danger-soft p-4 text-sm text-danger-soft-foreground"
          >
            <span className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </span>
            <button type="button" onClick={() => fetchIssues(repo)} className="btn btn-secondary h-9 shrink-0">
              Try again
            </button>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Inbox className="size-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No open issues in this repository.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {issues.map((issue) => {
              const isImported = importedIds.has(issue.id);
              const isImporting = importingId === issue.id;
              return (
                <li key={issue.id} className="card flex flex-col sm:flex-row sm:items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 pt-px text-sm font-medium tabular-nums text-muted-foreground">
                        #{issue.number}
                      </span>
                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="group/link min-w-0 rounded text-sm font-semibold text-foreground break-words hover:text-primary hover:underline underline-offset-2"
                      >
                        {issue.title}
                        <ExternalLink className="ml-1 inline size-3.5 align-[-2px] text-muted-foreground group-hover/link:text-primary" />
                        <span className="sr-only"> (opens on GitHub)</span>
                      </a>
                    </div>

                    {issue.body && (
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 break-words">
                        {issue.body}
                      </p>
                    )}

                    {issue.labels?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {issue.labels.slice(0, 4).map((lbl, idx) => (
                          <span key={`${lbl}-${idx}`} className="chip bg-muted text-muted-foreground">
                            {lbl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {isImported ? (
                    <span className="chip h-9 self-start px-3 bg-success-soft text-success-soft-foreground">
                      <Check className="size-4" />
                      Imported
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleImport(issue)}
                      disabled={isImporting}
                      aria-label={`Import issue #${issue.number} as a task`}
                      className="btn btn-secondary h-9 self-start px-3"
                    >
                      {isImporting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                      Import
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
