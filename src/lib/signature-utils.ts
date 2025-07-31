import { BrowserProvider, verifyMessage } from 'ethers'
import { useAccount, useSignMessage } from 'wagmi'

/**
 * Generate a challenge message for signature verification
 * This follows EIP-191 standard for message signing
 */
export function generateChallengeMessage(address: string, messageId: string): string {
  const timestamp = Date.now()
  const message = `CryptoDeadDrop v0.1

By signing this message, you are proving ownership of the wallet address:
${address}

You are requesting to decrypt message:
${messageId}

This signature is gasless and will not cost any fees.

Timestamp: ${timestamp}
Nonce: ${Math.random().toString(36).substring(2, 15)}`

  return message
}

/**
 * Verify that a signature was created by the owner of the given address
 */
export async function verifySignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    const recoveredAddress = verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

/**
 * Create a signature challenge for wallet ownership verification
 */
export interface SignatureChallenge {
  message: string
  messageId: string
  address: string
  timestamp: number
}

export function createSignatureChallenge(address: string, messageId: string): SignatureChallenge {
  return {
    message: generateChallengeMessage(address, messageId),
    messageId,
    address,
    timestamp: Date.now()
  }
}

/**
 * Validate that a signature challenge is still valid (not expired)
 */
export function isChallengeValid(challenge: SignatureChallenge, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now()
  return (now - challenge.timestamp) < maxAgeMs
}