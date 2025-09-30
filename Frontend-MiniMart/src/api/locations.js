import { API_BASE_URL, buildAuthHeaders, handleJsonResponse } from "./http";

const locationsEndpoint = new URL("/locations", API_BASE_URL).toString();

export const fetchLocations = async ({ signal } = {}) => {
  const response = await fetch(locationsEndpoint, {
    signal,
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  return handleJsonResponse(response, "Failed to load locations");
};
