import type { InputHTMLAttributes } from 'react';
import { Input } from '../../atoms/Input/Input';
import styles from './FormField.module.css';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

export function FormField({ id, label, ...inputProps }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <Input id={id} {...inputProps} />
    </div>
  );
}
