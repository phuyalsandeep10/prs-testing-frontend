import { useQuery } from "@tanstack/react-query";
import salesapi from "../api/salesapi";

const getDeals = async () => {
  const res = await salesapi.get("/deals/");
  return res.data;
};

const useDeals = () => {
  return useQuery(["deals"], getDeals);
};

export default useDeals;
