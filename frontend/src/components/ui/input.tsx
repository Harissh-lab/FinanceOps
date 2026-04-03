import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-primary',
        props.className,
      )}
    />
  );
}
