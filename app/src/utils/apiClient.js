// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// export const apiClient = async (endpoint, options = {}) => {
//   const url = `${BASE_URL}/${endpoints} `;

//   const defaultHeaders = {
//     "Content-Type": "application/JSON",
//     Accept: "application/JSON",
//   };

//   const config = {
//     ...options,
//     headers: {
//       ...defaultHeaders,
//       ...options.headers,
//     },
//   };

//   const response = await fetch(url, config);
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || "API error");
//   }

//   return response.json();
// };
