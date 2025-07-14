"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast } from "sonner"
import { useUIStore } from "@/stores/uiStore"
import { useEffect } from "react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const { notifications, removeNotification } = useUIStore()

  useEffect(() => {
    notifications.forEach((n) => {
      // Use a switch to call the correct toast function based on type
      switch (n.type) {
        case 'success':
          toast.success(n.title, { description: n.message, id: n.id });
          break;
        case 'error':
          toast.error(n.title, { description: n.message, id: n.id });
          break;
        case 'warning':
          toast.warning(n.title, { description: n.message, id: n.id });
          break;
        case 'info':
          toast.info(n.title, { description: n.message, id: n.id });
          break;
        default:
          toast(n.title, { description: n.message, id: n.id });
          break;
      }
      // Remove the notification from the store after it has been displayed
      removeNotification(n.id);
    });
  }, [notifications, removeNotification]);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
