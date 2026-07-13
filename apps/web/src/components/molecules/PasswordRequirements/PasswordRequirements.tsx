import { getPasswordRequirements } from '../../../utils/passwordValidation';
import styles from './PasswordRequirements.module.css';

type PasswordRequirementsProps = {
  password: string;
  showInvalid?: boolean;
};

export function PasswordRequirements({ password, showInvalid = false }: PasswordRequirementsProps) {
  const requirements = getPasswordRequirements(password);
  const completed = requirements.filter((requirement) => requirement.met).length;

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>A senha deve conter:</p>
      <ul className={styles.list}>
        {requirements.map((requirement) => {
          const state = requirement.met ? 'valid' : showInvalid ? 'invalid' : 'pending';
          return (
            <li className={styles[state]} key={requirement.id}>
              <span aria-hidden="true">{state === 'valid' ? '✓' : state === 'invalid' ? '×' : '•'}</span>
              {requirement.label}
            </li>
          );
        })}
      </ul>
      <span className={styles.srOnly} aria-live="polite">{completed} de {requirements.length} requisitos atendidos.</span>
    </div>
  );
}
