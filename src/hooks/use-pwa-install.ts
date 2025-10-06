"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o mini-infobar de aparecer no Chrome
      e.preventDefault();
      // Guarda o evento para que possa ser disparado depois
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Atualiza a UI para notificar o usuário que ele pode instalar o PWA
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Mostra o prompt de instalação
    await deferredPrompt.prompt();
    // Espera o usuário responder ao prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      // O usuário aceitou, não precisamos mais do prompt
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  return { install, canInstall };
}
