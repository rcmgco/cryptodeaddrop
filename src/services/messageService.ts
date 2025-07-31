import { supabase } from '@/integrations/supabase/client'
import { eciesEncrypt, encodeEncryptedMessage } from '@/lib/encryption'
import { validateAndSanitizeInputs, handleSecureError, messageRateLimiter, searchRateLimiter, validateWalletAddress } from '@/lib/security'

export interface EncryptMessageRequest {
  message: string
  recipientAddress: string
  expirationDays: 1 | 10 | 30
  senderIdentifier?: string
}

export interface EncryptMessageResponse {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Encrypt and store a message for a recipient
 * Includes comprehensive input validation and sanitization
 */
export async function encryptAndStoreMessage({
  message,
  recipientAddress,
  expirationDays,
  senderIdentifier
}: EncryptMessageRequest): Promise<EncryptMessageResponse> {
  try {
    // Rate limiting check
    const clientId = 'anonymous' // In production, use actual user/client ID
    if (!messageRateLimiter.isAllowed(clientId)) {
      const secureError = handleSecureError(
        { code: 'RATE_LIMIT_EXCEEDED' },
        'encryptAndStoreMessage'
      )
      return { success: false, error: secureError.message }
    }

    // Validate and sanitize all inputs
    const validation = validateAndSanitizeInputs({
      message,
      recipientAddress,
      expirationDays,
      senderIdentifier
    })

    if (!validation.isValid) {
      const secureError = handleSecureError(
        { code: 'VALIDATION_ERROR', message: validation.errors.join(', ') },
        'encryptAndStoreMessage'
      )
      return { success: false, error: secureError.message }
    }

    const { sanitized } = validation

    // Encrypt the message using sanitized content
    const encrypted = eciesEncrypt(sanitized.message!, sanitized.recipientAddress!)
    const encryptedContent = encodeEncryptedMessage(encrypted)

    // Store in database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        recipient_address: sanitized.recipientAddress!,
        encrypted_content: encryptedContent,
        expiration_days: sanitized.expirationDays!,
        sender_identifier: sanitized.senderIdentifier || null,
        expires_at: new Date().toISOString() // This will be overwritten by the trigger
      })
      .select('id')
      .single()

    if (error) {
      const secureError = handleSecureError(
        { code: 'DATABASE_ERROR', message: error.message },
        'encryptAndStoreMessage'
      )
      return { success: false, error: secureError.message }
    }

    // Log analytics event
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'message_encrypted',
          recipient_address: sanitized.recipientAddress!,
          message_id: data.id,
          metadata: {
            message_length: sanitized.message!.length,
            expiration_days: sanitized.expirationDays!,
            has_sender_identifier: !!sanitized.senderIdentifier,
            encrypted_at: new Date().toISOString()
          }
        }
      ])

    return { success: true, messageId: data.id }

  } catch (error: any) {
    const secureError = handleSecureError(
      { code: 'ENCRYPTION_ERROR', message: error.message },
      'encryptAndStoreMessage'
    )
    return { success: false, error: secureError.message }
  }
}

/**
 * Search for messages by recipient address
 */
export interface SearchMessagesRequest {
  recipientAddress: string
  limit?: number
  offset?: number
}

export interface MessageSummary {
  id: string
  recipientAddress: string
  encryptedAt: string
  expiresIn: string
  isRead: boolean
  expirationDays: number
}

