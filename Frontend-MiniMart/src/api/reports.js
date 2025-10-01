import { API_BASE_URL, buildAuthHeaders, handleJsonResponse } from "./http";

const profitLossEndpoint = new URL("/reports/profit-loss", API_BASE_URL).toString();

export const fetchProfitLossReport = async ({
  startDate,
  endDate,
  locationId,
  signal,
} = {}) => {
  const url = new URL(profitLossEndpoint);

  if (startDate) {
    url.searchParams.set("startDate", startDate);
  }
  if (endDate) {
    url.searchParams.set("endDate", endDate);
  }
  if (locationId) {
    url.searchParams.set("locationId", locationId);
  }

  const response = await fetch(url.toString(), {
    signal,
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  return handleJsonResponse(
    response,
    "Failed to load profit and loss report"
  );
};
