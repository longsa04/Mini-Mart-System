import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ROLE_DEFAULT_ROUTE } from "../../../config/permissions";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = () => {
    const target = user ? ROLE_DEFAULT_ROUTE[user.role] ?? "/" : "/login";
    navigate(target, { replace: true });
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="text-center p-5 bg-white shadow-sm rounded">
        <h1 className="display-6 mb-3">Access denied</h1>
        <p className="text-muted mb-4">
          You do not have permission to view this page. Please use the navigation menu to
          access a permitted section.
        </p>
        <button type="button" className="btn btn-primary" onClick={handleNavigate}>
          Go to dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