export async function searchMessages({
  recipientAddress,
  limit = 20,
  offset = 0
}: SearchMessagesRequest): Promise<MessageSummary[]> {
  try {
    // Rate limiting check
    const clientId = recipientAddress.toLowerCase()
    if (!searchRateLimiter.isAllowed(clientId)) {
      console.warn(`Rate limit exceeded for address: ${recipientAddress}`)
      return [] // Return empty results instead of error for better UX
    }

    // Validate recipient address
    if (!validateWalletAddress(recipientAddress)) {
      const secureError = handleSecureError(
        { code: 'VALIDATION_ERROR', message: 'Invalid recipient address' },
        'searchMessages'
      )
      console.error(secureError.logMessage)
      return []
    }

    const { data, error } = await supabase
      .from('messages')
      .select('id, recipient_address, created_at, expires_at, is_read, expiration_days')
      .eq('recipient_address', recipientAddress.toLowerCase())
      .gte('expires_at', new Date().toISOString()) // Only non-expired messages
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      const secureError = handleSecureError(
        { code: 'DATABASE_ERROR', message: error.message },
        'searchMessages'
      )
      console.error(secureError.logMessage)
      return []
    }

    return data.map(msg => ({
      id: msg.id,
      recipientAddress: msg.recipient_address,
      encryptedAt: formatRelativeTime(new Date(msg.created_at)),
      expiresIn: formatExpirationTime(new Date(msg.expires_at)),
      isRead: msg.is_read,
      expirationDays: msg.expiration_days
    }))

  } catch (error: any) {
    const secureError = handleSecureError(
      { code: 'NETWORK_ERROR', message: error.message },
      'searchMessages'
    )
    console.error(secureError.logMessage)
    return []
  }
}

/**
 * Get recent messages (public view)
 */
export async function getRecentMessages(limit: number = 20): Promise<MessageSummary[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, recipient_address, created_at, expires_at, is_read, expiration_days')
      .gte('expires_at', new Date().toISOString()) // Only non-expired messages
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Recent messages error:', error)
      return []
    }

    return data.map(msg => ({
      id: msg.id,
      recipientAddress: msg.recipient_address,
      encryptedAt: formatRelativeTime(new Date(msg.created_at)),
      expiresIn: formatExpirationTime(new Date(msg.expires_at)),
      isRead: msg.is_read,
      expirationDays: msg.expiration_days
    }))

  } catch (error) {
    console.error('Recent messages error:', error)
    return []
  }
}

/**
 * Mark a message as read and log analytics
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    // Update the message
    const { error: updateError } = await supabase
      .from('messages')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', messageId)

    if (updateError) {
      console.error('Mark as read error:', updateError)
      return false
    }

    // Log analytics event
    const { data: messageData } = await supabase
      .from('messages')
      .select('recipient_address')
      .eq('id', messageId)
      .single()

    if (messageData) {
      await supabase
        .from('analytics')
        .insert([
          {
            event_type: 'message_decrypted',
            recipient_address: messageData.recipient_address,
            message_id: messageId,
            metadata: {
              decrypted_at: new Date().toISOString()
            }
          }
        ])
    }

    return true

  } catch (error) {
    console.error('Mark as read error:', error)
    return false
  }
}

/**
 * Get platform analytics
 */
export interface PlatformStats {
  totalEncrypted: number
  totalDecrypted: number
  successRate: number
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const { data: encryptedData } = await supabase
      .from('analytics')
      .select('id', { count: 'exact' })
      .eq('event_type', 'message_encrypted')

    const { data: decryptedData } = await supabase
      .from('analytics')
      .select('id', { count: 'exact' })
      .eq('event_type', 'message_decrypted')

    const totalEncrypted = encryptedData?.length || 0
    const totalDecrypted = decryptedData?.length || 0
    const successRate = totalEncrypted > 0 ? (totalDecrypted / totalEncrypted) * 100 : 0

    return {
      totalEncrypted,
      totalDecrypted,
      successRate: Math.round(successRate * 10) / 10 // Round to 1 decimal place
    }

  } catch (error) {
    console.error('Platform stats error:', error)
    return { totalEncrypted: 0, totalDecrypted: 0, successRate: 0 }
  }
}

// Utility functions
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

function formatExpirationTime(expiresAt: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60))
  
  if (diffInMinutes <= 0) return 'Expired'
  if (diffInMinutes < 60) return `${diffInMinutes}m left`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h left`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d left`
}