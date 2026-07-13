import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { Input } from '../../atoms/Input/Input';
import styles from './FormField.module.css';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  success?: string;
  endAction?: ReactNode;
  helperContent?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
};

export function FormField({ id, label, error, success, endAction, helperContent, inputRef, className = '', ...inputProps }: FormFieldProps) {
  const feedbackId = `${id}-feedback`;
  const helperId = `${id}-helper`;
  const describedBy = [inputProps['aria-describedby'], helperContent ? helperId : '', error || success ? feedbackId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.control}>
        <Input
          id={id}
          ref={inputRef}
          className={`${className} ${endAction ? styles.inputWithAction : ''}`.trim()}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {endAction && <div className={styles.endAction}>{endAction}</div>}
      </div>
      {helperContent && <div id={helperId}>{helperContent}</div>}
      {(error || success) && (
        <p className={error ? styles.error : styles.success} id={feedbackId} aria-live="polite">
          {error || success}
        </p>
      )}
    </div>
  );
}
