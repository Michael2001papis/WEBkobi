import { ReactNode } from 'react';
import { classnames } from '@/lib/classnames';
import styles from './Section.module.css';

interface SectionProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({
  children,
  className,
  variant = 'default',
  padding = 'lg',
}: SectionProps) {
  return (
    <section className={classnames(styles.section, styles[variant], styles[`padding-${padding}`], className)}>
      {children}
    </section>
  );
}

