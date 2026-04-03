import { ChartNoAxesCombined } from 'lucide-react';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <ChartNoAxesCombined className="mb-3 text-muted-foreground" />
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
