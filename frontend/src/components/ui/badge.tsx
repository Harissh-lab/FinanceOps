import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Badge(props: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={cn('inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold', props.className)}
    />
  );
}
