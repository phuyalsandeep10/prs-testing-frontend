// Backward compatibility wrapper for AddNewClientForm
export { ClientFormWrapper as AddNewClientForm } from "@/components/forms/ClientFormWrapper";

// Default export for legacy imports
import { ClientFormWrapper } from "@/components/forms/ClientFormWrapper";
import type { Client } from "@/lib/types/roles";

interface AddNewClientFormProps {
  onClose?: () => void;
  onClientAdded?: (newClient: Client) => void;
}

export default function AddNewClientForm({ onClose, onClientAdded }: AddNewClientFormProps) {
  return (
    <ClientFormWrapper 
      variant="add"
      mode="modal"
      onClose={onClose}
      onClientAdded={onClientAdded}
    />
  );
} 