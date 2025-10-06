
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

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners: ((canInstall: boolean) => void)[] = [];

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach(l => l(true));
  });
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(!!deferredPrompt);

  useEffect(() => {
    listeners.push(setCanInstall);
    return () => {
      const index = listeners.indexOf(setCanInstall);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      deferredPrompt = null;
      setCanInstall(false);
      listeners.forEach(l => l(false));
    }
  };

  return { install, canInstall };
}
