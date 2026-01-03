import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { classnames } from '@/lib/classnames';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

type ButtonProps = BaseButtonProps &
  (
    | (ButtonHTMLAttributes<HTMLButtonElement> & { as?: never; to?: never })
    | (LinkProps & { as: typeof Link; to: string })
  );

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  as,
  ...props
}: ButtonProps) {
  const buttonClassName = classnames(styles.button, styles[variant], styles[size], className);

  if (as === Link && 'to' in props) {
    const { to, ...linkProps } = props as LinkProps & { to: string };
    return (
      <Link to={to} className={buttonClassName} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={buttonClassName}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

