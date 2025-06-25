'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Handshake,
  Briefcase,
  Percent,
  Tags,
  ShieldCheck,
  Settings,
  LogOut,
  Building,
  UserCog,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const superAdminNav = [
  { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { name: 'Organizations', href: '/super-admin/organizations', icon: Building },
  { name: 'Manage Admins', href: '/super-admin/manage-admins', icon: UserCog },
];

const orgAdminNav = [
  { name: 'Dashboard', href: '/org-admin', icon: LayoutDashboard },
  { name: 'Manage Users', href: '/org-admin/manage-users', icon: Users },
  { name: 'Deals', href: '/org-admin/deals', icon: Handshake },
  { name: 'Clients', href: '/org-admin/manage-clients', icon: Briefcase },
  { name: 'Commission', href: '/org-admin/commission', icon: Percent },
  { name: 'Offers', href: '/org-admin/offers', icon: Tags },
  { name: 'Permission', href: '/org-admin/permission', icon: ShieldCheck },
];

const bottomNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Log Out', href: '/logout', icon: LogOut },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isSuperAdmin = pathname.startsWith('/super-admin');
  const navigation = isSuperAdmin ? superAdminNav : orgAdminNav;
  const logoText = 'Payment Receiving System.';

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:border-gray-200 lg:bg-white">
      <div className="flex flex-col grow gap-y-5 overflow-y-auto px-6 pb-4">
        <div className="flex h-20 shrink-0 items-center gap-x-3">
          <div className="bg-primary p-2 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-gray-800">{logoText}</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-2">
                {navigation.map((item) => {
                                    const isActive =
                    item.name === 'Dashboard'
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <ul role="list" className="-mx-2 space-y-2">
                {bottomNav.map((item) => {
                   const isActive = pathname.startsWith(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold',
                           isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
