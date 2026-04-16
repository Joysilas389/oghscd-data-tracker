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
        <style>{`
          * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          input, textarea, select {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
          }
        `}</style>
      </head>
      <body>
        {children}
        <PWAInstall />
        <script dangerouslySetInnerHTML={{ __html: `
          // Disable right click
          document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
          });
          // Disable common screenshot shortcuts
          document.addEventListener('keydown', function(e) {
            if (
              e.key === 'PrintScreen' ||
              (e.ctrlKey && e.shiftKey && e.key === 'S') ||
              (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
            ) {
              e.preventDefault();
            }
          });
        `}} />
      </body>
    </html>
  );
}
