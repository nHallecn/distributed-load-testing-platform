import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { buttonClassName, type ButtonVariant } from './button-styles';

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName(variant, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
