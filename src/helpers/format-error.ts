/**
 * Interface for QuickBooks API error details
 */
interface QuickBooksError {
  Fault?: {
    Error?: Array<{
      Message?: string;
      Detail?: string;
      code?: string;
      element?: string;
    }>;
    type?: string;
  };
  error_description?: string;
  status?: number;
}

/**
 * Formats an error into a standardized, detailed error message
 * @param error Any error object to format
 * @param context Optional context about the operation (e.g., "create customer", "update invoice")
 * @returns A formatted error message as a string with actionable details
 */
export function formatError(error: unknown, context?: string): string {
  const operation = context ? ` while trying to ${context}` : '';
  
  // Handle QuickBooks API errors with detailed information
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    
    if (response?.data) {
      const qbError = response.data as QuickBooksError;
      
      // Extract QuickBooks Fault error
      if (qbError.Fault?.Error?.[0]) {
        const firstError = qbError.Fault.Error[0];
        const parts: string[] = [`Error${operation}:`];
        
        if (firstError.Message) {
          parts.push(firstError.Message);
        }
        
        if (firstError.Detail) {
          parts.push(`\nDetails: ${firstError.Detail}`);
        }
        
        if (firstError.code) {
          parts.push(`\nError Code: ${firstError.code}`);
        }
        
        if (firstError.element) {
          parts.push(`\nField: ${firstError.element}`);
        }
        
        // Add suggestions for common errors
        const suggestions = getSuggestionForErrorCode(firstError.code);
        if (suggestions) {
          parts.push(`\n\nSuggestion: ${suggestions}`);
        }
        
        return parts.join(' ');
      }
      
      // Handle OAuth or other API errors
      if (qbError.error_description) {
        return `Error${operation}: ${qbError.error_description}`;
      }
    }
    
    // Handle HTTP status errors
    if (response?.status) {
      return `Error${operation}: HTTP ${response.status} - ${getStatusMessage(response.status)}`;
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    let message = `Error${operation}: ${error.message}`;
    
    // Add stack trace in development mode
    if (process.env.NODE_ENV === 'development' && error.stack) {
      message += `\n\nStack trace:\n${error.stack}`;
    }
    
    return message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return `Error${operation}: ${error}`;
  }
  
  // Handle unknown error types
  try {
    return `Unknown error${operation}: ${JSON.stringify(error, null, 2)}`;
  } catch {
    return `Unknown error${operation}: [Unable to serialize error]`;
  }
}

/**
 * Provides user-friendly suggestions based on QuickBooks error codes
 */
function getSuggestionForErrorCode(code?: string): string | null {
  if (!code) return null;
  
  const suggestions: Record<string, string> = {
    '500': 'This is an internal QuickBooks error. Please try again later or contact QuickBooks support.',
    '401': 'Authentication failed. Please check your access token and ensure it hasn\'t expired.',
    '3100': 'A required field is missing. Please check that all required fields are provided.',
    '6000': 'An object with this name already exists. Please use a different name or update the existing object.',
    '610': 'Object not found. Please verify the ID is correct.',
    '6140': 'One of the fields contains an invalid value. Please check the field values match QuickBooks requirements.',
    '4001': 'This object is already deleted.',
    '270': 'You don\'t have permission to perform this operation.',
  };
  
  return suggestions[code] || null;
}

/**
 * Provides user-friendly messages for HTTP status codes
 */
function getStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Bad Request - The request was invalid',
    401: 'Unauthorized - Authentication failed or token expired',
    403: 'Forbidden - You don\'t have permission to access this resource',
    404: 'Not Found - The requested resource doesn\'t exist',
    429: 'Too Many Requests - Rate limit exceeded, please try again later',
    500: 'Internal Server Error - QuickBooks encountered an error',
    503: 'Service Unavailable - QuickBooks is temporarily unavailable',
  };
  
  return messages[status] || 'An unexpected error occurred';
}

/**
 * Creates a validation error message
 */
export function formatValidationError(errors: string[]): string {
  return `Validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`;
}

