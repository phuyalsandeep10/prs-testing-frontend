"use client";

import { Bell, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef, useState } from "react";
import Notifications from "@/components/global-components/Notification";
import { useAuth } from "@/stores";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null!);

  // ===== Auth =====
  const { user, logout } = useAuth();

  // Determine display name
  const firstName = (user as any)?.first_name ?? (user as any)?.firstName ?? '';
  const lastName = (user as any)?.last_name ?? (user as any)?.lastName ?? '';

  const fullName = (user?.name as string) ||
    (firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.email) ||
    "Unknown User";

  // Determine role
  const rawRole = (user as any)?.role; // could be string or object
  const roleName = typeof rawRole === 'string'
    ? rawRole.replace(/-/g, ' ')
    : rawRole?.name?.replace(/-/g, ' ') ?? 'Unknown Role';

  const avatarInitials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-[45] flex h-20 items-center justify-end gap-4 border-b bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Gift className="h-6 w-6" />
          <span className="sr-only">Offers</span>
        </Button>

        <Button
          ref={bellRef}
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setIsModalOpen(true)}
        >
          <Bell className="h-6 w-6" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Notifications
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          anchorRef={bellRef}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 relative rounded-full p-2 h-auto"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={undefined} alt={fullName} />
                <AvatarFallback>{avatarInitials}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold">{fullName}</p>
                <p className="text-sm text-muted-foreground">{roleName}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
