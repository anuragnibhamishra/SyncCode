import AuthForm from "../components/auth/AuthForm";

type LoginProps = {
  onNavigate: (path: string) => void;
};

function Login({ onNavigate }: LoginProps) {
  return <AuthForm mode="login" onNavigate={onNavigate} />;
}

export default Login;