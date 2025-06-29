import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DealPaymentForm from "@/components/paymentform/DealPaymentForm";

const PaymentFormSlider = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button variant="outline">
          <button>
            <image src="{add}" alt="Add" />
          </button>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
      </DropdownMenuContent>
      <DealPaymentForm />
    </DropdownMenu>
  );
};

export default PaymentFormSlider;
