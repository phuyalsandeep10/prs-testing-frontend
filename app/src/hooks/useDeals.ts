import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Deal } from "@/types/deals";
import { toast } from "sonner";

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Deal[];
}

// Fetch deals function
const fetchDeals = async (searchTerm: string): Promise<Deal[]> => {
  try {
    // Add pagination parameters to get more deals and ensure we get the latest ones
    const response = await apiClient.get<ApiResponse>("/deals/deals/", {
      search: searchTerm,
      page: 1,
      limit: 25, // Use the actual limit that works
      ordering: "-created_at", // Sort by creation date descending to get newest first
    });
    return response.data.results || [];
  } catch (error) {
    throw error;
  }
};

// Create deal function
const createDeal = async (dealData: any): Promise<any> => {
  try {
    const response = await apiClient.post("/deals/deals/", dealData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create deal");
  }
};

export const useDeals = (searchTerm: string = "") => {
  return useQuery<Deal[], Error>({
    queryKey: ["deals", searchTerm],
    queryFn: () => fetchDeals(searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeal,
    onSuccess: (data) => {
      console.log("Deal created successfully:", data);
      
      // Invalidate and refetch deals
      queryClient.invalidateQueries({ 
        queryKey: ["deals"],
        exact: false 
      });
      
      // Show success message
      toast.success("Deal created successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to create deal:", error);
      toast.error(error.message || "Failed to create deal. Please try again.");
    },
  });
}; 