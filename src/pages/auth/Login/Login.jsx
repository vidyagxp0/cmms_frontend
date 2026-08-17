import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
// import { appConfig } from "../../config/appConfig";
import { appConfig } from "../../../config/appConfig";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    navigate("/admin/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-5 rounded-2xl border bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{appConfig.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to continue</p>
        </div>

        <Input id="email" label="Email" type="email" placeholder="you@example.com" />
        <Input id="password" label="Password" type="password" placeholder="••••••••" />

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default Login;
