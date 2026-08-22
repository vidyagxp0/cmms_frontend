import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-3 text-gray-500">Page not found.</p>
      <Link to="/login" className="mt-6 text-sm font-medium text-blue-600 hover:underline">
        Go to Login
      </Link>
    </div>
  );
};

export default NotFound;
