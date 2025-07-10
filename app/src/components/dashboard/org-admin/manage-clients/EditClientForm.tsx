// Backward compatibility wrapper for EditClientForm
export { ClientFormWrapper as EditClientForm } from "@/components/forms/ClientFormWrapper";

// Default export for legacy imports
import { ClientFormWrapper } from "@/components/forms/ClientFormWrapper";
import type { Client } from "@/lib/types/roles";

interface EditClientFormProps {
  client: Client;
  onClose?: () => void;
  onClientUpdated?: (updatedClient: Client) => void;
}

export default function EditClientForm({ client, onClose, onClientUpdated }: EditClientFormProps) {
  return (
    <ClientFormWrapper 
      variant="edit"
      mode="modal"
      client={client}
      onClose={onClose}
      onClientUpdated={onClientUpdated}
    />
  );
} 