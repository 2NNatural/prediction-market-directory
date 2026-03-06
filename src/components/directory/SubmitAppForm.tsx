'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Application } from '@/types';
import { DIMENSION_CONFIGS } from '@/types';

type SubmitState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'success'; app: Application }
  | { phase: 'error'; message: string };

interface SubmitAppFormProps {
  trigger?: React.ReactNode;
}

export function SubmitAppForm({ trigger }: SubmitAppFormProps = {}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [state, setState] = useState<SubmitState>({ phase: 'idle' });

  function reset() {
    setUrl('');
    setState({ phase: 'idle' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setState({ phase: 'loading' });

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setState({ phase: 'error', message: json.error ?? 'An unexpected error occurred.' });
        return;
      }

      setState({ phase: 'success', app: json.application });
    } catch {
      setState({ phase: 'error', message: 'Network error — could not reach the server.' });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            Submit App
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a Prediction Market App</DialogTitle>
        </DialogHeader>

        {state.phase !== 'success' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste the homepage URL of a prediction market application. Our AI will scrape and
              classify it automatically.
            </p>

            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={state.phase === 'loading'}
                required
              />
              <Button type="submit" disabled={state.phase === 'loading' || !url.trim()}>
                {state.phase === 'loading' ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>

            {state.phase === 'loading' && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Scraping site and classifying with AI — this may take 10-20 seconds...
              </p>
            )}

            {state.phase === 'error' && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </form>
        ) : (
          <SuccessView app={state.app} onClose={() => { setOpen(false); reset(); }} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessView({ app, onClose }: { app: Application; onClose: () => void }) {
  const DIMENSION_TO_FIELD = {
    content: 'content_tags',
    instrument: 'instrument_tags',
    execution: 'execution_tags',
    interface: 'interface_tags',
    resolution: 'resolution_tags',
  } as const;

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
        <strong>{app.name}</strong> submitted successfully and is pending review.
      </div>

      {app.description && (
        <p className="text-sm text-muted-foreground">{app.description}</p>
      )}

      <div className="space-y-2">
        {DIMENSION_CONFIGS.map((dim) => {
          const tags = app[DIMENSION_TO_FIELD[dim.key]] as string[];
          if (tags.length === 0) return null;
          return (
            <div key={dim.key} className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
                {dim.label}
              </span>
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          );
        })}
      </div>

      <Button onClick={onClose} className="w-full">
        Done
      </Button>
    </div>
  );
}
