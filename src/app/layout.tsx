
"use client";

import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// This is a client component, so we can't use the metadata object directly.
// Instead, we set the title in a useEffect hook.
// export const metadata: Metadata = {
//   title: "Viveiro Andurá",
//   description: "Gerencie seu estoque de mudas de cacau e clientes.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  React.useEffect(() => {
    document.title = "Viveiro Andurá";

    // Registrar o Service Worker para PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4d7c0f" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
