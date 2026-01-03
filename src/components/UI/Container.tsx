import { ReactNode } from 'react';
import { classnames } from '@/lib/classnames';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  return (
    <div className={classnames(styles.container, styles[size], className)}>
      {children}
    </div>
  );
}

