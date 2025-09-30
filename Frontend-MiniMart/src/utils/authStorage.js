const STORAGE_KEY = "mini-mart-auth";

const isBrowser = () => typeof window !== "undefined" && window.localStorage;

export const loadAuthState = () => {
  if (!isBrowser()) {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const saveAuthState = (authState) => {
  if (!isBrowser()) {
    return;
  }
  if (!authState) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
};

export const clearAuthState = () => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

export const getAuthToken = () => {
  const state = loadAuthState();
  return state?.token ?? null;
};
