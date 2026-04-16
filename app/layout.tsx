import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata } from "next";
import PWAInstall from "@/components/PWAInstall";

export const metadata: Metadata = {
  title: "OGH SCD E-Tracker",
  description: "Sickle Cell Disease Screening Tracker - Oda Government Hospital",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a5276" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SCD Tracker" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
        <PWAInstall />
      </body>
    </html>
  );
}
