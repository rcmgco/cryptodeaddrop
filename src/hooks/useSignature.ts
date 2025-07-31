import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { createSignatureChallenge, verifySignature, SignatureChallenge } from '@/lib/signature-utils'
import { useToast } from '@/hooks/use-toast'

export interface UseSignatureReturn {
  challenge: SignatureChallenge | null
  isSigningInProgress: boolean
  createChallenge: (messageId: string) => SignatureChallenge | null
  signChallenge: () => Promise<string | null>
  verifyOwnership: (messageId: string) => Promise<boolean>
  resetChallenge: () => void
}

export function useSignature(): UseSignatureReturn {
  const [challenge, setChallenge] = useState<SignatureChallenge | null>(null)
  const [isSigningInProgress, setIsSigningInProgress] = useState(false)
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { toast } = useToast()

  const createChallenge = (messageId: string): SignatureChallenge | null => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return null
    }

    const newChallenge = createSignatureChallenge(address, messageId)
    setChallenge(newChallenge)
    return newChallenge
  }

  const signChallenge = async (): Promise<string | null> => {
    if (!challenge || !address) {
      toast({
        title: "No Challenge Available",
        description: "Please create a challenge first.",
        variant: "destructive",
      })
      return null
    }

    setIsSigningInProgress(true)

    try {
      const signature = await signMessageAsync({
        account: address,
        message: challenge.message
      })

      // Verify the signature locally
      const isValid = await verifySignature(challenge.message, signature, address)
      
      if (!isValid) {
        throw new Error('Signature verification failed')
      }

      toast({
        title: "Signature Verified",
        description: "Wallet ownership confirmed successfully.",
      })

      return signature
    } catch (error: any) {
      console.error('Signature failed:', error)
      
      let errorMessage = "Failed to sign message."
      if (error?.code === 4001) {
        errorMessage = "Signature was rejected by user."
      } else if (error?.message?.includes('verification failed')) {
        errorMessage = "Signature verification failed."
      }

      toast({
        title: "Signature Failed",
        description: errorMessage,
        variant: "destructive",
      })

      return null
    } finally {
      setIsSigningInProgress(false)
    }
  }

  const verifyOwnership = async (messageId: string): Promise<boolean> => {
    const newChallenge = createChallenge(messageId)
    if (!newChallenge) return false

    const signature = await signChallenge()
    return signature !== null
  }

  const resetChallenge = () => {
    setChallenge(null)
    setIsSigningInProgress(false)
  }

  return {
    challenge,
    isSigningInProgress,
    createChallenge,
    signChallenge,
    verifyOwnership,
    resetChallenge
  }
}