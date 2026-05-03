"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

type Props = {
  message: string;
  onRetry?: () => void;
};

export function InlineAlert({ message, onRetry }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-rust/30 bg-rust/5 px-4 py-3">
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-rust" />
      <p className="flex-1 font-sans text-sm text-pearl-beige">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md border border-ash-grey/30 bg-ink/60 px-2.5 py-1 text-xs font-medium text-beige transition-colors duration-150 hover:bg-muted-teal/10"
        >
          <RefreshCw size={11} />
          Retry
        </button>
      )}
    </div>
  );
}
