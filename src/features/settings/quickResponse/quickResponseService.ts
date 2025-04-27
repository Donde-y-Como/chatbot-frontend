import { api } from '@/api/axiosInstance';
import { AxiosError } from 'axios';
import { 
  QuickResponse, 
  CreateQuickResponseDto, 
  UpdateQuickResponseDto,
  QuickResponseErrorType
} from './types';
import { mockQuickResponses } from './mockData';

// Configuration
const CONFIG = {
  useMockData: true,
  endpoints: {
    base: '/quick-responses'
  },
  mockDelays: {
    get: 500,
    getById: 300,
    create: 500,
    update: 500,
    delete: 500
  }
};

/**
 * Helper to simulate API delay
 */
const simulateDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Custom error handler for quick response API errors
 * @param error The error caught during the API call
 * @returns A standardized error object
 */
const handleApiError = (error: unknown): never => {
  const errorResponse: QuickResponseErrorType = {
    message: 'An unexpected error occurred',
    statusCode: 500,
    details: null
  };

  if (error instanceof Error) {
    errorResponse.message = error.message;
    // Check for custom status code we might have added
    if ('statusCode' in error && typeof (error as any).statusCode === 'number') {
      errorResponse.statusCode = (error as any).statusCode;
    }
  }
  
  if (error instanceof AxiosError && error.response) {
    errorResponse.statusCode = error.response.status;
    errorResponse.details = error.response.data;
  }

  console.error('API Error:', errorResponse);
  throw errorResponse;
};

/**
 * Get all quick responses
 * @returns Promise with array of quick responses
 */
export const getQuickResponses = async (): Promise<QuickResponse[]> => {
  try {
    if (CONFIG.useMockData) {
      await simulateDelay(CONFIG.mockDelays.get);
      return [...mockQuickResponses];
    }
    
    const response = await api.get<QuickResponse[]>(CONFIG.endpoints.base);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get a specific quick response by id
 * @param id The id of the quick response to fetch
 * @returns Promise with the requested quick response
 * @throws Error if quick response is not found
 */
export const getQuickResponse = async (id: string): Promise<QuickResponse> => {
  try {
    if (CONFIG.useMockData) {
      await simulateDelay(CONFIG.mockDelays.getById);
      const quickResponse = mockQuickResponses.find(qr => qr.id === id);
      
      if (!quickResponse) {
        const error = new Error(`Quick response with id ${id} not found`);
        (error as any).statusCode = 404;
        throw error;
      }
      
      return {...quickResponse};
    }
    
    const response = await api.get<QuickResponse>(`${CONFIG.endpoints.base}/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create a new quick response
 * @param data The data for creating a new quick response
 * @returns Promise with the newly created quick response
 */
export const createQuickResponse = async (data: CreateQuickResponseDto): Promise<QuickResponse> => {
  try {
    if (CONFIG.useMockData) {
      await simulateDelay(CONFIG.mockDelays.create);
      
      const newQuickResponse: QuickResponse = {
        id: String(Date.now()), // Using timestamp for more unique IDs
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockQuickResponses.push(newQuickResponse);
      return {...newQuickResponse};
    }
    
    const response = await api.post<QuickResponse>(CONFIG.endpoints.base, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update an existing quick response
 * @param id The id of the quick response to update
 * @param data The data to update the quick response with
 * @returns Promise with the updated quick response
 * @throws Error if quick response is not found
 */
export const updateQuickResponse = async (id: string, data: UpdateQuickResponseDto): Promise<QuickResponse> => {
  try {
    if (CONFIG.useMockData) {
      await simulateDelay(CONFIG.mockDelays.update);
      
      const index = mockQuickResponses.findIndex(qr => qr.id === id);
      if (index === -1) {
        const error = new Error(`Quick response with id ${id} not found`);
        (error as any).statusCode = 404;
        throw error;
      }
      
      const updatedQuickResponse = {
        ...mockQuickResponses[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      mockQuickResponses[index] = updatedQuickResponse;
      return {...updatedQuickResponse};
    }
    
    const response = await api.put<QuickResponse>(`${CONFIG.endpoints.base}/${id}`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a quick response
 * @param id The id of the quick response to delete
 * @throws Error if quick response is not found
 */
export const deleteQuickResponse = async (id: string): Promise<void> => {
  try {
    if (CONFIG.useMockData) {
      await simulateDelay(CONFIG.mockDelays.delete);
      
      const index = mockQuickResponses.findIndex(qr => qr.id === id);
      if (index === -1) {
        const error = new Error(`Quick response with id ${id} not found`);
        (error as any).statusCode = 404;
        throw error;
      }
      
      mockQuickResponses.splice(index, 1);
      return;
    }
    
    await api.delete(`${CONFIG.endpoints.base}/${id}`);
    return;
  } catch (error) {
    return handleApiError(error);
  }
};
