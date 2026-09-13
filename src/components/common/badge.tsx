import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex w-fit max-w-full min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-disabled:pointer-events-none [&>svg]:pointer-events-none [&>svg]:size-4! [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        link: 'cursor-pointer bg-rc-gray-200 text-caption text-label-alternative hover:bg-rc-gray-300 active:font-bold active:text-label-normal [&_svg]:text-icon-gray-enabled [&_svg]:text-label-assistive hover:[&_svg]:text-label-alternative active:[&_svg]:text-label-normal aria-disabled:bg-rc-gray-100 aria-disabled:text-label-disabled aria-disabled:[&_svg]:text-label-disabled',
        plain: 'border-rc-gray-200 bg-rc-gray-0 px-2.5 py-1 text-caption text-label-alternative',
        progress: 'border-rc-iris-200 bg-rc-gray-0 px-2.5 py-1 text-caption text-rc-iris-500',
        attention: 'border-rc-iris-500 bg-rc-gray-0 px-2.5 py-1 text-caption text-rc-iris-700',
        warning: 'border-rc-amber-500 bg-rc-gray-0 px-2.5 py-1 text-caption text-rc-amber-600',
        danger: 'border-rc-rose-500 bg-rc-gray-0 px-2.5 py-1 text-caption text-rc-rose-600',
      },
    },
    defaultVariants: {
      variant: 'link',
    },
  },
);

function Badge({
  className,
  variant = 'link',
  disabled,
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { disabled?: boolean }) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
        'aria-disabled': disabled || undefined,
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
      disabled,
    },
  });
}

export { Badge, badgeVariants };
