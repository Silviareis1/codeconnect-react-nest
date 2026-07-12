import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`${styles.button} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
