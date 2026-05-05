import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-slate-400',
        className,
      )}
      {...props}
    />
  );
}
