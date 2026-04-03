import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn('rounded-2xl border border-border bg-card p-5 shadow-panel', props.className)}
    />
  );
}
