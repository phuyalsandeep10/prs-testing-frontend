export interface Payment {
  id: string;
  payment_date: string;
  receipt_file: string | null;
  payment_remarks: string | null;
  received_amount: string;
  cheque_number: string;
  payment_method: string;
  status: "pending" | "verified" | "rejected";
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
  client_name: string;
  deal_name: string;
  created_by: {
    id: string;
    full_name: string;
    email: string;
  };
  pay_status: "partial_payment" | "full_payment";
  source_type: string;
  deal_value: string;
  deal_date: string;
  due_date: string;
  deal_remarks: string | null;
  payments: Payment[];
  activity_logs: ActivityLog[];
  version: number;
}

export interface Client {
  id: string;
  client_name: string;
}
