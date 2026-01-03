import { ReactNode } from 'react';
import { classnames } from '@/lib/classnames';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  return (
    <div className={classnames(styles.card, styles[variant], className)}>
      {children}
    </div>
  );
}

