import "./menu.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchOrders } from "../../api/orders";
import { fetchStockLevels } from "../../api/inventory";
import { ROLE, ROLE_DEFAULT_ROUTE, buildMenuSections } from "../../config/permissions";

const LOW_STOCK_THRESHOLD = 15;

const Menu = ({ role = ROLE.ADMIN }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    const shouldLoadOrders = role === ROLE.ADMIN || role === ROLE.MANAGER;
    const shouldLoadStock = role === ROLE.ADMIN;

    if (!shouldLoadOrders && !shouldLoadStock) {
      setPendingOrders(0);
      setLowStockCount(0);
      return () => controller.abort();
    }

    const loadIndicators = async () => {
      try {
        const [ordersData, stockData] = await Promise.all([
          shouldLoadOrders
            ? fetchOrders({ signal: controller.signal }).catch(() => [])
            : Promise.resolve([]),
          shouldLoadStock
            ? fetchStockLevels({ signal: controller.signal }).catch(() => [])
            : Promise.resolve([]),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        const pending = (ordersData ?? []).filter((order) => {
          const status = String(order?.paymentStatus ?? "").toUpperCase();
          return status !== "PAID";
        }).length;

        const lowStock = (stockData ?? []).filter((item) => {
          const qty = Number(item?.quantity ?? 0);
          return Number.isFinite(qty) && qty <= LOW_STOCK_THRESHOLD;
        }).length;

        setPendingOrders(pending);
        setLowStockCount(lowStock);
      } catch (error) {
        if (error.name !== "AbortError") {
          setPendingOrders(0);
          setLowStockCount(0);
        }
      }
    };

    loadIndicators();

    return () => controller.abort();
  }, [role]);

  const menuSections = useMemo(
    () => buildMenuSections(role ?? ROLE.ADMIN, { pendingOrders, lowStockCount }),
    [role, pendingOrders, lowStockCount]
  );

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      menuSections.forEach((section) => {
        if (typeof next[section.id] === "undefined") {
          next[section.id] = Boolean(section.defaultOpen);
        }
      });
      return next;
    });
  }, [menuSections]);

  useEffect(() => {
    const activeSection = menuSections.find((section) =>
      section.items.some((item) => {
        if (item.path === "/") {
          return location.pathname === "/";
        }
        return (
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/")
        );
      })
    );

    if (activeSection) {
      setOpenSections((prev) => {
        if (prev[activeSection.id]) {
          return prev;
        }
        return { ...prev, [activeSection.id]: true };
      });
    }
  }, [location.pathname, menuSections]);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const defaultPath = ROLE_DEFAULT_ROUTE[role] ?? "/";

  const handleClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <nav className="menu-compact" aria-label="Mini Mart navigation">
      <button
        type="button"
        className="app-logo p-2"
        onClick={() => handleClick(defaultPath)}
        aria-label="Go to dashboard"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/128/11272/11272927.png"
          alt="Mini Mart logo"
          className="h-100"
        />
        <span className="px-3 fw-bold fs-6">Mini Mart</span>
      </button>

      {menuSections.map((section) => {
        const isOpen = Boolean(openSections[section.id]);
        const sectionId = `menu-section-${section.id}`;

        return (
          <div className="menu-section" key={section.id}>
            <button
              type="button"
              className={
                "menu-section-toggle" + (isOpen ? " open" : "")
              }
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
              aria-controls={sectionId}
            >
              <span className="menu-section-title-text">{section.title}</span>
              <span className="menu-toggle-meta">
                {section.headerBadge && (
                  <span className="menu-badge">{section.headerBadge}</span>
                )}
                <i
                  className={`fa-solid ${
                    isOpen ? "fa-chevron-down" : "fa-chevron-right"
                  }`}
                  aria-hidden="true"
                ></i>
              </span>
            </button>
            <div
              id={sectionId}
              className={`menu-sublist${isOpen ? " open" : " collapsed"}`}
              role="menu"
            >
              {section.items.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={
                    "menu-item" + (isActive(item.path) ? " active" : "")
                  }
                  onClick={() => handleClick(item.path)}
                  aria-current={isActive(item.path) ? "page" : undefined}
                >
                  <span className="menu-icon">
                    <i className={item.icon}></i>
                  </span>
                  <span className="menu-label">{item.label}</span>
                  {item.badge && <span className="menu-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
};

export default Menu;

