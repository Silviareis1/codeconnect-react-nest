import { RecoverPasswordForm } from '../../components/organisms/RecoverPasswordForm/RecoverPasswordForm';
import { AuthTemplate } from '../../components/templates/AuthTemplate/AuthTemplate';

export function RecoverPasswordPage() {
  return (
    <AuthTemplate
      bannerSrc="/assets/auth/login-banner.png"
      bannerTabletSrc="/assets/auth/login-banner-tablet.png"
      bannerMobileSrc="/assets/auth/login-banner-mobile.png"
      bannerAlt="Pessoa trabalhando em um computador em um ambiente de tecnologia"
    >
      <RecoverPasswordForm />
    </AuthTemplate>
  );
}
