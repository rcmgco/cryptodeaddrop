import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  sanitizeInput,
  sanitizeRichText,
  validateEthereumAddress,
  validateENSDomain,
  validateWalletAddress,
  validateMessageContent,
  validateExpirationDays,
  messageRateLimiter,
  searchRateLimiter,
  walletRateLimiter,
  handleSecureError,
  validateAndSanitizeInputs
} from './security'

describe('Security Utilities', () => {
  beforeEach(() => {
    // Reset rate limiters before each test
    vi.clearAllMocks()
  })

  describe('Input Sanitization', () => {
    it('should sanitize input and remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello <b>World</b>'
      const result = sanitizeInput(input)
      expect(result).toBe('alert("xss")Hello World')
    })

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })

    it('should sanitize rich text but allow safe tags', () => {
      const input = '<script>alert("xss")</script>Hello <b>World</b> <i>test</i>'
      const result = sanitizeRichText(input)
      expect(result).toBe('alert("xss")Hello <b>World</b> <i>test</i>')
    })

    it('should handle special characters', () => {
      const input = 'Test & < > " \' characters'
      const result = sanitizeInput(input)
      expect(result).toBe('Test &   characters')
    })
  })

  describe('Address Validation', () => {
    it('should validate correct Ethereum addresses', () => {
      const validAddresses = [
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        '0xABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD'
      ]

      validAddresses.forEach(address => {
        expect(validateEthereumAddress(address)).toBe(true)
      })
    })

    it('should reject invalid Ethereum addresses', () => {
      const invalidAddresses = [
        '0x123456789012345678901234567890123456789', // too short
        '0x12345678901234567890123456789012345678901', // too long
        '0x123456789012345678901234567890123456789g', // invalid character
        '1234567890123456789012345678901234567890', // no 0x prefix
        '0x', // too short
        '' // empty
      ]

      invalidAddresses.forEach(address => {
        expect(validateEthereumAddress(address)).toBe(false)
      })
    })

    it('should validate correct ENS domains', () => {
      const validENS = [
        'test.eth',
        'my-domain.eth',
        'domain123.eth',
        'test-domain.eth'
      ]

      validENS.forEach(domain => {
        expect(validateENSDomain(domain)).toBe(true)
      })
    })

    it('should reject invalid ENS domains', () => {
      const invalidENS = [
        'test.com',
        '.eth',
        'test.',
        'test.eth.com',
        'test_eth',
        'test.eth.',
        ''
      ]

      invalidENS.forEach(domain => {
        expect(validateENSDomain(domain)).toBe(false)
      })
    })

    it('should validate wallet addresses (Ethereum or ENS)', () => {
      expect(validateWalletAddress('0x1234567890123456789012345678901234567890')).toBe(true)
      expect(validateWalletAddress('test.eth')).toBe(true)
      expect(validateWalletAddress('invalid')).toBe(false)
    })
  })

  describe('Message Content Validation', () => {
    it('should validate correct message content', () => {
      const validMessage = 'This is a valid message'
      const result = validateMessageContent(validMessage)
      
      expect(result.isValid).toBe(true)
      expect(result.sanitizedContent).toBe(validMessage)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty messages', () => {
      const result = validateMessageContent('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Message content is required')
    })

    it('should reject messages that are too long', () => {
      const longMessage = 'a'.repeat(501)
      const result = validateMessageContent(longMessage)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Message content exceeds 500 character limit')
    })

    it('should handle messages exactly at the limit', () => {
      const maxMessage = 'a'.repeat(500)
      const result = validateMessageContent(maxMessage)
      
      expect(result.isValid).toBe(true)
      expect(result.sanitizedContent).toBe(maxMessage)
    })

    it('should sanitize message content', () => {
      const messageWithHTML = '<script>alert("xss")</script>Hello World'
      const result = validateMessageContent(messageWithHTML)
      
      expect(result.isValid).toBe(true)
      expect(result.sanitizedContent).toBe('alert("xss")Hello World')
    })
  })

  describe('Expiration Validation', () => {
    it('should validate correct expiration days', () => {
      expect(validateExpirationDays(1)).toBe(true)
      expect(validateExpirationDays(10)).toBe(true)
      expect(validateExpirationDays(30)).toBe(true)
    })

    it('should reject invalid expiration days', () => {
      expect(validateExpirationDays(0)).toBe(false)
      expect(validateExpirationDays(5)).toBe(false)
      expect(validateExpirationDays(15)).toBe(false)
      expect(validateExpirationDays(100)).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      const clientId = 'test-client'
      
      // Should allow first 50 requests
      for (let i = 0; i < 50; i++) {
        expect(messageRateLimiter.isAllowed(clientId)).toBe(true)
      }
    })

    it('should block requests over rate limit', () => {
      const clientId = 'test-client-2'
      
      // Make 50 requests (at limit)
      for (let i = 0; i < 50; i++) {
        messageRateLimiter.isAllowed(clientId)
      }
      
      // 51st request should be blocked
      expect(messageRateLimiter.isAllowed(clientId)).toBe(false)
    })

    it('should reset rate limit after window expires', () => {
      const clientId = 'test-client-3'
      
      // Make some requests
      messageRateLimiter.isAllowed(clientId)
      messageRateLimiter.isAllowed(clientId)
      
      // Mock time passing
      const originalDate = Date.now
      Date.now = vi.fn(() => originalDate() + 16 * 60 * 1000) // 16 minutes later
      
      // Should be allowed again
      expect(messageRateLimiter.isAllowed(clientId)).toBe(true)
      
      // Restore original Date.now
      Date.now = originalDate
    })

    it('should track remaining requests correctly', () => {
      const clientId = 'test-client-4'
      
      expect(messageRateLimiter.getRemainingRequests(clientId)).toBe(50)
      
      messageRateLimiter.isAllowed(clientId)
      expect(messageRateLimiter.getRemainingRequests(clientId)).toBe(49)
    })
  })

  describe('Secure Error Handling', () => {
    it('should return sanitized error messages', () => {
      const error = { code: 'VALIDATION_ERROR', message: 'Internal details' }
      const result = handleSecureError(error, 'test-context')
      
      expect(result.message).toBe('Invalid input provided. Please check your data and try again.')
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.logMessage).toContain('test-context')
    })

    it('should handle unknown error codes', () => {
      const error = { code: 'UNKNOWN_CODE' }
      const result = handleSecureError(error, 'test-context')
      
      expect(result.message).toBe('An unexpected error occurred. Please try again.')
      expect(result.code).toBe('UNKNOWN_CODE')
    })

    it('should handle errors without codes', () => {
      const error = { message: 'Some error' }
      const result = handleSecureError(error, 'test-context')
      
      expect(result.message).toBe('An unexpected error occurred. Please try again.')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('Comprehensive Input Validation', () => {
    it('should validate all inputs correctly', () => {
      const inputs = {
        message: 'Hello World',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        expirationDays: 10,
        senderIdentifier: 'Test Sender'
      }
      
      const result = validateAndSanitizeInputs(inputs)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.sanitized.message).toBe('Hello World')
      expect(result.sanitized.recipientAddress).toBe('0x1234567890123456789012345678901234567890')
      expect(result.sanitized.expirationDays).toBe(10)
      expect(result.sanitized.senderIdentifier).toBe('Test Sender')
    })

    it('should collect all validation errors', () => {
      const inputs = {
        message: '<script>alert("xss")</script>',
        recipientAddress: 'invalid-address',
        expirationDays: 5,
        senderIdentifier: 'a'.repeat(101) // too long
      }
      
      const result = validateAndSanitizeInputs(inputs)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid recipient address format')
      expect(result.errors).toContain('Invalid expiration days. Must be 1, 10, or 30')
      expect(result.errors).toContain('Sender identifier too long (max 100 characters)')
    })

    it('should handle partial inputs', () => {
      const inputs = {
        message: 'Test message',
        recipientAddress: '0x1234567890123456789012345678901234567890'
        // Missing expirationDays and senderIdentifier
      }
      
      const result = validateAndSanitizeInputs(inputs)
      
      expect(result.isValid).toBe(true)
      expect(result.sanitized.message).toBe('Test message')
      expect(result.sanitized.recipientAddress).toBe('0x1234567890123456789012345678901234567890')
      expect(result.sanitized.expirationDays).toBeUndefined()
      expect(result.sanitized.senderIdentifier).toBeUndefined()
    })

    it('should sanitize message content', () => {
      const inputs = {
        message: '<script>alert("xss")</script>Hello <b>World</b>',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        expirationDays: 1
      }
      
      const result = validateAndSanitizeInputs(inputs)
      
      expect(result.isValid).toBe(true)
      expect(result.sanitized.message).toBe('alert("xss")Hello World')
    })
  })
}) 