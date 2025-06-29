// app/users/page.tsx
"use client";

import React, { useState } from "react";
import DealsTable from "@/components/salesperson/deals/DealsTable";
import DealPaymentForm from "@/components/paymentform/DealPaymentForm";

const UsersPage: React.FC = () => {
  const [togglePaymentForm, setTogglePaymentForm] = useState(false);
  console.log("Toggle Payment Form:", togglePaymentForm);

  return (
    <div className="p-6 relative">
      {/* <DealsHeader
        PageTitle="Deal Managment"
        PageDescription="Manage your user base, teams and access all the details of each user."
      /> */}
      <DealsTable
        togglePaymentForm={togglePaymentForm}
        setTogglePaymentForm={setTogglePaymentForm}
      />
      <DealPaymentForm
        togglePaymentForm={togglePaymentForm}
        setTogglePaymentForm={setTogglePaymentForm}
      />
      {/* <DropDown /> */}
    </div>
  );
};

export default UsersPage;
