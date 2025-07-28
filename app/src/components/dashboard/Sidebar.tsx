"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  FileCheck,
  RotateCcw,
  Heart,
  UserCheck,
  Gift,
  ChevronLeft,
  ClipboardMinus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logout from "../global-components/Logout";
import { useState, useEffect } from "react";
import { useSidebar, useAuth } from "@/stores";

const superAdminNav = [
  { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  { name: "Organizations", href: "/super-admin/organizations", icon: Building },
  { name: "Manage Admins", href: "/super-admin/manage-admins", icon: UserCog },
];

const orgAdminNav = [
  { name: "Dashboard", href: "/org-admin", icon: LayoutDashboard },
  { name: "Manage Users", href: "/org-admin/manage-users", icon: Users },
  { name: "Deals", href: "/org-admin/deals", icon: Handshake },
  { name: "Clients", href: "/org-admin/manage-clients", icon: Briefcase },
  { name: "Commission", href: "/org-admin/commission", icon: Percent },
  { name: "Offers", href: "/org-admin/offers", icon: Tags },
  { name: "Permission", href: "/org-admin/permission", icon: ShieldCheck },
];

const verifierNav = [
  { name: "Dashboard", href: "/verifier", icon: LayoutDashboard },
  { name: "Deals", href: "/verifier/deals", icon: Heart },
  { name: "Verify Invoice", href: "/verifier/verify-invoice", icon: FileCheck },
  {
    name: "Refund / Chargeback",
    href: "/verifier/refund-chargeback",
    icon: RotateCcw,
  },
  {
    name: "Payment Records",
    href: "/verifier/paymentRecords",
    icon: ClipboardMinus,
  },
];

const seniorverifierNav = [
  { name: "Dashboard", href: "/senior-verifier", icon: LayoutDashboard },
  { name: "Deals", href: "/senior-verifier/deals", icon: Heart },
  { name: "Verify Invoice", href: "/senior-verifier/verify-invoice", icon: FileCheck },
  {
    name: "Refund / Chargeback",
    href: "/senior-verifier/refund-chargeback",
    icon: RotateCcw,
  },
  {
    name: "Payment Records",
    href: "/senior-verifier/paymentRecords",
    icon: ClipboardMinus,
  },
];

const salespersonNav = [
  { name: "Dashboard", href: "/salesperson", icon: LayoutDashboard },
  { name: "Deals", href: "/salesperson/deal", icon: Heart },
  { name: "Clients", href: "/salesperson/client", icon: UserCheck },
  { name: "Commission", href: "/salesperson/commission", icon: Percent },
  { name: "Offers", href: "/salesperson/offers", icon: Gift },
];

const supervisorNav = [
  { name: "Dashboard", href: "/supervisor", icon: LayoutDashboard },
  { name: "Team Overview", href: "/supervisor/team", icon: Users },
  { name: "Performance", href: "/supervisor/performance", icon: Percent },
];

const teamMemberNav = [
  { name: "Dashboard", href: "/team-member", icon: LayoutDashboard },
  { name: "Tasks", href: "/team-member/tasks", icon: FileCheck },
  { name: "Projects", href: "/team-member/projects", icon: Briefcase },
];

const bottomNav = [{ name: "Settings", href: "/settings", icon: Settings }];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const { user, logout, isAuthenticated } = useAuth();
  const isCollapsed = sidebarCollapsed;

  // Handle authentication redirect in useEffect to avoid render-time side effects
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Determine current role and navigation based on user role
  const getCurrentNavigation = () => {
    // Only use user role if authenticated
    if (user && isAuthenticated) {
      const role = user?.role;
      if (role === 'super-admin') return superAdminNav;
      if (role === 'org-admin') return orgAdminNav;
      if (role === 'verifier') return verifierNav;
      if (role === 'senior-verifier') return seniorverifierNav;
      if (role === 'salesperson') return salespersonNav;
      if (role === 'supervisor') return supervisorNav;
      if (role === 'team-member') return teamMemberNav;
    }
    
    // If not authenticated, return empty navigation (redirect handled in useEffect)
    if (!isAuthenticated) {
      return []; // Return empty navigation
    }
    
    // Fallback logic (only if authenticated but role is unclear)
    if (pathname.startsWith("/super-admin")) return superAdminNav;
    if (pathname.startsWith("/org-admin")) return orgAdminNav;
    if (pathname.startsWith("/verifier")) return verifierNav;
    if (pathname.startsWith("/salesperson")) return salespersonNav;
    if (pathname.startsWith("/supervisor")) return supervisorNav;
    if (pathname.startsWith("/senior-verifier")) return seniorverifierNav;
    if (pathname.startsWith("/team-member")) return teamMemberNav;
    return orgAdminNav; // Default fallback
  };

  const navigation = getCurrentNavigation();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-[45] lg:border-r lg:border-gray-200 lg:bg-white h-screen",
          "transition-[width] duration-500 ease-in-out",
          isCollapsed ? "lg:w-20" : "lg:w-80"
        )}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Logo Section */}
          <div className="flex h-20 shrink-0 items-center relative px-4 border-b border-gray-100">
            <div
              className={cn(
                "bg-[#4F46E5] p-2 rounded-lg flex-shrink-0 transition-all duration-500 ease-in-out",
                isCollapsed ? "mx-auto" : ""
              )}
            >
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div
              className={cn(
                "ml-3 min-w-0 flex-1",
                "transition-all duration-500 ease-in-out",
                isCollapsed
                  ? "opacity-0 scale-95 -translate-x-4"
                  : "opacity-100 scale-100 translate-x-0"
              )}
            >
              <h1 className="text-lg font-semibold text-gray-800 truncate">
                Payment Receiving System
              </h1>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!isCollapsed)}
              className={cn(
                "absolute -right-3 top-1/2 transform -translate-y-1/2 z-20",
                "bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md",
                "transition-all duration-300 ease-in-out hover:scale-105",
                isCollapsed ? "opacity-75" : "opacity-100"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Main and Bottom Navigation Wrapper */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="flex-1 px-2 pl-4 py-4">
              <ul role="list" className="space-y-4">
                {navigation.map((item) => {
                  const isActive =
                    item.name === "Dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center rounded-md p-2 text-sm leading-6 font-semibold relative",
                          "transition-all duration-300 ease-in-out",
                          isCollapsed ? "justify-center" : "gap-x-3",
                          isActive
                            ? "bg-[#4F46E5] text-white"
                            : "text-gray-600 hover:text-[#4F46E5] hover:bg-blue-50"
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            "h-6 w-6 shrink-0",
                            isCollapsed ? "mx-auto" : ""
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate",
                            "transition-all duration-500 ease-in-out",
                            isCollapsed
                              ? "opacity-0 scale-95 -translate-x-4"
                              : "opacity-100 scale-100 translate-x-0"
                          )}
                        >
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Bottom Navigation */}
            <div className="mt-auto px-2 pl-4 py-4 border-t border-gray-100">
              <ul role="list" className="space-y-4">
                {bottomNav.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-md p-2 text-sm leading-6 font-semibold relative",
                        "transition-all duration-300 ease-in-out",
                        isCollapsed ? "justify-center" : "gap-x-3",
                        pathname.startsWith(item.href)
                          ? "bg-[#4F46E5] text-white"
                          : "text-gray-600 hover:text-[#4F46E5] hover:bg-blue-50"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-6 w-6 shrink-0",
                          isCollapsed ? "mx-auto" : ""
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate",
                          "transition-all duration-500 ease-in-out",
                          isCollapsed
                            ? "opacity-0 scale-95 -translate-x-4"
                            : "opacity-100 scale-100 translate-x-0"
                        )}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
                {/* Logout button */}
                <li>
                  <button
                    onClick={() => setIsLogoutOpen(true)}
                    className={cn(
                      "group flex items-center rounded-md p-2 text-sm leading-6 font-semibold w-full",
                      "transition-all duration-300 ease-in-out",
                      isCollapsed ? "justify-center" : "gap-x-3",
                      "text-gray-600 hover:text-red-600 hover:bg-red-50"
                    )}
                    title={isCollapsed ? "Logout" : undefined}
                  >
                    <LogOut
                      className={cn(
                        "h-6 w-6 shrink-0",
                        isCollapsed ? "mx-auto" : ""
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-left truncate",
                        "transition-all duration-500 ease-in-out",
                        isCollapsed
                          ? "opacity-0 scale-95 -translate-x-4"
                          : "opacity-100 scale-100 translate-x-0"
                      )}
                    >
                      Logout
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Logout
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        onCancel={() => setIsLogoutOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
