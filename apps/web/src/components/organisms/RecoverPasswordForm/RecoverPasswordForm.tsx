import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../atoms/Button/Button';
import { AuthStatusMessage } from '../../molecules/AuthStatusMessage/AuthStatusMessage';
import { FormField } from '../../molecules/FormField/FormField';
import authStyles from '../AuthForm/AuthForm.module.css';
import credentialStyles from '../AuthForm/CredentialForm.module.css';

export function RecoverPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (status !== 'success') return;
    const redirectTimer = window.setTimeout(() => window.location.assign('/redefinir-senha'), 1000);
    return () => window.clearTimeout(redirectTimer);
  }, [status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      setEmailError('Informe um endereço de e-mail válido.');
      setStatus('idle');
      return;
    }

    setEmailError('');
    setStatus('loading');
    window.setTimeout(() => setStatus('success'), 300);
  }

  return (
    <section className={`${authStyles.content} ${credentialStyles.content}`} aria-labelledby="recover-password-title">
      <header className={authStyles.header}>
        <h1 id="recover-password-title">Recuperar senha</h1>
        <p>Informe seu e-mail para receber as instruções de recuperação.</p>
      </header>

      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        <FormField
          id="recovery-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          error={emailError}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError('');
          }}
          disabled={status !== 'idle'}
          required
        />

        {status === 'success' && <AuthStatusMessage type="success">Instruções enviadas! Verifique sua caixa de entrada.</AuthStatusMessage>}

        <Button className={authStyles.submit} type="submit" disabled={status !== 'idle'} aria-busy={status === 'loading'}>
          <span>{status === 'loading' ? 'Enviando...' : status === 'success' ? 'Instruções enviadas' : 'Enviar instruções'}</span>
          <span aria-hidden="true">→</span>
        </Button>
      </form>

      <a className={credentialStyles.backLink} href="/">← Voltar ao login</a>
    </section>
  );
}
