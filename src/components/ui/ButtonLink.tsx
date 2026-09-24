import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { buttonClassName, type ButtonVariant } from './button-styles';

type NextLinkProps = ComponentProps<typeof Link>;

interface ButtonLinkProps extends Omit<NextLinkProps, 'href'> {
  to: NextLinkProps['href'];
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  icon,
  className,
  children,
  to,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={to} className={buttonClassName(variant, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
