import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { AuthDivider } from '../../molecules/AuthDivider/AuthDivider';
import { AuthStatusMessage } from '../../molecules/AuthStatusMessage/AuthStatusMessage';
import { FormField } from '../../molecules/FormField/FormField';
import { PasswordField } from '../../molecules/PasswordField/PasswordField';
import { isPasswordValid } from '../../../utils/passwordValidation';
import { normalizeApiError } from '../../../http/apiError';
import { register } from '../../../services/auth/auth.service';
import type { AuthFieldErrors } from '../../../services/auth/auth.types';
import {
  mapApiMessagesToFields,
  normalizeEmail,
  validateRegister,
} from '../../../services/auth/auth.validation';
import { saveRememberPreference } from '../../../services/auth/tokenStorage';
import authStyles from '../AuthForm/AuthForm.module.css';
import { SocialLoginGroup } from '../SocialLoginGroup/SocialLoginGroup';
import styles from './RegisterForm.module.css';

export function RegisterForm() {
  const redirectTimer = useRef<number | undefined>(undefined);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordWasBlurred, setPasswordWasBlurred] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  );
  const passwordIsValid = isPasswordValid(password);
  const isSubmitting = status === 'submitting';

  useEffect(
    () => () => {
      if (redirectTimer.current !== undefined) {
        window.clearTimeout(redirectTimer.current);
      }
    },
    [],
  );

  function focusField(field: 'nome' | 'email' | 'senha') {
    const fieldId = {
      nome: 'name',
      email: 'email',
      senha: 'register-password',
    }[field];
    window.requestAnimationFrame(() =>
      document.getElementById(fieldId)?.focus(),
    );
  }

  function clearFeedback(field: 'nome' | 'email' | 'senha') {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setFormError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || status === 'success') return;

    const input = {
      nome: name.trim(),
      email: normalizeEmail(email),
      senha: password,
    };
    const validationErrors = validateRegister(input);

    if (Object.keys(validationErrors).length) {
      setPasswordWasBlurred(true);
      setFieldErrors(validationErrors);
      setFormError('');
      focusField(
        validationErrors.nome
          ? 'nome'
          : validationErrors.email
            ? 'email'
            : 'senha',
      );
      return;
    }

    setFieldErrors({});
    setFormError('');
    setStatus('submitting');

    try {
      await register(input);
      setPassword('');
      setStatus('success');
      saveRememberPreference(rememberMe);
      redirectTimer.current = window.setTimeout(
        () => window.location.assign('/'),
        1200,
      );
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.kind === 'validation' || apiError.kind === 'conflict') {
        const apiFieldErrors = mapApiMessagesToFields(apiError.messages);
        setFieldErrors(apiFieldErrors);
        setPasswordWasBlurred(Boolean(apiFieldErrors.senha));

        if (Object.keys(apiFieldErrors).length) {
          focusField(
            apiFieldErrors.nome
              ? 'nome'
              : apiFieldErrors.email
                ? 'email'
                : 'senha',
          );
        } else {
          setFormError(apiError.messages[0]);
        }
      } else {
        setFormError(apiError.messages[0]);
      }

      setStatus('idle');
    }
  }

  return (
    <section className={`${authStyles.content} ${styles.content}`} aria-labelledby="register-title">
      <header className={authStyles.header}>
        <h1 id="register-title">Cadastro</h1>
        <p>Olá! Preencha seus dados.</p>
      </header>

      <form
        className={authStyles.form}
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
      >
        <FormField
          id="name"
          label="Nome"
          name="nome"
          autoComplete="name"
          maxLength={100}
          value={name}
          error={fieldErrors.nome}
          onChange={(event) => {
            setName(event.target.value);
            clearFeedback('nome');
          }}
          disabled={status !== 'idle'}
          required
        />
        <FormField
          id="email"
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
          id="register-password"
          label="Senha"
          name="senha"
          autoComplete="new-password"
          maxLength={128}
          value={password}
          error={fieldErrors.senha}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFeedback('senha');
          }}
          onBlur={() => setPasswordWasBlurred(true)}
          disabled={status !== 'idle'}
          showRequirements
          showInvalidRequirements={passwordWasBlurred}
          required
        />

        <div className={`${authStyles.options} ${styles.options}`}>
          <Checkbox
            id="register-remember-me"
            name="rememberMe"
            label="Lembrar-me"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            disabled={status !== 'idle'}
          />
        </div>

        {formError && (
          <AuthStatusMessage type="error">{formError}</AuthStatusMessage>
        )}

        {status === 'success' && (
          <AuthStatusMessage type="success">
            Usuário cadastrado com sucesso.
          </AuthStatusMessage>
        )}

        <Button
          className={authStyles.submit}
          type="submit"
          disabled={!passwordIsValid || status !== 'idle'}
          aria-busy={isSubmitting}
        >
          <span>{isSubmitting ? 'Cadastrando...' : 'Cadastrar'}</span>
          <span aria-hidden="true">→</span>
        </Button>
      </form>

      <AuthDivider />
      <SocialLoginGroup />

      <div className={styles.loginLink}>
        <span>Já tem conta?</span>
        <a href="/">
          Faça seu login!
          <img src="/assets/auth/login.svg" alt="" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
