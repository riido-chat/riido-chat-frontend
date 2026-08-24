import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'text-body-1 text-label-normal placeholder:text-label-assistive disabled:bg-input/50 aria-invalid:ring-label-assistive/20 flex field-sizing-content max-h-30 min-h-6 w-full resize-none overflow-y-auto bg-transparent transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-transparent aria-invalid:ring-3',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
