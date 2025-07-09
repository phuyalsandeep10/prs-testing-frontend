// import { create } from "zustand";
// import { apiClient } from "@/utils/apiClient.js";

// const useApiStore = create((set) => ({
//   data: null,
//   loading: false,
//   error: null,

//   fetchData: async (endpoint, options = {}) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await apiClient(endpoint, options);
//       set({ data: response, loading: false });
//     } catch (err) {
//       set({ error: err.message, loading: false });
//     }
//   },

//   clearData: () => set({ data: null, error: null }),
// }));

// export default useApiStore;
