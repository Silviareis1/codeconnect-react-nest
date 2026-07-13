import { useState, type FormEvent } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { AuthDivider } from '../../molecules/AuthDivider/AuthDivider';
import { FormField } from '../../molecules/FormField/FormField';
import authStyles from '../AuthForm/AuthForm.module.css';
import { SocialLoginGroup } from '../SocialLoginGroup/SocialLoginGroup';
import styles from './RegisterForm.module.css';

export function RegisterForm() {
  const [rememberMe, setRememberMe] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section className={`${authStyles.content} ${styles.content}`} aria-labelledby="register-title">
      <header className={authStyles.header}>
        <h1 id="register-title">Cadastro</h1>
        <p>Olá! Preencha seus dados.</p>
      </header>

      <form className={authStyles.form} onSubmit={handleSubmit}>
        <FormField id="name" label="Nome" name="name" autoComplete="name" defaultValue="Nome completo" required />
        <FormField id="email" label="Email" name="email" type="email" autoComplete="email" defaultValue="Digite seu email" required />
        <FormField id="register-password" label="Senha" name="password" type="password" autoComplete="new-password" defaultValue="123456" required />

        <div className={`${authStyles.options} ${styles.options}`}>
          <Checkbox id="register-remember-me" name="rememberMe" label="Lembrar-me" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
        </div>

        <Button className={authStyles.submit} type="submit">
          <span>Cadastrar</span>
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
