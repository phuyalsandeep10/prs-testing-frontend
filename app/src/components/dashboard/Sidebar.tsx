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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logout from "../global-components/Logout";
import { useState } from "react";
import { useSidebar } from "@/app/(dashboard)/layout";

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
  { name: "Refund / Chargeback", href: "/verifier/refund-chargeback", icon: RotateCcw },
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

const bottomNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  // Use shared sidebar context
  const { isCollapsed, setIsCollapsed } = useSidebar();

  // Determine current role and navigation based on pathname
  const getCurrentNavigation = () => {
    if (pathname.startsWith("/super-admin")) return superAdminNav;
    if (pathname.startsWith("/org-admin")) return orgAdminNav;
    if (pathname.startsWith("/verifier")) return verifierNav;
    if (pathname.startsWith("/salesperson")) return salespersonNav;
    if (pathname.startsWith("/supervisor")) return supervisorNav;
    if (pathname.startsWith("/team-member")) return teamMemberNav;
    return orgAdminNav; // Default fallback
  };

  const navigation = getCurrentNavigation();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <>
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-[45] lg:border-r lg:border-gray-200 lg:bg-white",
        "transition-all duration-300 ease-in-out sidebar-container", // Smooth transition with height fix
        isCollapsed ? "lg:w-20" : "lg:w-80"
      )}>
        {/* Fixed height container that uses full viewport */}
        <div className="flex flex-col h-full">
          {/* Logo Section - Fixed height */}
          <div className="flex h-20 shrink-0 items-center gap-x-3 relative px-6 border-b border-gray-100">
            <div className="bg-[#4F46E5] p-2 rounded-lg flex-shrink-0">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            {/* Logo Text with smooth transition */}
            <div className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <h1 className="text-lg font-semibold text-gray-800 whitespace-nowrap">
                Payment Receiving System
              </h1>
            </div>
            {/* Collapse Toggle - Better positioning */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "absolute bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-all duration-300",
                "top-1/2 transform -translate-y-1/2",
                isCollapsed ? "-right-3" : "-right-3"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Main Navigation - Flex grow to take available space */}
          <div className="flex-1 overflow-y-auto px-6 py-4 sidebar-nav-area">
            <ul role="list" className="-mx-2 space-y-2">
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
                        "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold",
                        "transition-all duration-300 ease-in-out", // Smooth transition
                        isActive
                          ? "bg-[#4F46E5] text-white"
                          : "text-gray-600 hover:text-[#4F46E5] hover:bg-blue-50",
                        isCollapsed && "justify-center"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {/* Text with smooth transition */}
                      <span className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Bottom Navigation - Fixed at bottom with border */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-100 sidebar-bottom-nav">
            <ul role="list" className="-mx-2 space-y-2">
              {bottomNav.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold",
                        "transition-all duration-300 ease-in-out", // Smooth transition
                        isActive
                          ? "bg-[#4F46E5] text-white"
                          : "text-gray-600 hover:text-[#4F46E5] hover:bg-blue-50",
                        isCollapsed && "justify-center"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {/* Text with smooth transition */}
                      <span className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}

              {/* Log Out Button - Always visible */}
              <li>
                <button
                  onClick={() => setIsLogoutOpen(true)}
                  className={cn(
                    "group w-full flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-gray-600 hover:text-[#4F46E5] hover:bg-blue-50",
                    "transition-all duration-300 ease-in-out", // Smooth transition
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? "Log Out" : undefined}
                >
                  <LogOut
                    className="h-6 w-6 shrink-0"
                    aria-hidden="true"
                  />
                  {/* Text with smooth transition */}
                  <span className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    Log Out
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Logout 
        open={isLogoutOpen} 
        onOpenChange={setIsLogoutOpen}
        onLogout={handleLogout}
        onCancel={() => setIsLogoutOpen(false)}
      />
    </>
  );
}
