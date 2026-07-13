import { LoginPage } from './pages/LoginPage/LoginPage';
import { RecoverPasswordPage } from './pages/RecoverPasswordPage/RecoverPasswordPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage/ResetPasswordPage';

function App() {
  switch (window.location.pathname) {
    case '/cadastro':
      return <RegisterPage />;
    case '/recuperar-senha':
      return <RecoverPasswordPage />;
    case '/redefinir-senha':
      return <ResetPasswordPage />;
    default:
      return <LoginPage />;
  }
}

export default App;
