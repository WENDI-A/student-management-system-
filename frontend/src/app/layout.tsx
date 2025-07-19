'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { PageTransition } from "@/components/PageTransition";
import { useEffect } from 'react';
import { setOnUnauthorized } from '../lib/axios';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    setOnUnauthorized(() => {
      window.dispatchEvent(new CustomEvent('show-glass-overlay'));
      setTimeout(() => {
        window.location.href = '/login';
      }, 5000);
    });
  }, []);
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth text-base`}
      >
        <ThemeProvider>
          <AuthProvider>
            <PageTransition>{children}</PageTransition>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
