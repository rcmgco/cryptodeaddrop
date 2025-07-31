import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 } from '@noble/hashes/sha256'
import { randomBytes } from '@noble/hashes/utils'
import { gcm } from '@noble/ciphers/aes'
import { utf8ToBytes, bytesToUtf8, concatBytes } from '@noble/hashes/utils'

/**
 * ECIES (Elliptic Curve Integrated Encryption Scheme) implementation
 * for encrypting messages using Ethereum wallet addresses
 */

/**
 * Derive public key from Ethereum address
 * Note: This is a simplified version. In production, you'd need the actual public key
 * from the blockchain or use a different approach.
 */
export function derivePublicKeyFromAddress(address: string): Uint8Array {
  // This is a mock implementation. In reality, you'd need to:
  // 1. Look up transactions from this address
  // 2. Extract the public key from signature recovery
  // 3. Use ENS public key records
  // For demo purposes, we'll generate a deterministic key from the address
  const addressBytes = utf8ToBytes(address.toLowerCase())
  const hash = sha256(addressBytes)
  // Use the hash as a private key to generate a public key (for demo only)
  const privateKey = hash.slice(0, 32)
  return secp256k1.getPublicKey(privateKey, false) // uncompressed
}

/**
 * Generate ephemeral key pair for ECIES encryption
 */
export function generateEphemeralKeyPair() {
  const privateKey = randomBytes(32)
  const publicKey = secp256k1.getPublicKey(privateKey, false)
  return { privateKey, publicKey }
}

/**
 * Perform ECDH key exchange to derive shared secret
 */
export function deriveSharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
  const point = secp256k1.getSharedSecret(privateKey, publicKey, false)
  // Use the x-coordinate as the shared secret
  return point.slice(1, 33)
}

/**
 * Derive encryption and MAC keys from shared secret using HKDF
 */
export function deriveKeys(sharedSecret: Uint8Array, salt: Uint8Array = new Uint8Array(0)): {
  encryptionKey: Uint8Array
  macKey: Uint8Array
} {
  const info = utf8ToBytes('DeGhost-Messenger-v0.1')
  const prk = sha256(concatBytes(salt, sharedSecret))
  
  // Derive 64 bytes: 32 for encryption, 32 for MAC
  const okm = new Uint8Array(64)
  const t1 = sha256(concatBytes(prk, info, new Uint8Array([1])))
  const t2 = sha256(concatBytes(prk, t1, info, new Uint8Array([2])))
  
  okm.set(t1, 0)
  okm.set(t2, 32)
  
  return {
    encryptionKey: okm.slice(0, 32),
    macKey: okm.slice(32, 64)
  }
}

/**
 * Encrypt a message using AES-256-GCM
 */
export function encryptMessage(message: string, key: Uint8Array): {
  ciphertext: Uint8Array
  iv: Uint8Array
  tag: Uint8Array
} {
  const iv = randomBytes(12) // 96-bit IV for GCM
  const messageBytes = utf8ToBytes(message)
  
  const cipher = gcm(key, iv)
  const ciphertext = cipher.encrypt(messageBytes)
  
  return {
    ciphertext: ciphertext.slice(0, -16), // Remove tag from end
    iv,
    tag: ciphertext.slice(-16) // Last 16 bytes are the tag
  }
}

/**
 * Decrypt a message using AES-256-GCM
 */
export function decryptMessage(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array
): string {
  const cipher = gcm(key, iv)
  const encrypted = concatBytes(ciphertext, tag)
  const decrypted = cipher.decrypt(encrypted)
  return bytesToUtf8(decrypted)
}

/**
 * Complete ECIES encryption process
 */
export function eciesEncrypt(message: string, recipientAddress: string): {
  ephemeralPublicKey: Uint8Array
  ciphertext: Uint8Array
  iv: Uint8Array
  tag: Uint8Array
  mac: Uint8Array
} {
  // Generate ephemeral key pair
  const { privateKey: ephemeralPrivateKey, publicKey: ephemeralPublicKey } = generateEphemeralKeyPair()
  
  // Derive recipient's public key from address
  const recipientPublicKey = derivePublicKeyFromAddress(recipientAddress)
  
  // Derive shared secret
  const sharedSecret = deriveSharedSecret(ephemeralPrivateKey, recipientPublicKey)
  
  // Derive encryption and MAC keys
  const { encryptionKey, macKey } = deriveKeys(sharedSecret)
  
  // Encrypt the message
  const { ciphertext, iv, tag } = encryptMessage(message, encryptionKey)
  
  // Calculate MAC over ephemeral public key + ciphertext + iv + tag
  const macData = concatBytes(ephemeralPublicKey, ciphertext, iv, tag)
  const mac = sha256(concatBytes(macKey, macData))
  
  return {
    ephemeralPublicKey,
    ciphertext,
    iv,
    tag,
    mac
  }
}

/**
 * Complete ECIES decryption process
 */
export function eciesDecrypt(
  ephemeralPublicKey: Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
  mac: Uint8Array,
  recipientPrivateKey: Uint8Array
): string {
  // Derive shared secret
  const sharedSecret = deriveSharedSecret(recipientPrivateKey, ephemeralPublicKey)
  
  // Derive encryption and MAC keys
  const { encryptionKey, macKey } = deriveKeys(sharedSecret)
  
  // Verify MAC
  const macData = concatBytes(ephemeralPublicKey, ciphertext, iv, tag)
  const expectedMac = sha256(concatBytes(macKey, macData))
  
  // Compare MACs in constant time
  let macValid = true
  for (let i = 0; i < mac.length; i++) {
    if (mac[i] !== expectedMac[i]) {
      macValid = false
    }
  }
  
  if (!macValid) {
    throw new Error('MAC verification failed - message may have been tampered with')
  }
  
  // Decrypt the message
  return decryptMessage(ciphertext, encryptionKey, iv, tag)
}

/**
 * Utility functions for encoding/decoding encrypted data
 */
export function encodeEncryptedMessage(encrypted: {
  ephemeralPublicKey: Uint8Array
  ciphertext: Uint8Array
  iv: Uint8Array
  tag: Uint8Array
  mac: Uint8Array
}): string {
  const combined = concatBytes(
    encrypted.ephemeralPublicKey,
    encrypted.iv,
    encrypted.tag,
    encrypted.mac,
    encrypted.ciphertext
  )
  return btoa(String.fromCharCode(...combined))
}

export function decodeEncryptedMessage(encoded: string): {
  ephemeralPublicKey: Uint8Array
  ciphertext: Uint8Array
  iv: Uint8Array
  tag: Uint8Array
  mac: Uint8Array
} {
  const combined = new Uint8Array(atob(encoded).split('').map(c => c.charCodeAt(0)))
  
  const ephemeralPublicKey = combined.slice(0, 65) // 65 bytes for uncompressed public key
  const iv = combined.slice(65, 77) // 12 bytes
  const tag = combined.slice(77, 93) // 16 bytes
  const mac = combined.slice(93, 125) // 32 bytes
  const ciphertext = combined.slice(125) // Rest is ciphertext
  
  return { ephemeralPublicKey, iv, tag, mac, ciphertext }
}