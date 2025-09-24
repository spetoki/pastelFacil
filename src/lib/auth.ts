"use client";

const AUTH_KEY = "pastelaria_auth_token";

export const setAuthentication = (): void => {
  if (typeof window !== "undefined") {
    try {
      // O valor do token pode ser qualquer coisa, apenas sua presença importa
      localStorage.setItem(AUTH_KEY, "true");
    } catch (error) {
      console.error("Failed to set authentication in localStorage", error);
    }
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(AUTH_KEY) === "true";
    } catch (error) {
      console.error("Failed to check authentication from localStorage", error);
      return false;
    }
  }
  return false;
};

export const clearAuthentication = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error("Failed to clear authentication from localStorage", error);
    }
  }
};
