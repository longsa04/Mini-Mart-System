export const ROLE = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
};

export const ROLE_DEFAULT_ROUTE = {
  [ROLE.ADMIN]: "/",
  [ROLE.MANAGER]: "/",
  [ROLE.CASHIER]: "/pos",
};

export const buildMenuSections = (role, { pendingOrders = 0, lowStockCount = 0 } = {}) => {
  switch (role) {
    case ROLE.CASHIER:
      return [
        {
          id: "operations",
          title: "Operations",
          defaultOpen: true,
          items: [
            {
              label: "POS",
              icon: "fa-solid fa-cash-register",
              path: "/pos",
            },
          ],
        },
      ];
    case ROLE.MANAGER:
      return [
        {
          id: "operations",
          title: "Operations",
          defaultOpen: true,
          items: [
            { label: "Dashboard", icon: "fa-solid fa-gauge", path: "/" },
            {
              label: "POS",
              icon: "fa-solid fa-cash-register",
              path: "/pos",
            },
          ],
        },
        {
          id: "people",
          title: "People",
          items: [
            {
              label: "Employees",
              icon: "fa-solid fa-user-group",
              path: "/people/employees",
            },
          ],
        },
        {
          id: "reports",
          title: "Reports",
          headerBadge: pendingOrders ? `${pendingOrders}` : null,
          items: [
            {
              label: "Sales Summary",
              icon: "fa-solid fa-chart-line",
              path: "/reports/sales",
              badge: pendingOrders ? `${pendingOrders}` : null,
            },
            {
              label: "Activity Log",
              icon: "fa-solid fa-clipboard-list",
              path: "/reports/activity",
            },
          ],
        },
      ];
    case ROLE.ADMIN:
    default:
      return [
        {
          id: "operations",
          title: "Operations",
          defaultOpen: true,
          items: [
            { label: "Dashboard", icon: "fa-solid fa-gauge", path: "/" },
            {
              label: "POS",
              icon: "fa-solid fa-cash-register",
              path: "/pos",
            },
          ],
        },
        {
          id: "inventory",
          title: "Inventory Control",
          headerBadge: lowStockCount ? `${lowStockCount}` : null,
          items: [
            {
              label: "Inventory Overview",
              icon: "fa-solid fa-warehouse",
              path: "/inventory",
              badge: lowStockCount ? `${lowStockCount}` : null,
            },
            {
              label: "Product Catalog",
              icon: "fa-solid fa-box-open",
              path: "/inventory/products",
            },
            {
              label: "Category Manager",
              icon: "fa-solid fa-tags",
              path: "/inventory/categories",
            },
            {
              label: "Stock Tracker",
              icon: "fa-solid fa-layer-group",
              path: "/inventory/stock-levels",
            },
          ],
        },
        {
          id: "people",
          title: "People",
          items: [
            {
              label: "Employees",
              icon: "fa-solid fa-user-group",
              path: "/people/employees",
            },
            {
              label: "User & Roles",
              icon: "fa-solid fa-id-badge",
              path: "/people/users",
            },
          ],
        },
        {
          id: "purchasing",
          title: "Purchasing",
          items: [
            {
              label: "Suppliers",
              icon: "fa-solid fa-truck-field",
              path: "/purchasing/suppliers",
            },
            {
              label: "Purchase Orders",
              icon: "fa-solid fa-file-invoice",
              path: "/purchasing/purchase-orders",
            },
          ],
        },
        {
          id: "reports",
          title: "Reports",
          headerBadge: pendingOrders ? `${pendingOrders}` : null,
          items: [
            {
              label: "Sales Summary",
              icon: "fa-solid fa-chart-line",
              path: "/reports/sales",
              badge: pendingOrders ? `${pendingOrders}` : null,
            },
            {
              label: "Activity Log",
              icon: "fa-solid fa-clipboard-list",
              path: "/reports/activity",
            },
          ],
        },
        {
          id: "settings",
          title: "Settings",
          items: [
            {
              label: "Branch Details",
              icon: "fa-solid fa-shop",
              path: "/settings/branch",
            },
            {
              label: "Receipt Branding",
              icon: "fa-solid fa-receipt",
              path: "/settings/receipts",
            },
          ],
        },
      ];
  }
};
