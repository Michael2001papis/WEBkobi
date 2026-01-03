import { InputHTMLAttributes } from 'react';
import { classnames } from '@/lib/classnames';
import styles from './Toggle.module.css';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Toggle({ label, className, id, ...props }: ToggleProps) {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={classnames(styles.wrapper, className)}>
      <input
        type="checkbox"
        id={toggleId}
        className={styles.input}
        {...props}
      />
      <label htmlFor={toggleId} className={styles.label}>
        {label && <span className={styles.labelText}>{label}</span>}
        <span className={styles.slider} aria-hidden="true" />
      </label>
    </div>
  );
}

