import type { InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function Checkbox({ id, label, ...props }: CheckboxProps) {
  return (
    <label className={styles.label} htmlFor={id}>
      <input className={styles.input} id={id} type="checkbox" {...props} />
      <span className={styles.box} aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}
