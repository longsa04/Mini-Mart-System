import { API_BASE_URL, buildAuthHeaders, handleJsonResponse } from "./http";

const categoriesEndpoint = new URL("/categories", API_BASE_URL).toString();

export const fetchCategories = async ({ signal } = {}) => {
  const response = await fetch(categoriesEndpoint, {
    signal,
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  return handleJsonResponse(response, "Failed to load categories");
};

export const createCategory = async (payload) => {
  const response = await fetch(categoriesEndpoint, {
    method: "POST",
    headers: buildAuthHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(response, "Failed to create category");
};

export const updateCategory = async (categoryId, payload) => {
  const response = await fetch(`${categoriesEndpoint}/${categoryId}`, {
    method: "PUT",
    headers: buildAuthHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(response, "Failed to update category");
};

export const deleteCategory = async (categoryId) => {
  const response = await fetch(`${categoriesEndpoint}/${categoryId}`, {
    method: "DELETE",
    headers: buildAuthHeaders({ Accept: "application/json" }),
  });

  await handleJsonResponse(response, "Failed to delete category");
};
