import { LoginForm } from '../../components/organisms/LoginForm/LoginForm';
import { AuthTemplate } from '../../components/templates/AuthTemplate/AuthTemplate';

export function LoginPage() {
  return (
    <AuthTemplate bannerSrc="/assets/auth/login-banner.png" bannerAlt="Pessoa trabalhando em um computador em um ambiente de tecnologia">
      <LoginForm />
    </AuthTemplate>
  );
}
