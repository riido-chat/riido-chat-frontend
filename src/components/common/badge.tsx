import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex w-fit max-w-full min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-4! [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        link: 'cursor-pointer bg-rc-gray-200 text-caption text-label-alternative hover:bg-rc-gray-300 active:font-bold active:text-label-normal [&_svg]:text-icon-gray-enabled [&_svg]:text-label-assistive hover:[&_svg]:text-label-alternative active:[&_svg]:text-label-normal',
        plain: 'border-rc-gray-200 bg-rc-gray-0 px-2.5 py-1 text-caption text-label-alternative',
        attention: 'border-rc-iris-500 bg-rc-gray-0 px-2.5 py-1 text-caption text-rc-iris-700',
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
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

export { Badge, badgeVariants };
