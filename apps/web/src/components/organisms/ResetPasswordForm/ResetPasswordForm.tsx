import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../atoms/Button/Button';
import { AuthStatusMessage } from '../../molecules/AuthStatusMessage/AuthStatusMessage';
import { PasswordField } from '../../molecules/PasswordField/PasswordField';
import { isPasswordValid } from '../../../utils/passwordValidation';
import authStyles from '../AuthForm/AuthForm.module.css';
import credentialStyles from '../AuthForm/CredentialForm.module.css';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [passwordWasBlurred, setPasswordWasBlurred] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const passwordIsValid = isPasswordValid(password);
  const passwordsDiffer = confirmation.length > 0 && password !== confirmation;
  const passwordsMatch = confirmation.length > 0 && passwordIsValid && password === confirmation;
  const canSubmit = passwordIsValid && confirmation.length > 0 && !passwordsDiffer && status === 'idle';

  useEffect(() => {
    if (status !== 'success') return;
    const redirectTimer = window.setTimeout(() => window.location.assign('/login'), 1000);
    return () => window.clearTimeout(redirectTimer);
  }, [status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;
    setStatus('loading');
    window.setTimeout(() => setStatus('success'), 300);
  }

  return (
    <section className={`${authStyles.content} ${credentialStyles.content}`} aria-labelledby="reset-password-title">
      <header className={authStyles.header}>
        <h1 id="reset-password-title">Redefinir senha</h1>
        <p>Crie uma nova senha para acessar sua conta.</p>
      </header>

      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        <PasswordField
          id="new-password"
          label="Nova senha"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setPasswordWasBlurred(true)}
          disabled={status !== 'idle'}
          showRequirements
          showInvalidRequirements={passwordWasBlurred}
          required
        />
        <PasswordField
          id="confirm-password"
          label="Confirmar senha"
          name="passwordConfirmation"
          autoComplete="new-password"
          value={confirmation}
          error={passwordsDiffer ? 'As senhas não coincidem.' : ''}
          success={passwordsMatch ? 'Senhas iguais.' : ''}
          onChange={(event) => setConfirmation(event.target.value)}
          disabled={status !== 'idle'}
          required
        />

        {status === 'success' && <AuthStatusMessage type="success">Senha redefinida com sucesso!</AuthStatusMessage>}

        <Button className={authStyles.submit} type="submit" disabled={!canSubmit} aria-busy={status === 'loading'}>
          <span>{status === 'loading' ? 'Redefinindo...' : status === 'success' ? 'Senha redefinida' : 'Redefinir senha'}</span>
          <span aria-hidden="true">→</span>
        </Button>
      </form>

      <a className={credentialStyles.backLink} href="/">← Voltar ao login</a>
    </section>
  );
}
