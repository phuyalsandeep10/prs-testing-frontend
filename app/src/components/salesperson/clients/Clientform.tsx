"use client";
// Backward compatibility wrapper for Clientform
export { ClientFormWrapper as Clientform } from "@/components/forms/ClientFormWrapper";

// Default export for legacy imports
import { ClientFormWrapper } from "@/components/forms/ClientFormWrapper";

interface ClientformProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function Clientform({ onSuccess, onClose }: ClientformProps) {
  return (
    <ClientFormWrapper 
      variant="salesperson"
      mode="standalone"
      onSuccess={onSuccess}
      onClose={onClose}
    />
  );
}
