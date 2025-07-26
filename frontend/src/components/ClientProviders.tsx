'use client';

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { PageTransition } from "@/components/PageTransition";
import { useEffect, useState } from 'react';
import { setOnUnauthorized } from '../lib/axios';
import { initializeAuth } from '../lib/auth-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Initialize auth from localStorage
    initializeAuth();
    
    setOnUnauthorized(() => {
      window.dispatchEvent(new CustomEvent('show-glass-overlay'));
      setTimeout(() => {
        window.location.href = '/login';
      }, 5000);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <ThemeProvider>
          <AuthProvider>
            <PageTransition>{children}</PageTransition>
          </AuthProvider>
        </ThemeProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}