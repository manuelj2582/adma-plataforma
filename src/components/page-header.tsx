import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
}

export function PageHeader({
  label,
  title,
  description,
  breadcrumbs,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-6 pb-2 mb-8">
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-ink-mute mb-3">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3 w-3 text-ink-subtle" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-ink transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-ink-subtle">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {label && <p className="section-label mb-2">{label}</p>}
        <h1 className="font-display text-4xl text-ink tracking-tightest leading-[1.05] text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-ink-mute text-[15px] leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
