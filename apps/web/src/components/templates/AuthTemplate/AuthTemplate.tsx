import type { ReactNode } from 'react';
import styles from './AuthTemplate.module.css';

type AuthTemplateProps = {
  bannerSrc: string;
  bannerTabletSrc?: string;
  bannerMobileSrc?: string;
  bannerAlt: string;
  layout?: 'default' | 'extended';
  children: ReactNode;
};

export function AuthTemplate({ bannerSrc, bannerTabletSrc, bannerMobileSrc, bannerAlt, layout = 'default', children }: AuthTemplateProps) {
  return (
    <main className={`${styles.page} ${layout === 'extended' ? styles.pageExtended : ''}`.trim()}>
      <div className={`${styles.brandShape} ${styles.brandShapeTop}`} aria-hidden="true"><span /><span /></div>
      <div className={`${styles.brandShape} ${styles.brandShapeBottom}`} aria-hidden="true"><span /><span /></div>
      <div className={styles.panel}>
        <div className={styles.bannerWrapper}>
          <picture>
            {bannerMobileSrc && <source media="(max-width: 599px)" srcSet={bannerMobileSrc} />}
            {bannerTabletSrc && <source media="(max-width: 819px)" srcSet={bannerTabletSrc} />}
            <img className={styles.banner} src={bannerSrc} alt={bannerAlt} />
          </picture>
        </div>
        <div className={styles.formColumn}>{children}</div>
      </div>
    </main>
  );
}
