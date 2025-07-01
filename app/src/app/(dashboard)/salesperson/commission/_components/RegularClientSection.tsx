"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import RegularClientCard from "@/components/salesperson/commission/RegularClientCard";

interface ClientItem {
  name: string;
  investedPrice: string;
}

const fetchRegularClients = async (): Promise<ClientItem[]> => {
  //replace the below static data with an actual API call
  // const response = await fetch("/api/clients");
  // return response.json();

  return [
    { name: "Apple INC.", investedPrice: "$ 20,00,000" },
    { name: "Yubesh Shrestha", investedPrice: "$ 10,00,000" },
    { name: "Laxman Singh Dhami", investedPrice: "$ 3,00,000" },
    { name: "Sagam Ghale", investedPrice: "$ 5,00,000" },
    { name: "Swastika Pokharel", investedPrice: "$ 20,000" },
  ];
};

export default function RegularClientSection() {
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["regularClients"],
    queryFn: fetchRegularClients,
  });

  return (
    <div className="p-6 pt-0 max-w-screen-xl mx-auto">
      <RegularClientCard
        title="Regular Clients"
        subtitle="Here are your top five regular Clients."
        clients={clients}
      />
    </div>
  );
}
