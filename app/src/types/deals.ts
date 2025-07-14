export interface Payment {
  id: string;
  payment_date: string;
  receipt_file: string | null;
  payment_remarks: string | null;
  received_amount: string;
  cheque_number: string;
  payment_method: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_by: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  verification_remarks: string | null;
  version: number;
}

export interface ActivityLog {
  id: number;
  message: string;
  timestamp: string;
}

export interface Deal {
  id: string;
  deal_id: string;
  organization: string;
  client: {
    id: string;
    client_name: string;
  };
  client_id?: string; // For write operations
  created_by: {
    id: string;
    full_name: string;
    email: string;
  };
  updated_by?: {
    id: string;
    full_name: string;
    email: string;
  };
  payment_status: 'initial payment' | 'partial_payment' | 'full_payment';
  verification_status: 'verified' | 'pending' | 'rejected';
  client_status: 'pending' | 'loyal' | 'bad_debt';
  source_type: 'linkedin' | 'instagram' | 'google' | 'referral' | 'others';
  deal_name: string;
  deal_value: string;
  currency: string;
  deal_date: string;
  due_date?: string;
  payment_method: 'wallet' | 'bank' | 'cheque' | 'cash';
  deal_remarks?: string | null;
  version: 'original' | 'edited';
  created_at: string;
  updated_at: string;
  payments?: Payment[];
  activity_logs?: ActivityLog[];
  
  // Aliases provided by backend serializer
  client_name: string;
  pay_status: 'initial payment' | 'partial_payment' | 'full_payment';
}

export interface Client {
  id: string;
  client_name: string;
} 