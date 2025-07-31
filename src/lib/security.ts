import DOMPurify from 'dompurify'

/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes all HTML tags and potentially dangerous content
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Remove all HTML tags and dangerous content
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  }).trim()
}

/**
 * Sanitize input but allow basic formatting for display
 * Only allows safe HTML tags for rich text display
 */
export function sanitizeRichText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Allow only safe HTML tags for rich text
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre', 'br', 'p'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true
  }).trim()
}

/**
 * Validate Ethereum address format
 * Checks for proper 0x prefix and 40 hex characters
 */
export function validateEthereumAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }
  
  // Basic Ethereum address validation
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
  return ethAddressRegex.test(address.trim())
}

/**
 * Validate ENS domain format
 * Basic validation for ENS domains
 */
export function validateENSDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false
  }
  
  // Basic ENS domain validation
  const ensRegex = /^[a-zA-Z0-9-]+\.eth$/
  return ensRegex.test(domain.trim().toLowerCase())
}

/**
 * Validate wallet address (Ethereum or ENS)
 */
export function validateWalletAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }
  
  const trimmedAddress = address.trim()
  return validateEthereumAddress(trimmedAddress) || validateENSDomain(trimmedAddress)
}

/**
 * Validate message content
 * Checks length and sanitizes content
 */
export function validateMessageContent(content: string): {
  isValid: boolean
  sanitizedContent: string
  error?: string
} {
  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      sanitizedContent: '',
      error: 'Message content is required'
    }
  }
  
  const sanitized = sanitizeInput(content)
  
  if (sanitized.length === 0) {
    return {
      isValid: false,
      sanitizedContent: '',
      error: 'Message content cannot be empty'
    }
  }
  
  if (sanitized.length > 500) {
    return {
      isValid: false,
      sanitizedContent: '',
      error: 'Message content exceeds 500 character limit'
    }
  }
  
  return {
    isValid: true,
    sanitizedContent: sanitized
  }
}

/**
 * Validate expiration days
 * Only allows 1, 10, or 30 days
 */
export function validateExpirationDays(days: number): boolean {
  return [1, 10, 30].includes(days)
}

/**
 * Rate limiting helper
 * Simple in-memory rate limiting (for demo purposes)
 * In production, use Redis or similar
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (record.count >= this.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - record.count)
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier)
    return record ? record.resetTime : Date.now()
  }
}

// Export rate limiter instances for different endpoints
export const messageRateLimiter = new RateLimiter(15 * 60 * 1000, 50) // 50 messages per 15 minutes
export const searchRateLimiter = new RateLimiter(5 * 60 * 1000, 100)   // 100 searches per 5 minutes
export const walletRateLimiter = new RateLimiter(1 * 60 * 1000, 10)    // 10 wallet operations per minute

/**
 * Secure error handling
 * Prevents information disclosure in error messages
 */
export function handleSecureError(error: any, context: string = 'application'): {
  message: string
  code: string
  logMessage: string
} {
  // Log the full error for debugging
  console.error(`[${context}] Error:`, error)
  
  // Return sanitized error message to user
  const errorCode = error?.code || 'UNKNOWN_ERROR'
  const userMessage = getSecureErrorMessage(errorCode)
  
  return {
    message: userMessage,
    code: errorCode,
    logMessage: `[${context}] ${errorCode}: ${error?.message || 'Unknown error'}`
  }
}

/**
 * Get secure error messages for users
 * Maps error codes to user-friendly messages without exposing internals
 */
function getSecureErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'VALIDATION_ERROR': 'Invalid input provided. Please check your data and try again.',
    'AUTHENTICATION_ERROR': 'Authentication failed. Please connect your wallet and try again.',
    'AUTHORIZATION_ERROR': 'You are not authorized to perform this action.',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
    'NETWORK_ERROR': 'Network connection error. Please check your connection and try again.',
    'ENCRYPTION_ERROR': 'Message encryption failed. Please try again.',
    'DECRYPTION_ERROR': 'Message decryption failed. Please verify your wallet connection.',
    'DATABASE_ERROR': 'Service temporarily unavailable. Please try again later.',
    'WALLET_ERROR': 'Wallet operation failed. Please check your wallet connection.',
    'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
  }
  
  return errorMessages[code] || errorMessages['UNKNOWN_ERROR']
}

/**
 * Validate and sanitize all user inputs
 * Comprehensive input validation for security
 */
export function validateAndSanitizeInputs(inputs: {
  message?: string
  recipientAddress?: string
  expirationDays?: number
  senderIdentifier?: string
}): {
  isValid: boolean
  sanitized: {
    message?: string
    recipientAddress?: string
    expirationDays?: number
    senderIdentifier?: string
  }
  errors: string[]
} {
  const errors: string[] = []
  const sanitized: any = {}

  // Validate message content
  if (inputs.message !== undefined) {
    const messageValidation = validateMessageContent(inputs.message)
    if (!messageValidation.isValid) {
      errors.push(messageValidation.error!)
    } else {
      sanitized.message = messageValidation.sanitizedContent
    }
  }

  // Validate recipient address
  if (inputs.recipientAddress !== undefined) {
    if (!validateWalletAddress(inputs.recipientAddress)) {
      errors.push('Invalid recipient address format')
    } else {
      sanitized.recipientAddress = inputs.recipientAddress.trim().toLowerCase()
    }
  }

  // Validate expiration days
  if (inputs.expirationDays !== undefined) {
    if (!validateExpirationDays(inputs.expirationDays)) {
      errors.push('Invalid expiration days. Must be 1, 10, or 30')
    } else {
      sanitized.expirationDays = inputs.expirationDays
    }
  }

  // Validate sender identifier (optional)
  if (inputs.senderIdentifier !== undefined && inputs.senderIdentifier) {
    const sanitizedIdentifier = sanitizeInput(inputs.senderIdentifier)
    if (sanitizedIdentifier.length > 100) {
      errors.push('Sender identifier too long (max 100 characters)')
    } else {
      sanitized.senderIdentifier = sanitizedIdentifier
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  }
} 