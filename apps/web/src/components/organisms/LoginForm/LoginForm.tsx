import { useState, type FormEvent } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { AuthDivider } from '../../molecules/AuthDivider/AuthDivider';
import { FormField } from '../../molecules/FormField/FormField';
import { SocialLoginGroup } from '../SocialLoginGroup/SocialLoginGroup';
import authStyles from '../AuthForm/AuthForm.module.css';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const [rememberMe, setRememberMe] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section className={authStyles.content} aria-labelledby="login-title">
      <header className={authStyles.header}>
        <h1 id="login-title">Login</h1>
        <p>Boas-vindas! Faça seu login.</p>
      </header>

      <form className={authStyles.form} onSubmit={handleSubmit}>
        <FormField id="username" label="Email ou usuário" name="username" autoComplete="username" defaultValue="usuario123" required />
        <FormField id="password" label="Senha" name="password" type="password" autoComplete="current-password" defaultValue="123456" required />

        <div className={authStyles.options}>
          <Checkbox id="remember-me" name="rememberMe" label="Lembrar-me" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
          <button className={styles.forgotPassword} type="button">Esqueci a senha</button>
        </div>

        <Button className={authStyles.submit} type="submit">
          <span>Login</span>
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
