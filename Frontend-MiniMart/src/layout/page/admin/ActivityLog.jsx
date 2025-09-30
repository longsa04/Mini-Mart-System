import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchActivityLogs } from "../../../api/activityLogs";

const AUTO_REFRESH_INTERVAL_MS = 10000;

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const formatDisplayDate = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed) {
    return null;
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNumber = (value) => Number(value ?? 0).toLocaleString();

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangeError, setRangeError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const hasStart = Boolean(startDate);
  const hasEnd = Boolean(endDate);

  const isRangeValid = useMemo(() => {
    if (!hasStart || !hasEnd) {
      return true;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }, [endDate, hasEnd, hasStart, startDate]);

  const totalLogs = logs.length;
  const uniqueUsers = useMemo(() => {
    const set = new Set();
    logs.forEach((log) => {
      const username = log?.user?.username ?? "System";
      set.add(username);
    });
    return set.size;
  }, [logs]);

  const topActor = useMemo(() => {
    if (logs.length === 0) {
      return null;
    }
    const counts = new Map();
    logs.forEach((log) => {
      const key = log?.user?.username ?? "System";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const [username, count] = [...counts.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];
    return { username, count };
  }, [logs]);

  const latestLog = logs[0] ?? null;

  const derivedRange = useMemo(() => {
    if (logs.length === 0) {
      return { start: null, end: null };
    }
    return {
      start: logs[logs.length - 1]?.logDate ?? null,
      end: logs[0]?.logDate ?? null,
    };
  }, [logs]);

  const displayRangeStart = formatDisplayDate(startDate || derivedRange.start);
  const displayRangeEnd = formatDisplayDate(endDate || derivedRange.end);
  const autoSelectedRange = logs.length > 0 && (!hasStart || !hasEnd);

  const loadLogs = useCallback(
    async (signal) => {
      const data = await fetchActivityLogs({
        startDate: hasStart ? startDate : undefined,
        endDate: hasEnd ? endDate : undefined,
        signal,
      });
      setLogs(data);
      setLastUpdated(new Date());
    },
    [endDate, hasEnd, hasStart, startDate]
  );

  useEffect(() => {
    if (!isRangeValid) {
      setRangeError("Start date must be on or before the end date.");
      setLoading(false);
      setLogs([]);
      setLastUpdated(null);
      return;
    }

    setRangeError(null);
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    loadLogs(controller.signal)
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }
        setError(err.message || "Unable to load activity logs.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [endDate, isRangeValid, loadLogs, refreshToken, startDate]);

  useEffect(() => {
    if (!isRangeValid) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (loadingRef.current) {
        return;
      }
      setRefreshToken((value) => value + 1);
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isRangeValid]);

  const handleRefresh = () => {
    setRefreshToken((value) => value + 1);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleClearRange = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="page">
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="mb-1">Activity Log</h2>
          <p className="text-secondary mb-0">
            Review the actions recorded by Mini Mart staff across the selected
            date range. Logs are sourced directly from the CMSPOS backend audit
            trail.
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div>
            <label htmlFor="activity-log-start" className="form-label mb-1">
              Start
            </label>
            <input
              id="activity-log-start"
              type="date"
              className="form-control"
              value={startDate}
              max={endDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div>
            <label htmlFor="activity-log-end" className="form-label mb-1">
              End
            </label>
            <input
              id="activity-log-end"
              type="date"
              className="form-control"
              value={endDate}
              min={startDate}
              onChange={handleEndDateChange}
            />
          </div>
          <div className="d-flex flex-column align-items-stretch">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRefresh}
              disabled={loading || !isRangeValid}
            >
              {loading ? "Loading" : "Refresh"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary mt-2"
              onClick={handleClearRange}
              disabled={loading || (!hasStart && !hasEnd)}
            >
              Show entire history
            </button>
            <span className="text-secondary small text-nowrap text-lg-end">
              Auto-refreshes every {AUTO_REFRESH_INTERVAL_MS / 1000} seconds
            </span>
          </div>
        </div>
      </div>

      {rangeError && <div className="alert alert-warning">{rangeError}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase small fw-semibold mb-2">
                Entries
              </div>
              <div className="fs-4 fw-semibold">{formatNumber(totalLogs)}</div>
              <div className="text-secondary small">
                Between {displayRangeStart || "-"} and {displayRangeEnd || "-"}
                {autoSelectedRange ? " (auto-selected)" : ""}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase small fw-semibold mb-2">
                Unique users
              </div>
              <div className="fs-4 fw-semibold">
                {formatNumber(uniqueUsers)}
              </div>
              <div className="text-secondary small">
                Including system events
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase small fw-semibold mb-2">
                Most active
              </div>
              <div className="fs-5 fw-semibold">
                {topActor ? topActor.username : "No activity"}
              </div>
              <div className="text-secondary small">
                {topActor ? `${formatNumber(topActor.count)} entries` : ""}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase small fw-semibold mb-2">
                Last update
              </div>
              <div className="fs-6 fw-semibold">
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "Not loaded"}
              </div>
              <div className="text-secondary small">
                {lastUpdated ? lastUpdated.toLocaleDateString() : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {latestLog && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <div className="text-secondary text-uppercase small fw-semibold mb-1">
                Latest activity
              </div>
              <div className="fs-5 fw-semibold">
                {latestLog?.user?.username ?? "System"}
              </div>
              <div className="text-secondary small">
                {latestLog?.user?.role ?? ""}
              </div>
            </div>
            <div className="flex-grow-1 text-md-center">
              <div className="fw-semibold">{latestLog?.action}</div>
              <div className="text-secondary small">
                Logged {formatDateTime(latestLog?.logDate)}
              </div>
            </div>
            <div className="text-md-end">
              <span className="badge bg-primary-subtle text-primary">
                #{latestLog?.id ?? ""}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <div className="fw-semibold">Detailed log</div>
            {loading && <span className="text-secondary small">Loading…</span>}
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Log ID</th>
                  <th scope="col">User</th>
                  <th scope="col">Action</th>
                  <th scope="col">Logged At</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row?.id ?? `${row?.logDate}-${row?.action}`}>
                    <td className="text-nowrap">{row?.id ?? ""}</td>
                    <td>
                      <div className="fw-semibold">
                        {row?.user?.username ?? "System"}
                      </div>
                      <div className="text-secondary small">
                        {row?.user?.role ?? ""}
                      </div>
                      {row?.user?.email && (
                        <div className="text-secondary small">
                          {row.user.email}
                        </div>
                      )}
                    </td>
                    <td>{row?.action}</td>
                    <td className="text-nowrap">
                      {formatDateTime(row?.logDate)}
                    </td>
                  </tr>
                ))}
                {!loading && logs.length === 0 && !error && !rangeError && (
                  <tr>
                    <td colSpan={4} className="text-center text-secondary py-4">
                      No activity recorded for the selected range.
                    </td>
                  </tr>
                )}
                {loading && logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-secondary py-4">
                      Loading activity logs…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
