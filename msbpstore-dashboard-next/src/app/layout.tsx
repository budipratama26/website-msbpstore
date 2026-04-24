import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import IdleLogout from "@/components/IdleLogout";
import { TermsPrompt } from "@/components/TermsPrompt";
import { ClientLayoutWrapper } from "./ClientLayoutWrapper";

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") || "";

  return (
    <html lang="id" className={`${plusJakartaSans.variable}`} nonce={nonce}>
      <body className="antialiased font-sans">
        <Providers>
          <IdleLogout />
          <TermsPrompt />
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
