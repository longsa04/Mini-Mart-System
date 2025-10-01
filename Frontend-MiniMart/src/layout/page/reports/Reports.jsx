import "./reports.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import posConfig from "../../../config/posConfig";
import { fetchOrders } from "../../../api/orders";
import { fetchProfitLossReport } from "../../../api/reports";
import { fetchLocations } from "../../../api/locations";

const { currencySymbol: CURRENCY_SYMBOL } = posConfig;

const TAB_KEYS = {
  PROFIT_LOSS: "profit-loss",
  SALES: "sales",
};

const formatCurrency = (value) =>
  CURRENCY_SYMBOL +
  Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });

const formatPercent = (value) =>
  new Intl.NumberFormat(undefined, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);

const formatDateInput = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) {
    return value;
  }
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatEnumLabel = (value) =>
  !value
    ? ""
    : String(value)
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");

const normalizeStatus = (value) => (value ? String(value).toUpperCase() : "");

const parseOrderDate = (value) => {
  if (!value) return null;
  const candidate = new Date(value);
  if (Number.isNaN(candidate.getTime())) {
    return null;
  }
  return candidate;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildSevenDayWindow = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    day.setHours(0, 0, 0, 0);
    return {
      date: day,
      key: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
    };
  });
};

const SalesSummary = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadOrders = useCallback(async (signal) => {
    setError(null);
    try {
      const data = await fetchOrders({ signal });
      if (signal?.aborted) {
        return;
      }
      setOrders(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }
      setError(err.message || "Unable to load sales data.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    loadOrders(controller.signal).finally(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });

    return () => controller.abort();
  }, [loadOrders]);

  const handleRefresh = () => {
    const controller = new AbortController();
    setLoading(true);
    loadOrders(controller.signal).finally(() => {
      setLoading(false);
    });
  };

  const today = useMemo(() => {
    const ref = new Date();
    ref.setHours(0, 0, 0, 0);
    return ref;
  }, []);

  const ordersWithDates = useMemo(() => {
    return orders
      .map((order) => ({
        ...order,
        orderDateObj: parseOrderDate(order?.orderDate),
      }))
      .filter((order) => order.orderDateObj != null);
  }, [orders]);

  const ordersToday = useMemo(() => {
    return ordersWithDates.filter((order) => isSameDay(order.orderDateObj, today));
  }, [ordersWithDates, today]);

  const paidOrdersToday = useMemo(
    () =>
      ordersToday.filter(
        (order) => normalizeStatus(order.paymentStatus) === "PAID"
      ),
    [ordersToday]
  );

  const grossSalesToday = useMemo(
    () =>
      paidOrdersToday.reduce(
        (sum, order) => sum + (Number(order.total) || 0),
        0
      ),
    [paidOrdersToday]
  );

  const transactionsToday = ordersToday.length;

  const pendingOrdersToday = useMemo(
    () =>
      ordersToday.filter(
        (order) => normalizeStatus(order.paymentStatus) !== "PAID"
      ),
    [ordersToday]
  );

  const pendingAmountToday = useMemo(
    () =>
      pendingOrdersToday.reduce(
        (sum, order) => sum + (Number(order.total) || 0),
        0
      ),
    [pendingOrdersToday]
  );

  const averageTicketToday = transactionsToday
    ? grossSalesToday / transactionsToday
    : 0;

  const sevenDayWindow = useMemo(() => buildSevenDayWindow(), []);

  const dailyTrend = useMemo(() => {
    return sevenDayWindow.map((day) => {
      const revenue = ordersWithDates.reduce((sum, order) => {
        if (
          isSameDay(order.orderDateObj, day.date) &&
          normalizeStatus(order.paymentStatus) === "PAID"
        ) {
          return sum + (Number(order.total) || 0);
        }
        return sum;
      }, 0);

      const transactions = ordersWithDates.filter((order) =>
        isSameDay(order.orderDateObj, day.date)
      ).length;

      return {
        ...day,
        revenue,
        transactions,
      };
    });
  }, [ordersWithDates, sevenDayWindow]);

  const statusBreakdown = useMemo(() => {
    if (ordersToday.length === 0) {
      return [];
    }
    const counts = new Map();
    ordersToday.forEach((order) => {
      const status = normalizeStatus(order.paymentStatus) || "UNKNOWN";
      counts.set(status, (counts.get(status) || 0) + 1);
    });

    const maxCount = Math.max(...counts.values(), 1);

    return Array.from(counts.entries())
      .map(([status, count]) => ({
        status,
        count,
        percent: Math.round((count / ordersToday.length) * 100),
        relative: (count / maxCount) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [ordersToday]);

  const peakHours = useMemo(() => {
    if (ordersToday.length === 0) {
      return [];
    }

    const byHour = new Map();

    ordersToday.forEach((order) => {
      const hour = order.orderDateObj.getHours();
      if (!byHour.has(hour)) {
        byHour.set(hour, { count: 0, revenue: 0 });
      }
      const bucket = byHour.get(hour);
      bucket.count += 1;
      if (normalizeStatus(order.paymentStatus) === "PAID") {
        bucket.revenue += Number(order.total) || 0;
      }
    });

    return Array.from(byHour.entries())
      .map(([hour, metrics]) => ({
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
        ...metrics,
      }))
      .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
      .slice(0, 6);
  }, [ordersToday]);

  const recentOrders = useMemo(() => {
    return [...ordersWithDates]
      .sort((a, b) => b.orderDateObj - a.orderDateObj)
      .slice(0, 10);
  }, [ordersWithDates]);

  const dailyTotalLast7 = useMemo(
    () => dailyTrend.reduce((sum, day) => sum + day.revenue, 0),
    [dailyTrend]
  );

  const paidOrderCountLast7 = useMemo(
    () =>
      ordersWithDates.filter((order) => {
        const status = normalizeStatus(order.paymentStatus);
        if (status !== "PAID") {
          return false;
        }
        return sevenDayWindow.some((day) => isSameDay(order.orderDateObj, day.date));
      }).length,
    [ordersWithDates, sevenDayWindow]
  );

  const averageTicketLast7 = paidOrderCountLast7
    ? dailyTotalLast7 / paidOrderCountLast7
    : 0;

  const maxDailyRevenue = Math.max(
    ...dailyTrend.map((day) => day.revenue),
    1
  );

  return (
    <div className="sales-summary-page">
      <header className="summary-header">
        <div>
          <h2 className="mb-1">Sales Summary</h2>
          <p className="text-secondary mb-0">
            Live sales metrics powered by POS orders from the Chbar Ampov branch.
          </p>
        </div>
        <div className="summary-header-actions">
          {lastUpdated && (
            <span className="badge bg-secondary-subtle text-secondary">
              Updated {lastUpdated.toLocaleString()}
            </span>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "Refreshing" : "Refresh data"}
          </button>
        </div>
      </header>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <section className="summary-kpis">
        <article className="summary-kpi-card">
          <div className="kpi-heading">Gross sales (today)</div>
          <div className="kpi-value">{formatCurrency(grossSalesToday)}</div>
          <div className="kpi-subtitle text-secondary">
            Includes paid orders processed today
          </div>
        </article>
        <article className="summary-kpi-card">
          <div className="kpi-heading">Transactions (today)</div>
          <div className="kpi-value">{formatNumber(transactionsToday)}</div>
          <div className="kpi-subtitle text-secondary">
            {paidOrdersToday.length} paid / {pendingOrdersToday.length} awaiting payment
          </div>
        </article>
        <article className="summary-kpi-card">
          <div className="kpi-heading">Average ticket</div>
          <div className="kpi-value">{formatCurrency(averageTicketToday)}</div>
          <div className="kpi-subtitle text-secondary">
            Last 7 days: {formatCurrency(averageTicketLast7)}
          </div>
        </article>
        <article className="summary-kpi-card">
          <div className="kpi-heading">Pending amount</div>
          <div className="kpi-value">{formatCurrency(pendingAmountToday)}</div>
          <div className="kpi-subtitle text-secondary">
            Orders that still require follow-up today
          </div>
        </article>
      </section>

      <section className="summary-grid">
        <article className="summary-panel">
          <div className="panel-header">
            <div>
              <h6 className="mb-0">Revenue trend</h6>
              <span className="text-secondary small">Paid revenue over the last 7 days</span>
            </div>
          </div>
          <div className="daily-bars">
            {dailyTrend.map((day) => (
              <div className="daily-bar" key={day.key}>
                <div className="daily-bar-chart">
                  <div
                    className="daily-bar-fill"
                    style={{ height: `${(day.revenue / maxDailyRevenue) * 100}%` }}
                  />
                </div>
                <div className="daily-bar-meta">
                  <span className="daily-bar-label">{day.label}</span>
                  <span className="daily-bar-value">
                    {formatCurrency(day.revenue)}
                  </span>
                  <span className="daily-bar-count">
                    {formatNumber(day.transactions)} orders
                  </span>
                </div>
              </div>
            ))}
            {dailyTrend.length === 0 && (
              <p className="text-secondary small mb-0">
                No order data is available yet.
              </p>
            )}
          </div>
        </article>

        <article className="summary-panel">
          <div className="panel-header">
            <div>
              <h6 className="mb-0">Status breakdown (today)</h6>
              <span className="text-secondary small">
                Share of orders by payment status
              </span>
            </div>
          </div>
          <div className="status-breakdown">
            {statusBreakdown.length === 0 && (
              <p className="text-secondary small mb-0">
                Orders for today will appear here as soon as they are created.
              </p>
            )}
            {statusBreakdown.map((status) => (
              <div className="status-row" key={status.status}>
                <div className="status-meta">
                  <span className="status-label">{status.status}</span>
                  <span className="status-count">
                    {formatNumber(status.count)} orders
                  </span>
                </div>
                <div className="status-bar">
                  <div
                    className="status-fill"
                    style={{ width: `${status.relative}%` }}
                  />
                </div>
                <span className="status-percent">{status.percent}%</span>
              </div>
            ))}
          </div>
        </article>

        <article className="summary-panel">
          <div className="panel-header">
            <div>
              <h6 className="mb-0">Peak hours (today)</h6>
              <span className="text-secondary small">
                Busiest register hours by order count
              </span>
            </div>
          </div>
          <div className="peak-hours">
            {peakHours.length === 0 && (
              <p className="text-secondary small mb-0">
                Hourly insights will show once orders are taken today.
              </p>
            )}
            {peakHours.map((slot) => (
              <div className="peak-hours-row" key={slot.hour}>
                <div>
                  <div className="fw-semibold">{slot.label}</div>
                  <div className="text-secondary small">
                    {formatNumber(slot.count)} orders
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-primary-subtle text-primary">
                    {formatCurrency(slot.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="summary-panel">
        <div className="panel-header">
          <div>
            <h6 className="mb-0">Recent orders</h6>
            <span className="text-secondary small">
              Latest 10 orders across the branch
            </span>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 summary-table">
            <thead className="table-light">
              <tr>
                <th scope="col">Invoice</th>
                <th scope="col">Customer</th>
                <th scope="col" className="text-end">
                  Total
                </th>
                <th scope="col">Status</th>
                <th scope="col">Order date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-4">
                    No orders have been recorded yet.
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.orderId ?? order.id}>
                  <td>{order.orderId ?? order.id ?? ""}</td>
                  <td>{order?.customer?.name ?? "Walk-in"}</td>
                  <td className="text-end">{formatCurrency(order.total)}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        normalizeStatus(order.paymentStatus) === "PAID"
                          ? "success"
                          : normalizeStatus(order.paymentStatus) === "PENDING"
                          ? "warning"
                          : "secondary"
                      }`}
                    >
                      {normalizeStatus(order.paymentStatus) || ""}
                    </span>
                  </td>
                  <td>
                    {order.orderDateObj?.toLocaleString(undefined, {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) ?? ""}
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-4">
                    Loading orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const ProfitLossReport = () => {
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setMonth(start.getMonth() - 1);
    return {
      startDate: formatDateInput(start),
      endDate: formatDateInput(today),
      locationId: "",
    };
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchLocations({ signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setLocations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        setLocations([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      setError("Start date must be on or before the end date.");
      setReport(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setLastUpdated(null);

    fetchProfitLossReport({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      locationId: filters.locationId || undefined,
      signal: controller.signal,
    })
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setReport(data ?? null);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }
        setError(
          err.message || "Unable to load profit and loss report."
        );
        setReport(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters.startDate, filters.endDate, filters.locationId, refreshKey]);

  const locationOptions = useMemo(
    () =>
      (locations ?? []).map((location) => ({
        id:
          location?.locationId === undefined ||
          location?.locationId === null
            ? ""
            : String(location.locationId),
        name:
          location?.name ??
          `Location ${location?.locationId ?? ""}`,
      })),
    [locations]
  );

  const activeLocationLabel = useMemo(() => {
    if (!filters.locationId) {
      return "All locations";
    }
    const match = locationOptions.find(
      (option) => option.id === filters.locationId
    );
    return match?.name ?? "Selected location";
  }, [filters.locationId, locationOptions]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const totalRevenue = Number(report?.totalRevenue ?? 0);
  const totalDiscounts = Number(report?.totalDiscounts ?? 0);
  const costOfGoodsSold = Number(report?.costOfGoodsSold ?? 0);
  const grossProfit = Number(report?.grossProfit ?? 0);
  const totalExpenses = Number(report?.totalExpenses ?? 0);
  const netProfit = Number(report?.netProfit ?? 0);
  const productBreakdown = report?.productBreakdown ?? [];
  const expenseBreakdown = report?.expenseBreakdown ?? [];

  const grossMargin = totalRevenue !== 0 ? grossProfit / totalRevenue : 0;
  const netMargin = totalRevenue !== 0 ? netProfit / totalRevenue : 0;
  const discountRate = totalRevenue !== 0 ? totalDiscounts / totalRevenue : 0;
  const expenseShare = totalRevenue !== 0 ? totalExpenses / totalRevenue : 0;
  const costShare = totalRevenue !== 0 ? costOfGoodsSold / totalRevenue : 0;

  const topProduct = productBreakdown[0];
  const topExpense = expenseBreakdown[0];

  const resolvedStart = report?.startDate ?? filters.startDate;
  const resolvedEnd = report?.endDate ?? filters.endDate;

  const periodLabel = useMemo(() => {
    const formattedStart = formatDisplayDate(resolvedStart);
    const formattedEnd = formatDisplayDate(resolvedEnd);
    if (formattedStart && formattedEnd) {
      return `${formattedStart} – ${formattedEnd}`;
    }
    return formattedStart || formattedEnd || "";
  }, [resolvedStart, resolvedEnd]);

  const isReportEmpty =
    !loading &&
    !error &&
    report &&
    totalRevenue === 0 &&
    totalExpenses === 0 &&
    costOfGoodsSold === 0 &&
    productBreakdown.length === 0 &&
    expenseBreakdown.length === 0;

  return (
    <div className="profit-loss-report">
      <header className="summary-header">
        <div>
          <h2 className="mb-1">Profit &amp; Loss</h2>
          <p className="text-secondary mb-2">
            Combined revenue, cost of goods, and expense insights sourced from
            paid orders, purchase orders, and expense tracking.
          </p>
          <div className="profit-loss-meta">
            {periodLabel && <span>Period: {periodLabel}</span>}
            <span>Location: {activeLocationLabel}</span>
          </div>
        </div>
        <div className="summary-header-actions profit-loss-actions">
          {lastUpdated && (
            <span className="badge bg-secondary-subtle text-secondary">
              Updated {lastUpdated.toLocaleString()}
            </span>
          )}
          <div className="profit-loss-filters">
            <div className="profit-loss-field">
              <label htmlFor="profit-loss-start">Start date</label>
              <input
                id="profit-loss-start"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-control form-control-sm"
                max={filters.endDate || undefined}
              />
            </div>
            <div className="profit-loss-field">
              <label htmlFor="profit-loss-end">End date</label>
              <input
                id="profit-loss-end"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-control form-control-sm"
                min={filters.startDate || undefined}
              />
            </div>
            <div className="profit-loss-field">
              <label htmlFor="profit-loss-location">Location</label>
              <select
                id="profit-loss-location"
                name="locationId"
                value={filters.locationId}
                onChange={handleFilterChange}
                className="form-select form-select-sm"
              >
                <option value="">All locations</option>
                {locationOptions.map((option) => (
                  <option key={option.id || "default"} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "Refreshing" : "Refresh report"}
          </button>
        </div>
      </header>

      {error && <div className="alert alert-danger mb-0">{error}</div>}
      {isReportEmpty && (
        <div className="alert alert-secondary mb-0">
          No profit and loss data is available for the selected filters yet.
        </div>
      )}

      <section className="summary-kpis">
        <article className="summary-kpi-card">
          <div className="kpi-heading">Total revenue</div>
          <div className="kpi-value">{formatCurrency(totalRevenue)}</div>
          <div className="kpi-subtitle text-secondary">
            Gross sales from paid orders within the selected period
          </div>
        </article>
        <article className="summary-kpi-card">
          <div className="kpi-heading">Discounts applied</div>
          <div className="kpi-value">{formatCurrency(totalDiscounts)}</div>
          <div className="kpi-subtitle text-secondary">
            Discount rate: {formatPercent(discountRate)} of revenue
          </div>
        </article>
        <article className="summary-kpi-card">
          <div className="kpi-heading">Cost of goods sold</div>
          <div className="kpi-value">{formatCurrency(costOfGoodsSold)}</div>
          <div className="kpi-subtitle text-secondary">
            Share of revenue: {formatPercent(costShare)}
          </div>
        </article>
        <article className="summary-kpi-card">
          <div className="kpi-heading">Gross profit</div>
          <div className="kpi-value">{formatCurrency(grossProfit)}</div>
          <div className="kpi-subtitle text-secondary">
            Gross margin: {formatPercent(grossMargin)}
          </div>
        </article>
        <article className="summary-kpi-card">
          <div className="kpi-heading">Operating expenses</div>
          <div className="kpi-value">{formatCurrency(totalExpenses)}</div>
          <div className="kpi-subtitle text-secondary">
            Expense share: {formatPercent(expenseShare)} of revenue
          </div>
        </article>
        <article className="summary-kpi-card">
          <div className="kpi-heading">Net profit</div>
          <div
            className={`kpi-value ${
              netProfit >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatCurrency(netProfit)}
          </div>
          <div className="kpi-subtitle text-secondary">
            Net margin: {formatPercent(netMargin)}
          </div>
        </article>
      </section>

      <section className="summary-panel">
        <div className="panel-header">
          <div>
            <h6 className="mb-0">Profitability insights</h6>
            <span className="text-secondary small">
              Ratios and highlights derived from aggregated totals
            </span>
          </div>
        </div>
        <ul className="profit-loss-insights">
          <li>
            <strong>Gross margin:</strong> {formatPercent(grossMargin)} of
            revenue after accounting for cost of goods.
          </li>
          <li>
            <strong>Net margin:</strong> {formatPercent(netMargin)} retained
            after expenses.
          </li>
          <li>
            <strong>Top product:</strong>{" "}
            {topProduct
              ? `${topProduct.productName} (${formatCurrency(
                  topProduct.grossProfit
                )} gross profit)`
              : "No product sales recorded."}
          </li>
          <li>
            <strong>Top expense category:</strong>{" "}
            {topExpense
              ? `${formatEnumLabel(topExpense.category)} (${formatCurrency(
                  topExpense.totalAmount
                )})`
              : "No expenses recorded."}
          </li>
        </ul>
      </section>

      <section className="profit-loss-grid">
        <article className="summary-panel profit-loss-table">
          <div className="panel-header">
            <div>
              <h6 className="mb-0">Product profitability</h6>
              <span className="text-secondary small">
                Revenue, costs, and gross profit per product
              </span>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" className="text-end">
                    Qty sold
                  </th>
                  <th scope="col" className="text-end">
                    Revenue
                  </th>
                  <th scope="col" className="text-end">
                    Cost of goods
                  </th>
                  <th scope="col" className="text-end">
                    Gross profit
                  </th>
                </tr>
              </thead>
              <tbody>
                {productBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={5} className="profit-loss-empty">
                      No product sales were recorded for this period.
                    </td>
                  </tr>
                )}
                {productBreakdown.map((product) => (
                  <tr key={product.productId ?? product.productName}>
                    <td>{product.productName}</td>
                    <td className="text-end">
                      {formatNumber(product.quantitySold)}
                    </td>
                    <td className="text-end">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="text-end">
                      {formatCurrency(product.costOfGoods)}
                    </td>
                    <td
                      className={`text-end ${
                        product.grossProfit >= 0
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {formatCurrency(product.grossProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="summary-panel profit-loss-table">
          <div className="panel-header">
            <div>
              <h6 className="mb-0">Expense breakdown</h6>
              <span className="text-secondary small">
                Total expense amount by category for the selected period
              </span>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col" className="text-end">
                    Total amount
                  </th>
                  <th scope="col" className="text-end">
                    Share of expenses
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={3} className="profit-loss-empty">
                      No expenses were recorded for this period.
                    </td>
                  </tr>
                )}
                {expenseBreakdown.map((entry) => {
                  const share =
                    totalExpenses === 0
                      ? 0
                      : Number(entry.totalAmount ?? 0) / totalExpenses;
                  return (
                    <tr key={entry.category ?? "uncategorized"}>
                      <td>{formatEnumLabel(entry.category) || "Other"}</td>
                      <td className="text-end">
                        {formatCurrency(entry.totalAmount)}
                      </td>
                      <td className="text-end">
                        {formatPercent(share)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.PROFIT_LOSS);

  const tabs = [
    { key: TAB_KEYS.PROFIT_LOSS, label: "Profit & Loss" },
    { key: TAB_KEYS.SALES, label: "Sales Summary" },
  ];

  return (
    <div className="reports-page">
      <div className="reports-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`reports-tab ${
              activeTab === tab.key ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
            aria-pressed={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === TAB_KEYS.PROFIT_LOSS ? (
        <ProfitLossReport />
      ) : (
        <SalesSummary />
      )}
    </div>
  );
};

export default Reports;
