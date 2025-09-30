import { API_BASE_URL, buildAuthHeaders, handleJsonResponse } from "./http";

const buildUrl = (path, params = {}) => {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, value);
  });
  return url.toString();
};

const requestJson = async (path, { signal, params } = {}) => {
  const response = await fetch(buildUrl(path, params), {
    signal,
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });
  return handleJsonResponse(response, "Inventory request failed");
};

const jsonRequest = async (path, { method = "POST", body, signal } = {}) => {
  const response = await fetch(buildUrl(path), {
    method,
    signal,
    headers: buildAuthHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: body != null ? JSON.stringify(body) : undefined,
  });

  return handleJsonResponse(response, "Inventory request failed");
};

export const fetchStockLevels = (options = {}) => {
  const { signal, productId, locationId } = options;
  return requestJson("/inventory/stock", {
    signal,
    params: { productId, locationId },
  });
};

export const fetchStockMovements = (options = {}) => {
  const { signal, productId, startDate, endDate, locationId } = options;
  return requestJson("/inventory/movements", {
    signal,
    params: { productId, startDate, endDate, locationId },
  });
};

export const adjustStock = (payload) => {
  return jsonRequest("/inventory/adjust", {
    body: payload,
  });
};
