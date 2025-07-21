import React from 'react';
import { useAuthStore } from './auth-store';
import { hasRoleAccess, getRouteForRole, UserRole } from './roleRedirects';
import { useSnackbar } from 'notistack';
import { LoginRequired } from '@/components/error/LoginRequired';
import { RoleAccessDenied } from '@/components/error/RoleAccessDenied';

// Route protection hook
export function useRouteProtection() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  
  const checkAccess = (route: string): boolean => {
    if (!user || !user.role) {
      return false;
    }
    return hasRoleAccess(user.role as UserRole, route);
  };
  
  const getAuthorizedRoute = (): string => {
    if (!user || !user.role) {
      return '/login';
    }
    return getRouteForRole(user.role as UserRole);
  };
  
  return { checkAccess, getAuthorizedRoute, user, isInitialized };
}

// Route protection component props
export interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackRoute?: string;
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Route protection component
export function RouteProtection({ 
  children, 
  requiredRole, 
  fallbackRoute = '/login' 
}: RouteProtectionProps) {
  const { user, isInitialized } = useRouteProtection();
  const { enqueueSnackbar } = useSnackbar();
  
  // Always call useEffect hooks in the same order
  React.useEffect(() => {
    if (!isInitialized) return; // Don't show snackbar while loading
    
    if (!user) {
      enqueueSnackbar('Please log in to access this page', { variant: 'error' });
    }
  }, [isInitialized, user, enqueueSnackbar]);

  React.useEffect(() => {
    if (!isInitialized) return; // Don't show snackbar while loading
    
    if (requiredRole && user && user.role !== requiredRole) {
      enqueueSnackbar(`Access denied. This page is only for ${requiredRole}s.`, { variant: 'error' });
    }
  }, [isInitialized, requiredRole, user, enqueueSnackbar]);
  
  // Show loading while auth is being initialized
  if (!isInitialized) {
    return <LoadingSpinner />;
  }
  
  // Show login required page
  if (!user) {
    return (
      <LoginRequired 
        onAction={() => window.location.href = fallbackRoute}
      />
    );
  }
  
  // Show role access denied page
  if (requiredRole && user.role !== requiredRole) {
    return (
      <RoleAccessDenied 
        requiredRole={requiredRole}
        currentRole={user.role || 'unknown'}
        onAction={() => window.location.href = getRouteForRole(user.role as UserRole)}
      />
    );
  }
  
  return <>{children}</>;
} 