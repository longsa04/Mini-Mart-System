import { API_BASE_URL, handleJsonResponse } from "./http";

const loginEndpoint = new URL("/auth/login", API_BASE_URL).toString();

export const login = async ({ username, password }) => {
  const response = await fetch(loginEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  return handleJsonResponse(response, "Unable to sign in");
};
