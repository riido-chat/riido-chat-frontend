import { cn } from '@/lib/utils';

type NativeButtonProps = React.ComponentPropsWithoutRef<'button'>;

type ButtonProps =
  | (NativeButtonProps & {
      variant: 'icon';
      'aria-label': string;
    })
  | (NativeButtonProps & {
      variant: 'text';
      'aria-label'?: string;
    });

const baseStyles = 'cursor-pointer disabled:pointer-events-none disabled:opacity-50';

const variantStyles = {
  text: 'bg-transparent text-label-assistive hover:text-label-normal',
  icon: 'inline-flex shrink-0 items-center justify-center rounded-md',
};

export default function Button({
  variant,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </button>
  );
}
