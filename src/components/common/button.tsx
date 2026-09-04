import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "cursor-pointer font-medium group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding whitespace-nowrap transition-all outline-none select-none focus-visible:border-button-primary-enabled focus-visible:ring-3 focus-visible:ring-button-primary-enabled/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:bg-button-disabled data-[disabled]:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-button-primary-enabled text-rc-gray-0 text-label hover:bg-button-primary-hovered active:bg-button-primary-pressed',
        icon: 'rounded-full bg-transparent text-icon-gray-enabled hover:bg-button-gray-enabled active:text-icon-gray-hovered',
        ghost:
          'text-caption font-normal rounded-full text-label-assistive hover:text-label-alternative hover:bg-button-gray-enabled active:bg-button-gray-hovered active:text-label-alternative aria-expanded:bg-button-tertiary-pressed aria-expanded:text-label-alternative has-data-icon:font-normal',
        link: 'text-button-primary-enabled underline-offset-4 hover:underline',
        // 운영콘솔 버튼
        'console-primary':
          'gap-2 bg-button-primary-enabled text-label text-rc-gray-0 hover:bg-button-primary-hovered active:bg-button-primary-pressed active:font-semibold disabled:bg-rc-gray-200 disabled:text-label-assistive',
        'console-secondary':
          'gap-2 border-line-normal bg-background-default text-label text-label-normal hover:bg-rc-gray-50 active:bg-background-tertiary active:font-semibold disabled:border-rc-gray-200 disabled:bg-rc-gray-50 disabled:text-label-assistive',
        'console-danger':
          'gap-2 border-rc-rose-500 bg-rc-gray-0 text-label text-rc-rose-600 hover:bg-rc-rose-50 active:bg-rc-rose-100 active:font-semibold disabled:border-rc-gray-200 disabled:bg-background-tertiary disabled:text-label-assistive',
        outline:
          'border-[0.8px] border-line-normal text-label text-label-alternative bg-button-tertiary-enabled hover:bg-button-tertiary-hovered hover:text-label-normal hover:font-bold active:bg-button-tertiary-pressed aria-expanded:bg-muted aria-expanded:text-foreground',
      },
      size: {
        default:
          'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'px-3 py-1.5 gap-1 has-data-[icon=inline-end]:pr-1.5',
        md: 'px-4 py-2.5 text-label font-medium',
        lg: 'h-10 gap-1.5 px-4 py-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xl: 'h-11 px-4 py-3',
        withIcon: 'px-3 py-1.5 gap-1.5',
        inquiry: 'h-10 px-4 py-2.5',
        'icon-xs': 'size-8 p-2',
        'icon-sm': 'size-8 p-2',
        'icon-md': 'size-10 p-2',
        'icon-lg': 'size-14 p-2 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={(state) =>
        cn(
          buttonVariants({ variant, size }),
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export { Button, buttonVariants };
