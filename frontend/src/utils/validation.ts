/**
 * Validation utilities for form inputs
 */

/**
 * File validation options
 */
export interface FileValidationOptions {
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed file types (MIME types) */
  allowedTypes?: string[];
  /** Required flag - if true, absence of file will fail validation */
  required?: boolean;
}

/**
 * Default file validation options
 */
const defaultFileValidationOptions: FileValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  required: false
};

/**
 * Validates a file against specified options
 * @param file The file to validate
 * @param options Validation options
 * @returns An object with validation result and error message if any
 */
export function validateFile(file: File | null | undefined, options: FileValidationOptions = {}): { 
  isValid: boolean; 
  message?: string;
} {
  const opts = { ...defaultFileValidationOptions, ...options };
  
  // Check if file is required but not provided
  if (opts.required && !file) {
    return { isValid: false, message: 'File is required' };
  }
  
  // If file is not required and not provided, it's valid
  if (!file) {
    return { isValid: true };
  }
  
  // Check file size
  if (opts.maxSize && file.size > opts.maxSize) {
    const maxSizeMB = Math.round(opts.maxSize / (1024 * 1024));
    return { 
      isValid: false, 
      message: `File size exceeds the maximum allowed size (${maxSizeMB}MB)` 
    };
  }
  
  // Check file type
  if (opts.allowedTypes && opts.allowedTypes.length > 0 && !opts.allowedTypes.includes(file.type)) {
    const allowedExtensions = opts.allowedTypes.map(type => {
      switch (type) {
        case 'application/pdf': return 'PDF';
        case 'application/vnd.ms-powerpoint': return 'PPT';
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': return 'PPTX';
        case 'application/msword': return 'DOC';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'DOCX';
        default: return type.split('/').pop()?.toUpperCase();
      }
    }).filter(Boolean).join(', ');
    
    return { 
      isValid: false, 
      message: `Invalid file type. Allowed types: ${allowedExtensions}` 
    };
  }
  
  return { isValid: true };
}

/**
 * Text input validation options
 */
export interface TextValidationOptions {
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Required flag - if true, empty string will fail validation */
  required?: boolean;
  /** Pattern to match (regular expression) */
  pattern?: RegExp;
  /** Custom validation function */
  validator?: (value: string) => boolean;
}

/**
 * Default text validation options
 */
const defaultTextValidationOptions: TextValidationOptions = {
  required: true,
  minLength: 1,
  maxLength: 255
};

/**
 * Validates a text input against specified options
 * @param value The text value to validate
 * @param options Validation options
 * @returns An object with validation result and error message if any
 */
export function validateText(value: string, options: TextValidationOptions = {}): {
  isValid: boolean;
  message?: string;
} {
  const opts = { ...defaultTextValidationOptions, ...options };
  
  // Check if required but empty
  if (opts.required && (!value || value.trim() === '')) {
    return { isValid: false, message: 'This field is required' };
  }
  
  // If not required and empty, it's valid
  if ((!opts.required && !value) || value === '') {
    return { isValid: true };
  }
  
  // Check minimum length
  if (opts.minLength !== undefined && value.length < opts.minLength) {
    return { 
      isValid: false, 
      message: `Must be at least ${opts.minLength} character${opts.minLength !== 1 ? 's' : ''}` 
    };
  }
  
  // Check maximum length
  if (opts.maxLength !== undefined && value.length > opts.maxLength) {
    return { 
      isValid: false, 
      message: `Cannot exceed ${opts.maxLength} character${opts.maxLength !== 1 ? 's' : ''}` 
    };
  }
  
  // Check pattern
  if (opts.pattern && !opts.pattern.test(value)) {
    return { isValid: false, message: 'Invalid format' };
  }
  
  // Check custom validator
  if (opts.validator && !opts.validator(value)) {
    return { isValid: false, message: 'Invalid value' };
  }
  
  return { isValid: true };
}