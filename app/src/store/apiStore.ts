import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import axios, { AxiosRequestConfig as OriginalAxiosRequestConfig, CancelTokenSource } from 'axios';
import type { Method } from 'axios';

// Extend AxiosRequestConfig to include getAuthToken
interface AxiosRequestConfig extends OriginalAxiosRequestConfig {
  getAuthToken?: () => string | null;
}

// Structure of error object for consistent error handling
interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

// Structure for saving API request parameters for retries
interface RequestParams<T> {
  method: Method;
  endpoint: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  config?: AxiosRequestConfig;
  transformResponse?: (raw: unknown) => T;
  cancelTokenSource: CancelTokenSource;
}

// Zustand store state definition
interface ApiState<T> {
  data: T | null;
  loading: Record<string, boolean>;
  error: ApiError | null;
  retryCount: number;
  lastRequest: RequestParams<T> | null;

  // Function to trigger API call
  sendRequest: (
    method: Method,
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>,
    config?: AxiosRequestConfig & { getAuthToken?: () => string | null },
    transformResponse?: (raw: unknown) => T
  ) => Promise<void>;

  // Retry mechanism for failed API requests
  retry: () => Promise<void>;

  // Cancel ongoing request
  cancel: (endpoint: string) => void;
}

/**
 * Factory function to create a Zustand store for API calls with typed data.
 * @template T - The type of the API response data.
 * @returns A Zustand store instance with API call functionality.
 */
export const createApiStore = <T>() =>
  create<ApiState<T>>()(
    immer((set, get) => ({
      data: null,
      loading: {},
      error: null,
      retryCount: 0,
      lastRequest: null,

      /**
       * Initiates an API request with support for pagination, cancellation, and query parameters.
       * @param method - HTTP method (e.g., GET, POST).
       * @param endpoint - API endpoint URL.
       * @param body - Optional request body (e.g., JSON or FormData).
       * @param params - Optional query parameters (e.g., { key: value }).
       * @param config - Optional Axios configuration with optional auth token getter.
       * @param transformResponse - Optional function to transform raw response data.
       */
      sendRequest: async (
        method,
        endpoint,
        body,
        params,
        config = {},
        transformResponse
      ) => {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          set((state) => {
            state.loading[endpoint] = false;
            state.error = { message: 'API base URL is not defined' };
          });
          return;
        }

        const cancelTokenSource = axios.CancelToken.source();

        // Reset loading state and store the last request
        set((state) => {
          state.loading[endpoint] = true;
          state.error = null;
          state.retryCount = 0;
          state.lastRequest = { method, endpoint, body, params, config, transformResponse, cancelTokenSource };
        });

        /**
         * Fetches all pages of a paginated API response.
         * @param url - The initial API endpoint URL.
         * @returns A promise resolving to an array of all results.
         */
        const fetchAllPages = async (url: string): Promise<any[]> => {
          const getAuthToken = config.getAuthToken ?? (() => localStorage.getItem('authToken'));
          const apiKey = getAuthToken();
          let allResults: any[] = [];

          while (url) {
            try {
              const response = await axios({
                method,
                url,
                data: body,
                params,
                headers: {
                  ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                  ...(apiKey ? { Authorization: `token ${apiKey}` } : {}),
                  ...config.headers,
                },
                cancelToken: cancelTokenSource.token,
                ...config,
              });

              const data = response.data;

              // Check if response is paginated
              if (Array.isArray(data.results)) {
                allResults = [...allResults, ...data.results];
                url = data.next; // Continue to next page
              } else {
                return data; // Not paginated, return directly
              }
            } catch (error) {
              if (axios.isCancel(error)) {
                set((state) => {
                  state.loading[endpoint] = false;
                });
                return allResults.length ? allResults : [];
              }
              throw error;
            }
          }

          return allResults;
        };

        try {
          const getAuthToken = config.getAuthToken ?? (() => localStorage.getItem('authToken'));
          const apiKey = getAuthToken();

          // Initial request
          const response = await axios({
            method,
            url: endpoint,
            data: body,
            params,
            headers: {
              ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
              ...(apiKey ? { Authorization: `token ${apiKey}` } : {}),
              ...config.headers,
            },
            cancelToken: cancelTokenSource.token,
            ...config,
          });

          let finalData: any;

          // If it's paginated (Django-style), fetch all pages
          if (response.data && Array.isArray(response.data.results)) {
            const allResults = await fetchAllPages(endpoint);
            finalData = { ...response.data, results: allResults };
          } else {
            finalData = response.data;
          }

          // Apply optional transformation or directly store the data
          const transformed = transformResponse ? transformResponse(finalData) : finalData;

          set((state) => {
            state.data = transformed;
            state.loading[endpoint] = false;
            state.error = null;
          });
        } catch (error) {
          if (axios.isCancel(error)) {
            set((state) => {
              state.loading[endpoint] = false;
            });
            return;
          }

          const err: ApiError = { message: 'Unknown error occurred' };

          // Handle Axios errors
          if (axios.isAxiosError(error)) {
            err.message = error.message;
            err.status = error.response?.status;
            err.details = error.response?.data;
          } else if (error instanceof Error) {
            err.message = error.message;
          }

          set((state) => {
            state.error = err;
            state.loading[endpoint] = false;
          });
        }
      },

      /**
       * Retries the last failed API call with exponential backoff (up to 3 times).
       */
      retry: async () => {
        const state = get();
        if (state.retryCount >= 3 || !state.lastRequest) return;

        const delay = Math.pow(2, state.retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));

        set((state) => {
          state.retryCount++;
          state.loading[state.lastRequest!.endpoint] = true;
          state.error = null;
        });

        const { method, endpoint, body, params, config, transformResponse, cancelTokenSource } = state.lastRequest;

        try {
          const getAuthToken = config?.getAuthToken ?? (() => localStorage.getItem('authToken'));
          const apiKey = getAuthToken();

          const response = await axios({
            method,
            url: endpoint,
            data: body,
            params,
            headers: {
              ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
              ...(apiKey ? { Authorization: `token ${apiKey}` } : {}),
              ...config?.headers,
            },
            cancelToken: cancelTokenSource.token,
            ...config,
          });

          const transformed = transformResponse ? transformResponse(response.data) : response.data;

          set((state) => {
            state.data = transformed;
            state.loading[endpoint] = false;
            state.error = null;
          });
        } catch (error) {
          if (axios.isCancel(error)) {
            set((state) => {
              state.loading[endpoint] = false;
            });
            return;
          }

          const err: ApiError = { message: 'Unknown error occurred' };

          if (axios.isAxiosError(error)) {
            err.message = error.message;
            err.status = error.response?.status;
            err.details = error.response?.data;
          } else if (error instanceof Error) {
            err.message = error.message;
          }

          set((state) => {
            state.error = err;
            state.loading[endpoint] = false;
          });
        }
      },

      /**
       * Cancels an ongoing request for the specified endpoint.
       * @param endpoint - The API endpoint to cancel.
       */
      cancel: (endpoint: string) => {
        const state = get();
        if (state.lastRequest && state.lastRequest.endpoint === endpoint) {
          state.lastRequest.cancelTokenSource.cancel(`Request for ${endpoint} canceled`);
          set((state) => {
            state.loading[endpoint] = false;
          });
        }
      },
    }))
  );