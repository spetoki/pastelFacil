"use client";

// Este é um armazenamento de sessão simples, não um sistema de autenticação real.
// Ele mantém o usuário "logado" apenas durante a sessão do navegador (até que a aba seja fechada).
let isAuthenticatedInSession = false;

export const setAuthentication = (): void => {
  isAuthenticatedInSession = true;
};

export const isAuthenticated = (): boolean => {
  return isAuthenticatedInSession;
};

export const clearAuthentication = (): void => {
  isAuthenticatedInSession = false;
};

    