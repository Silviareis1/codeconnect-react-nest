import { SocialLoginOption } from '../../molecules/SocialLoginOption/SocialLoginOption';
import styles from './SocialLoginGroup.module.css';

export function SocialLoginGroup() {
  return (
    <div className={styles.group} role="group" aria-label="Opções de login social">
      <SocialLoginOption iconSrc="/assets/auth/github.svg" label="Github" accessibleLabel="Entrar com GitHub" />
      <SocialLoginOption iconSrc="/assets/auth/google.svg" label="Gmail" accessibleLabel="Entrar com Google" />
    </div>
  );
}
