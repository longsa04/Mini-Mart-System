import { API_BASE_URL, buildAuthHeaders, handleJsonResponse } from "./http";

const customersEndpoint = new URL("/customers", API_BASE_URL).toString();

export const fetchCustomers = async ({ signal } = {}) => {
  const response = await fetch(customersEndpoint, {
    signal,
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  return handleJsonResponse(response, "Failed to load customers");
};

export const createCustomer = async (payload) => {
  const response = await fetch(customersEndpoint, {
    method: "POST",
    headers: buildAuthHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(response, "Failed to create customer");
};

export const updateCustomer = async (customerId, payload) => {
  const response = await fetch(`${customersEndpoint}/${customerId}`, {
    method: "PUT",
    headers: buildAuthHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(response, "Failed to update customer");
};

export const deleteCustomer = async (customerId) => {
  const response = await fetch(`${customersEndpoint}/${customerId}`, {
    method: "DELETE",
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  await handleJsonResponse(response, "Failed to delete customer");
};
