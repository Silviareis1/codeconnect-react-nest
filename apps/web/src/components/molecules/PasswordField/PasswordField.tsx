import { useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { FormField } from '../FormField/FormField';
import { PasswordRequirements } from '../PasswordRequirements/PasswordRequirements';
import styles from './PasswordField.module.css';

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string;
  label: string;
  error?: string;
  success?: string;
  helperContent?: ReactNode;
  showRequirements?: boolean;
  showInvalidRequirements?: boolean;
};

export function PasswordField({
  id,
  label,
  error,
  success,
  helperContent,
  showRequirements = false,
  showInvalidRequirements = false,
  ...inputProps
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const password = String(inputProps.value ?? inputProps.defaultValue ?? '');
  const fieldHelper = showRequirements
    ? <PasswordRequirements password={password} showInvalid={showInvalidRequirements} />
    : helperContent;

  function toggleVisibility() {
    setIsVisible((visible) => !visible);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <FormField
      {...inputProps}
      id={id}
      inputRef={inputRef}
      label={label}
      type={isVisible ? 'text' : 'password'}
      error={error}
      success={success}
      helperContent={fieldHelper}
      endAction={(
        <button
          className={styles.toggle}
          type="button"
          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={isVisible}
          onMouseDown={(event) => event.preventDefault()}
          onClick={toggleVisibility}
          disabled={inputProps.disabled}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={isVisible ? 'M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 4.3 10 8a12.5 12.5 0 0 1-2.1 4.1M6.6 6.6A12.1 12.1 0 0 0 2 12c1 3.7 5 8 10 8 1.5 0 2.9-.4 4.1-1' : 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'} />
          </svg>
        </button>
      )}
    />
  );
}
