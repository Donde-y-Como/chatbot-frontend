export interface QuickResponse {
  id: string;
  shortcut: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuickResponseDto {
  shortcut: string;
  message: string;
}

export interface UpdateQuickResponseDto {
  shortcut?: string;
  message?: string;
}

export interface QuickResponseFormValues {
  shortcut: string;
  message: string;
}

/**
 * Standard error type for quick response API errors
 */
export interface QuickResponseErrorType {
  message: string;
  statusCode: number;
  details: any | null;
}
