import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="card p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-paper-warm border border-paper-edge mb-4">
        <Icon className="h-5 w-5 text-ink-mute" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-2xl text-ink mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-ink-mute max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="btn-primary mt-6 inline-flex"
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
