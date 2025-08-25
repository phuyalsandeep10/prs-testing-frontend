"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast } from "sonner"
import { useUIStore } from "@/stores/uiStore"
import { useEffect, useState } from "react"
import { X, XCircle } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const { notifications, removeNotification } = useUIStore()
  const [hasActiveToasts, setHasActiveToasts] = useState(false)

  const clearAllToasts = () => {
    toast.dismiss()
    setHasActiveToasts(false)
  }

  // Monitor for active toasts
  useEffect(() => {
    const checkToasts = () => {
      const activeToasts = document.querySelectorAll('[data-sonner-toast]')
      setHasActiveToasts(activeToasts.length > 0)
    }

    // Check immediately
    checkToasts()
    
    // Set up interval to check periodically
    const interval = setInterval(checkToasts, 100)
    
    return () => clearInterval(interval)
  }, [notifications])

  useEffect(() => {
    notifications.forEach((n) => {
      const toastConfig = {
        description: n.message, 
        id: n.id,
        action: n.actions ? {
          label: n.actions[0].label,
          onClick: n.actions[0].action,
        } : undefined,
        cancel: {
          label: <X className="h-2.5 w-2.5" />,
          onClick: () => toast.dismiss(n.id),
        },
      };

      // Use a switch to call the correct toast function based on type
      switch (n.type) {
        case 'success':
        case 'approved':
          toast.success(n.title, toastConfig);
          break;
        case 'error':
        case 'denied':
        case 'rejected':
          toast.error(n.title, toastConfig);
          break;
        case 'warning':
        case 'pending':
          toast.warning(n.title, toastConfig);
          break;
        case 'info':
        case 'verification':
          toast.info(n.title, toastConfig);
          break;
        case 'loading':
          toast.loading(n.title, toastConfig);
          break;
        case 'payment':
          toast.success(n.title, toastConfig);
          break;
        default:
          toast(n.title, toastConfig);
          break;
      }
      // Remove the notification from the store after it has been displayed
      removeNotification(n.id);
    });
  }, [notifications, removeNotification]);

  return (
    <>
      {/* Clear All Button - positioned at top right */}
      {hasActiveToasts && (
        <div className="fixed top-4 right-4 z-[10002] animate-in slide-in-from-right-2 fade-in duration-300">
          <button
            onClick={clearAllToasts}
            className="mb-2 px-2 py-1 text-[10px] font-medium bg-gray-800/90 backdrop-blur-lg border border-white/20 rounded-full text-white/90 hover:bg-gray-700/90 hover:text-white hover:border-white/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-1">
              <XCircle className="h-2 w-2" />
              Clear All
            </span>
          </button>
        </div>
      )}
      
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-transparent group-[.toaster]:border-none group-[.toaster]:shadow-none group-[.toaster]:p-0",
            description: "group-[.toast]:text-white group-[.toast]:text-xs group-[.toast]:leading-relaxed group-[.toast]:opacity-95",
            actionButton:
              "group-[.toast]:bg-black/20 group-[.toast]:text-white group-[.toast]:hover:bg-black/30 group-[.toast]:rounded-md group-[.toast]:px-2 group-[.toast]:py-1 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:backdrop-blur-sm group-[.toast]:border group-[.toast]:border-black/20 group-[.toast]:transition-all group-[.toast]:duration-200",
            cancelButton:
              "group-[.toast]:bg-transparent group-[.toast]:text-white/80 group-[.toast]:hover:text-white group-[.toast]:hover:bg-black/10 group-[.toast]:rounded-md group-[.toast]:p-1 group-[.toast]:transition-all group-[.toast]:duration-200",
            closeButton:
              "group-[.toast]:bg-black/15 group-[.toast]:text-white/90 group-[.toast]:hover:bg-black/25 group-[.toast]:hover:text-white group-[.toast]:rounded-full group-[.toast]:p-1 group-[.toast]:absolute group-[.toast]:top-2 group-[.toast]:right-2 group-[.toast]:transition-all group-[.toast]:duration-200",
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }
