import { RegisterForm } from '../../components/organisms/RegisterForm/RegisterForm';
import { AuthTemplate } from '../../components/templates/AuthTemplate/AuthTemplate';

export function RegisterPage() {
  return (
    <AuthTemplate
      bannerSrc="/assets/auth/register-banner.png"
      bannerTabletSrc="/assets/auth/register-banner-tablet.png"
      bannerMobileSrc="/assets/auth/register-banner-mobile.png"
      bannerAlt="Pessoa usando um computador em um ambiente de tecnologia"
      layout="extended"
    >
      <RegisterForm />
    </AuthTemplate>
  );
}
