import { Button } from '../../atoms/Button/Button';
import styles from './SocialLoginOption.module.css';

type SocialLoginOptionProps = {
  iconSrc: string;
  label: string;
  accessibleLabel: string;
};

export function SocialLoginOption({ iconSrc, label, accessibleLabel }: SocialLoginOptionProps) {
  return (
    <Button className={styles.option} type="button" aria-label={accessibleLabel}>
      <img src={iconSrc} alt="" />
      <span>{label}</span>
    </Button>
  );
}
