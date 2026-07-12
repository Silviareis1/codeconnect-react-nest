import type { ReactNode } from 'react';
import styles from './AuthTemplate.module.css';

type AuthTemplateProps = {
  bannerSrc: string;
  bannerAlt: string;
  children: ReactNode;
};

export function AuthTemplate({ bannerSrc, bannerAlt, children }: AuthTemplateProps) {
  return (
    <main className={styles.page}>
      <div className={`${styles.brandShape} ${styles.brandShapeTop}`} aria-hidden="true"><span /><span /></div>
      <div className={`${styles.brandShape} ${styles.brandShapeBottom}`} aria-hidden="true"><span /><span /></div>
      <div className={styles.panel}>
        <div className={styles.bannerWrapper}>
          <img className={styles.banner} src={bannerSrc} alt={bannerAlt} />
        </div>
        <div className={styles.formColumn}>{children}</div>
      </div>
    </main>
  );
}
