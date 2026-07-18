import { useState, type FormEvent } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { AuthDivider } from '../../molecules/AuthDivider/AuthDivider';
import { AuthStatusMessage } from '../../molecules/AuthStatusMessage/AuthStatusMessage';
import { FormField } from '../../molecules/FormField/FormField';
import { PasswordField } from '../../molecules/PasswordField/PasswordField';
import { SocialLoginGroup } from '../SocialLoginGroup/SocialLoginGroup';
import { useAuth } from '../../../contexts/AuthContext';
import { normalizeApiError } from '../../../http/apiError';
import {
  mapApiMessagesToFields,
  normalizeEmail,
  validateLogin,
} from '../../../services/auth/auth.validation';
import type { AuthFieldErrors } from '../../../services/auth/auth.types';
import { consumeRememberPreference } from '../../../services/auth/tokenStorage';
import authStyles from '../AuthForm/AuthForm.module.css';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const { clearSessionError, login, sessionError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(
    () => consumeRememberPreference() ?? true,
  );
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  );
  const isSubmitting = status === 'submitting';

  function focusField(field: 'email' | 'senha') {
    const fieldId = field === 'email' ? 'login-email' : 'password';
    window.requestAnimationFrame(() =>
      document.getElementById(fieldId)?.focus(),
    );
  }

  function clearFeedback(field: 'email' | 'senha') {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setFormError('');
    clearSessionError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || status === 'success') return;

    const input = {
      email: normalizeEmail(email),
      senha: password,
    };
    const validationErrors = validateLogin(input);

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setFormError('');
      focusField(validationErrors.email ? 'email' : 'senha');
      return;
    }

    setFieldErrors({});
    setFormError('');
    clearSessionError();
    setStatus('submitting');

    try {
      await login(input, rememberMe);
      setPassword('');
      setStatus('success');
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.kind === 'validation') {
        const apiFieldErrors = mapApiMessagesToFields(apiError.messages);
        setFieldErrors(apiFieldErrors);

        if (Object.keys(apiFieldErrors).length) {
          focusField(apiFieldErrors.email ? 'email' : 'senha');
        } else {
          setFormError(apiError.messages[0]);
        }
      } else if (apiError.kind === 'unauthorized') {
        setFormError('Email ou senha inválidos.');
      } else {
        setFormError(apiError.messages[0]);
      }

      setStatus('idle');
    }
  }

  return (
    <section className={authStyles.content} aria-labelledby="login-title">
      <header className={authStyles.header}>
        <h1 id="login-title">Login</h1>
        <p>Boas-vindas! Faça seu login.</p>
      </header>

      <form
        className={authStyles.form}
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
      >
        <FormField
          id="login-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          value={email}
          error={fieldErrors.email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFeedback('email');
          }}
          disabled={status !== 'idle'}
          required
        />
        <PasswordField
          id="password"
          label="Senha"
          name="senha"
          autoComplete="current-password"
          value={password}
          error={fieldErrors.senha}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFeedback('senha');
          }}
          disabled={status !== 'idle'}
          required
        />

        <div className={authStyles.options}>
          <Checkbox
            id="remember-me"
            name="rememberMe"
            label="Lembrar-me"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            disabled={status !== 'idle'}
          />
          <a className={styles.forgotPassword} href="/recuperar-senha">Esqueci a senha</a>
        </div>

        {(formError || sessionError) && (
          <AuthStatusMessage type="error">
            {formError || sessionError}
          </AuthStatusMessage>
        )}

        {status === 'success' && (
          <AuthStatusMessage type="success">
            Login realizado com sucesso.
          </AuthStatusMessage>
        )}

        <Button
          className={authStyles.submit}
          type="submit"
          disabled={status !== 'idle'}
          aria-busy={isSubmitting}
        >
          <span>{isSubmitting ? 'Entrando...' : 'Login'}</span>
          <span aria-hidden="true">→</span>
        </Button>
      </form>

      <AuthDivider />
      <SocialLoginGroup />

      <div className={styles.register}>
        <p>Ainda não tem conta?</p>
        <a href="/cadastro">
          Crie seu cadastro!
          <img className={styles.registerIcon} src="/assets/auth/register.svg" alt="" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
