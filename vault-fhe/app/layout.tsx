import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./client-providers";

export const metadata: Metadata = {
  title: "VaultFHE — FHE Password Manager",
  description:
    "The world's first Fully Homomorphic Encryption password manager. Your passwords are unreadable — even on-chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0d14] text-white">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
