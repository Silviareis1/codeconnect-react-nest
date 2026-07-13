import { ResetPasswordForm } from '../../components/organisms/ResetPasswordForm/ResetPasswordForm';
import { AuthTemplate } from '../../components/templates/AuthTemplate/AuthTemplate';

export function ResetPasswordPage() {
  return (
    <AuthTemplate
      bannerSrc="/assets/auth/login-banner.png"
      bannerTabletSrc="/assets/auth/login-banner-tablet.png"
      bannerMobileSrc="/assets/auth/login-banner-mobile.png"
      bannerAlt="Pessoa trabalhando em um computador em um ambiente de tecnologia"
    >
      <ResetPasswordForm />
    </AuthTemplate>
  );
}
