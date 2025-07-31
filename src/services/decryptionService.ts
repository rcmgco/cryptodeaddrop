import { supabase } from '@/integrations/supabase/client'
import { eciesDecrypt, decodeEncryptedMessage } from '@/lib/encryption'

export interface DecryptMessageRequest {
  messageId: string
  recipientPrivateKey: Uint8Array
}

export interface DecryptMessageResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * Decrypt a message using the recipient's private key
 * This is a client-side operation for maximum security
 */
export async function decryptMessage({
  messageId,
  recipientPrivateKey
}: DecryptMessageRequest): Promise<DecryptMessageResponse> {
  try {
    // Fetch the encrypted message from database
    const { data: messageData, error } = await supabase
      .from('messages')
      .select('encrypted_content, recipient_address, expires_at, is_read')
      .eq('id', messageId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: 'Message not found' }
    }

    // Check if message has expired
    if (new Date(messageData.expires_at) <= new Date()) {
      return { success: false, error: 'Message has expired' }
    }

    // Decode the encrypted content
    const encryptedData = decodeEncryptedMessage(messageData.encrypted_content)

    // Decrypt the message
    const decryptedMessage = eciesDecrypt(
      encryptedData.ephemeralPublicKey,
      encryptedData.ciphertext,
      encryptedData.iv,
      encryptedData.tag,
      encryptedData.mac,
      recipientPrivateKey
    )

    return { success: true, message: decryptedMessage }

  } catch (error: any) {
    console.error('Decryption error:', error)
    
    if (error.message?.includes('MAC verification failed')) {
      return { success: false, error: 'Invalid private key or corrupted message' }
    }
    
    return { success: false, error: 'Failed to decrypt message' }
  }
}

/**
 * Mock function to get private key from wallet signature
 * In a real implementation, this would derive the private key from the wallet
 * For security reasons, private keys should never leave the wallet
 */
export function mockGetPrivateKeyFromSignature(signature: string): Uint8Array {
  // This is a mock implementation for demo purposes
  // In reality, you would need to use the wallet's signing capabilities
  // and perform the decryption within the wallet environment
  
  // Generate a deterministic private key from signature hash
  const encoder = new TextEncoder()
  const data = encoder.encode(signature)
  
  // Simple hash to 32 bytes (not cryptographically secure, for demo only)
  const hash = new Uint8Array(32)
  for (let i = 0; i < data.length; i++) {
    hash[i % 32] ^= data[i]
  }
  
  return hash
}

/**
 * Verify message ownership before decryption
 */
export async function verifyMessageOwnership(
  messageId: string,
  walletAddress: string
): Promise<{ isOwner: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('recipient_address')
      .eq('id', messageId)
      .single()

    if (error) {
      return { isOwner: false, error: 'Message not found' }
    }

    const isOwner = data.recipient_address.toLowerCase() === walletAddress.toLowerCase()
    
    if (!isOwner) {
      return { isOwner: false, error: 'You are not the intended recipient of this message' }
    }

    return { isOwner: true }

  } catch (error) {
    console.error('Ownership verification error:', error)
    return { isOwner: false, error: 'Failed to verify ownership' }
  }
}

/**
 * Get message metadata for decryption modal
 */
export interface MessageMetadata {
  id: string
  recipientAddress: string
  encryptedAt: string
  expiresAt: string
  isRead: boolean
  expirationDays: number
}

export async function getMessageMetadata(messageId: string): Promise<MessageMetadata | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, recipient_address, created_at, expires_at, is_read, expiration_days')
      .eq('id', messageId)
      .single()

    if (error) {
      console.error('Metadata error:', error)
      return null
    }

    return {
      id: data.id,
      recipientAddress: data.recipient_address,
      encryptedAt: new Date(data.created_at).toLocaleString(),
      expiresAt: new Date(data.expires_at).toLocaleString(),
      isRead: data.is_read,
      expirationDays: data.expiration_days
    }

  } catch (error) {
    console.error('Metadata error:', error)
    return null
  }
}