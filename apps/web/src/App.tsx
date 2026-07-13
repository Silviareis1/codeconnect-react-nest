import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';

function App() {
  return window.location.pathname === '/cadastro' ? <RegisterPage /> : <LoginPage />;
}

export default App;
