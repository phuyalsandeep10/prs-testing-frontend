import { useQuery } from "@tanstack/react-query";
import salesapi from "../api/salesapi";

const getDeals = async () => {
  const res = await salesapi.get("/deals/deals/");
  return res.data || res.results || [];
};

const useDeals = () => {
  return useQuery(["deals"], getDeals, {
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false, // Prevent excessive refetching
  });
};

export default useDeals;
