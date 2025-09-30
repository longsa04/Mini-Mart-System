import { API_BASE_URL, buildAuthHeaders, handleJsonResponse } from "./http";

const activityLogsEndpoint = new URL("/activity-logs", API_BASE_URL).toString();

export async function fetchActivityLogs({ startDate, endDate, signal } = {}) {
  const url = new URL(activityLogsEndpoint);
  if (startDate) {
    url.searchParams.set("start", startDate);
  }
  if (endDate) {
    url.searchParams.set("end", endDate);
  }

  const response = await fetch(url, {
    signal,
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  const data = await handleJsonResponse(response, "Unable to load activity logs");
  if (!Array.isArray(data)) {
    return [];
  }
  return data;
}

export async function logActivity({ userId, action, logDate }) {
  const payload = {
    userId: userId ?? null,
    action,
    logDate: logDate ?? null,
  };

  const response = await fetch(activityLogsEndpoint, {
    method: "POST",
    headers: buildAuthHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(response, "Unable to log activity");
}

export default {
  fetchActivityLogs,
  logActivity,
};
