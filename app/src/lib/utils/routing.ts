import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { UserRole, User } from '@/lib/types/roles';

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
  const rawRole = user?.role?.name || user?.role || 'unknown';
  const userRole = (typeof rawRole === 'string' ? rawRole : 'unknown').toLowerCase().replace(/\s+/g, '-') as UserRole;

  let path = '/dashboard'; // Default path

  switch (userRole) {
    case 'super-admin':
      path = '/super-admin';
      break;
    case 'org-admin':
      path = '/org-admin';
      break;
    case 'salesperson':
      path = '/salesperson';
      break;
    case 'supervisor':
      path = '/supervisor';
      break;
    case 'team-member':
      path = '/team-member';
      break;
    case 'verifier':
      path = '/verifier';
      break;
    default:
      if (addNotification) {
        addNotification({
          type: 'warning',
          title: 'Unknown Role',
          message: `Your role is not recognized. Redirecting to a default dashboard.`,
        });
      }
      // The default path is already '/dashboard'
      break;
  }
  
  router.push(path);
}; 