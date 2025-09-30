import { Outlet, useNavigate } from "react-router-dom";
import Menu from "./menu/Menu";
import { useAuth } from "../context/AuthContext";
import { ROLE_DEFAULT_ROUTE } from "../config/permissions";

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.username ?? "User";
  const displayRole = user?.role ?? "";
  const roleLabel = displayRole ? displayRole.charAt(0) + displayRole.slice(1).toLowerCase() : "";

  const handleLogoClick = () => {
    if (user?.role) {
      const nextRoute = ROLE_DEFAULT_ROUTE[user.role] ?? "/";
      navigate(nextRoute);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="app">
      <div className="d-flex">
        <div className="app-menu d-none d-xxl-block">
          <Menu role={user?.role} />
        </div>
        <div className="content d-block">
          <div className="app-header end px-3">
            <div className="end w-100">
              <button
                type="button"
                className="menu-btn fs-5 mx-3 pointer"
                onClick={handleLogoClick}
                aria-label="Go to default page"
              >
                <i className="fa-solid fa-bars"></i>
              </button>
              <div className="app-defualt-user d-flex align-items-center gap-3">
                <div className="d-block text-end">
                  <div className="fw-semibold">{displayName}</div>
                  <div className="text-secondary font-12 text-uppercase">{roleLabel}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
          <div className="app-page p-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
