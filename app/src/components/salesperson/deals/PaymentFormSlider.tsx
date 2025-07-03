"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; 
import DealPaymentForm from "@/components/paymentform/DealPaymentForm";
import { Plus } from "lucide-react"; 

const PaymentFormSlider = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus size={16} />
          Add Payment
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
      </DropdownMenuContent>

      <DealPaymentForm />
    </DropdownMenu>
  );
};

export default PaymentFormSlider;
