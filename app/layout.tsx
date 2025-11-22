import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Askes AI - Asisten Kesehatan Virtual",
  description: "Dapatkan saran kesehatan dari asisten AI canggih. Konsultasi melalui chat, suara, dan analisis gambar.",
};

import { UserSyncProvider } from "./_component/UserSyncProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <ClerkProvider> 
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <UserSyncProvider>
          {children}
        </UserSyncProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
