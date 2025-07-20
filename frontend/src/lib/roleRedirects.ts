import { useRouter } from 'next/navigation';

// Role to route mapping
export const ROLE_ROUTES = {
  student: '/student',
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
  director: '/admin', // Director goes to admin dashboard
  guest: '/login', // Guest users stay on login
} as const;

// Type for valid roles
export type UserRole = keyof typeof ROLE_ROUTES;

// Function to get route for a role
export function getRouteForRole(role: UserRole): string {
  return ROLE_ROUTES[role] || '/login';
}

// Function to check if role has access to a route
export function hasRoleAccess(role: UserRole, route: string): boolean {
  const allowedRoute = ROLE_ROUTES[role];
  return route.startsWith(allowedRoute);
}

// Hook to handle role-based redirects
export function useRoleRedirect() {
  const router = useRouter();
  
  const redirectToRole = (role: UserRole) => {
    const route = getRouteForRole(role);
    router.push(route);
  };
  
  return { redirectToRole, getRouteForRole };
}

// Role redirects object for direct usage
export const ROLE_REDIRECTS = {
  redirectToRole: (role: UserRole, router: any) => {
    const route = getRouteForRole(role);
    router.push(route);
  },
  getRouteForRole,
  hasRoleAccess,
}; 