import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "cursor-pointer font-medium group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding whitespace-nowrap transition-all outline-none select-none focus-visible:border-button-primary-enabled focus-visible:ring-3 focus-visible:ring-button-primary-enabled/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:bg-button-disabled data-[disabled]:pointer-events-none data-[disabled]:bg-button-disabled aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-button-primary-enabled text-rc-gray-0 text-label hover:bg-button-primary-hovered active:bg-button-primary-pressed',
        icon: 'rounded-full bg-transparent text-icon-iris-enabled hover:bg-button-tertiary-hovered active:bg-button-tertiary-pressed',
        ghost:
          'rounded-full text-label-assistive hover:bg-background-tertiary active:text-label-alternative aria-expanded:bg-button-tertiary-pressed aria-expanded:text-label-alternative',
        link: 'text-button-primary-enabled underline-offset-4 hover:underline',
        outline:
          'border-[0.8px] border-line-normal text-label text-label-alternative bg-button-tertiary-enabled hover:bg-button-tertiary-hovered hover:text-label-normal hover:font-bold active:bg-button-tertiary-pressed aria-expanded:bg-muted aria-expanded:text-foreground',
      },
      size: {
        default:
          'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-10 gap-1.5 px-4 py-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xl: 'h-11 px-4 py-3',
        'icon-xs': 'size-8 text-icon-gray-enabled',
        'icon-sm': 'size-10 text-icon-gray-enabled',
        'icon-lg': 'size-11',
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
