import AuthForm from "../components/auth/AuthForm";

type RegisterProps = {
  onNavigate: (path: string) => void;
};

function Register({ onNavigate }: RegisterProps) {
  return <AuthForm mode="register" onNavigate={onNavigate} />;
}

export default Register;