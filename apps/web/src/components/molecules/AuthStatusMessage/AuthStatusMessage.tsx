import styles from './AuthStatusMessage.module.css';

type AuthStatusMessageProps = {
  type: 'success' | 'error';
  children: string;
};

export function AuthStatusMessage({ type, children }: AuthStatusMessageProps) {
  return (
    <p className={`${styles.message} ${styles[type]}`} role={type === 'error' ? 'alert' : 'status'} aria-live="polite">
      {children}
    </p>
  );
}
