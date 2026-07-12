import styles from './AuthDivider.module.css';

export function AuthDivider() {
  return (
    <div className={styles.divider} aria-hidden="true">
      <span />
      <p>ou entre com outras contas</p>
      <span />
    </div>
  );
}
