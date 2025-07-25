import { z } from 'zod';

// Response validation schemas
const ApiResponseSchema = z.object({
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  errors: z.record(z.array(z.string())).optional(),
});

const PaginatedResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(z.any()),
});

export class ApiClient {
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
      throw new Error(`Expected JSON response, got ${contentType}`);
    }
    
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Invalid JSON response from server');
    }
    
    // Validate response structure
    const validationResult = ApiResponseSchema.safeParse(data);
    if (!validationResult.success) {
      console.warn('API response validation failed:', validationResult.error);
    }
    
    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}`;
      throw new ApiError(errorMessage, response.status, data.errors);
    }
    
    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}