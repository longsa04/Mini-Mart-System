import { API_BASE_URL, buildAuthHeaders, handleJsonResponse } from "./http";

const ordersEndpoint = new URL("/orders", API_BASE_URL).toString();

export const fetchOrders = async ({ signal } = {}) => {
  const response = await fetch(ordersEndpoint, {
    signal,
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  return handleJsonResponse(response, "Failed to load orders");
};

export const createOrder = async (payload) => {
  const response = await fetch(ordersEndpoint, {
    method: "POST",
    headers: buildAuthHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(response, "Failed to create order");
};
