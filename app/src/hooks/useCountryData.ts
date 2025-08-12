import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Types for country data
export interface CountryCode {
  name: string;
  alpha_2: string;
  alpha_3: string;
  numeric: string;
  calling_code: string;
  flag_emoji: string;
  is_popular: boolean;
}

export interface Nationality {
  country_name: string;
  nationality: string;
  alpha_2: string;
  alpha_3: string;
  numeric: string;
  flag_emoji: string;
  is_popular: boolean;
}

// Hook to fetch country codes
export const useCountryCodes = () => {
  return useQuery({
    queryKey: ['country-codes'],
    queryFn: async (): Promise<CountryCode[]> => {
      try {
        const response = await apiClient.get('/commission/country-codes/');
        console.log('Country codes API response:', response);
        
        // Handle different response formats
        let data = response;
        if (response && typeof response === 'object') {
          // If response has a data property, use it
          if (response.data && Array.isArray(response.data)) {
            data = response.data;
          }
          // If response has results property (paginated), use it
          else if (response.results && Array.isArray(response.results)) {
            data = response.results;
          }
          // If response is directly an array
          else if (Array.isArray(response)) {
            data = response;
          }
        }
        
        // Ensure we have an array
        if (!Array.isArray(data)) {
          console.warn('Country codes API returned non-array data:', data);
          throw new Error('Invalid data format');
        }
        
        console.log('Country codes loaded:', data.length, 'countries');
        return data;
      } catch (error) {
        console.error('Failed to fetch country codes:', error);
        // Return fallback data
        return [
          {
            name: "Nepal",
            alpha_2: "NP", 
            alpha_3: "NPL",
            numeric: "524",
            calling_code: "977",
            flag_emoji: "🇳🇵",
            is_popular: true
          },
          {
            name: "India",
            alpha_2: "IN",
            alpha_3: "IND",
            numeric: "356",
            calling_code: "91",
            flag_emoji: "🇮🇳",
            is_popular: true
          },
          {
            name: "United States",
            alpha_2: "US",
            alpha_3: "USA", 
            numeric: "840",
            calling_code: "1",
            flag_emoji: "🇺🇸",
            is_popular: true
          }
        ];
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

// Hook to fetch nationalities
export const useNationalities = () => {
  return useQuery({
    queryKey: ['nationalities'],
    queryFn: async (): Promise<Nationality[]> => {
      try {
        const response = await apiClient.get('/commission/nationalities/');
        console.log('Nationalities API response:', response);
        
        // Handle different response formats
        let data = response;
        if (response && typeof response === 'object') {
          // If response has a data property, use it
          if (response.data && Array.isArray(response.data)) {
            data = response.data;
          }
          // If response has results property (paginated), use it
          else if (response.results && Array.isArray(response.results)) {
            data = response.results;
          }
          // If response is directly an array
          else if (Array.isArray(response)) {
            data = response;
          }
        }
        
        // Ensure we have an array
        if (!Array.isArray(data)) {
          console.warn('Nationalities API returned non-array data:', data);
          throw new Error('Invalid data format');
        }
        
        console.log('Nationalities loaded:', data.length, 'nationalities');
        return data;
      } catch (error) {
        console.error('Failed to fetch nationalities:', error);
        // Return fallback data
        return [
          {
            country_name: "Nepal",
            nationality: "Nepalese",
            alpha_2: "NP",
            alpha_3: "NPL", 
            numeric: "524",
            flag_emoji: "🇳🇵",
            is_popular: true
          },
          {
            country_name: "United States",
            nationality: "American",
            alpha_2: "US",
            alpha_3: "USA",
            numeric: "840", 
            flag_emoji: "🇺🇸",
            is_popular: true
          },
          {
            country_name: "India",
            nationality: "Indian",
            alpha_2: "IN",
            alpha_3: "IND",
            numeric: "356",
            flag_emoji: "🇮🇳", 
            is_popular: true
          }
        ];
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};