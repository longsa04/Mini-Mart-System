import { API_BASE_URL, buildAuthHeaders, handleJsonResponse } from "./http";

const usersEndpoint = new URL("/users", API_BASE_URL).toString();

export const fetchUsers = async ({ role, signal } = {}) => {
  const url = new URL(usersEndpoint);
  if (role) {
    url.searchParams.set("role", role);
  }

  const response = await fetch(url, {
    signal,
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  return handleJsonResponse(response, "Failed to load users");
};

export const createUser = async (payload) => {
  const response = await fetch(usersEndpoint, {
    method: "POST",
    headers: buildAuthHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(response, "Failed to create user");
};

export const updateUser = async (userId, payload) => {
  const response = await fetch(`${usersEndpoint}/${userId}`, {
    method: "PUT",
    headers: buildAuthHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(response, "Failed to update user");
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${usersEndpoint}/${userId}`, {
    method: "DELETE",
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  await handleJsonResponse(response, "Failed to delete user");
};
