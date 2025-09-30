import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RequireRole = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default RequireRole;
