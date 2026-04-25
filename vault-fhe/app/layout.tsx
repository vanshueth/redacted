import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./client-providers";

export const metadata: Metadata = {
  title: "VaultX — Onchain FHE Vault",
  description:
    "Your data. Encrypted. Onchain. Unseeable. Not even validators can read it. Powered by Fhenix coFHE.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#07090E] text-[#E8EDF5] antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
