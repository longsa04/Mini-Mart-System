import "./reports.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import posConfig from "../../../config/posConfig";
import { fetchOrders } from "../../../api/orders";

const { currencySymbol: CURRENCY_SYMBOL } = posConfig;

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
            {loading ? "Refreshing…" : "Refresh data"}
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
                  <td>{order.orderId ?? order.id ?? "—"}</td>
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
                      {normalizeStatus(order.paymentStatus) || "—"}
                    </span>
                  </td>
                  <td>
                    {order.orderDateObj?.toLocaleString(undefined, {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) ?? "—"}
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-4">
                    Loading orders…
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

export default SalesSummary;
