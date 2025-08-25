import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { UserRole, User } from '@/types';
import { toUserRole } from '@/lib/auth/permissions';

/**
 * Redirects the user to the correct dashboard based on their role.
 * @param user The user object, which should contain role information.
 * @param router The Next.js router instance.
 * @param addNotification Optional callback to show a notification for unknown roles.
 */
export const redirectUserByRole = (
  user: User | any, // Can be a partial user object
  router: AppRouterInstance,
  addNotification?: (notification: { type: 'warning'; title: string; message: string }) => void
) => {
  // Handle undefined or null user
  if (!user) {
    if (addNotification) {
      addNotification({
        type: 'warning',
        title: 'User Not Found',
        message: 'User information is not available. Redirecting to default dashboard.',
      });
    }
    router.push('/dashboard');
    return;
  }

  const rawRole = user?.role?.name || user?.role;
  const userRole = toUserRole(rawRole);

  let path = '/dashboard'; // Default path

  if (userRole) {
    switch (userRole) {
      case 'super_admin':
        path = '/super-admin';
        break;
      case 'org_admin':
        path = '/org-admin';
        break;
      case 'salesperson':
        path = '/salesperson';
        break;
      case 'supervisor':
        path = '/supervisor';
        break;
      case 'team_member':
        path = '/team_member';
        break;
      case 'verifier':
        path = '/verifier';
        break;
    }
  } else {
    if (addNotification) {
      addNotification({
        type: 'warning',
        title: 'Unknown Role',
        message: `Your role "${rawRole}" is not recognized. Redirecting to a default dashboard.`,
      });
    }
    // The default path is already '/dashboard'
  }
  
  router.push(path);
}; 