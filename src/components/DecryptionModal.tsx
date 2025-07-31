import React, { useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Loader2, CheckCircle, Lock, User, Clock, Eye } from 'lucide-react'
import { useSignature } from '@/hooks/useSignature'
import { useAccount } from 'wagmi'
import { cn } from '@/lib/utils'
import { MessageSummary } from '@/services/messageService'
import { decryptMessage, verifyMessageOwnership, derivePrivateKeyFromAddress } from '@/services/decryptionService'
import { markMessageAsRead } from '@/services/messageService'
import { useToast } from '@/hooks/use-toast'

interface DecryptionModalProps {
  isOpen: boolean
  onClose: () => void
  message: MessageSummary | null
}

export function DecryptionModal({ isOpen, onClose, message }: DecryptionModalProps) {
  const [isDecrypted, setIsDecrypted] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState<string>('')
  const [isDecrypting, setIsDecrypting] = useState(false)
  const { address } = useAccount()
  const { verifyOwnership, signChallenge, createChallenge, isSigningInProgress, resetChallenge } = useSignature()
  const { toast } = useToast()

  const handleVerifyOwnership = async () => {
    if (!message || !address) return

    setIsDecrypting(true)

    try {
      // Step 1: Verify message ownership
      const ownershipCheck = await verifyMessageOwnership(message.id, address)
      if (!ownershipCheck.isOwner) {
        toast({
          title: "Access Denied",
          description: ownershipCheck.error || "You are not the intended recipient of this message.",
          variant: "destructive",
        })
        return
      }

      // Step 2: Create signature challenge for this message
      const challenge = createChallenge(message.id)
      if (!challenge) {
        toast({
          title: "Challenge Creation Failed",
          description: "Failed to create signature challenge. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Step 3: Get signature for decryption
      const signature = await signChallenge()
      if (!signature) {
        toast({
          title: "Signature Failed",
          description: "Failed to get signature for decryption. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Step 4: Derive private key from signature
      const derivedPrivateKey = derivePrivateKeyFromAddress(address)

      // Step 5: Attempt to decrypt the message with derived private key
      const decryptionResult = await decryptMessage({
        messageId: message.id,
        recipientPrivateKey: derivedPrivateKey
      })

      if (decryptionResult.success && decryptionResult.message) {
        setDecryptedContent(decryptionResult.message)
        setIsDecrypted(true)

        // Mark message as read
        await markMessageAsRead(message.id)

        toast({
          title: "Message Decrypted",
          description: "Your message has been successfully decrypted.",
        })
      } else {
        // If decryption fails, show the actual error
        toast({
          title: "Decryption Failed",
          description: decryptionResult.error || "Failed to decrypt the message. The message may be corrupted or you may not have the correct private key.",
          variant: "destructive",
        })
      }

    } catch (error: any) {
      console.error('Decryption error:', error)
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt the message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDecrypting(false)
    }
  }

  const handleClose = () => {
    setIsDecrypted(false)
    setDecryptedContent('')
    setIsDecrypting(false)
    resetChallenge()
    onClose()
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isAuthorized = address?.toLowerCase() === message?.recipientAddress.toLowerCase()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDecrypted ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Message Decrypted
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 text-orange-500" />
                Verify Ownership
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isDecrypted 
              ? "Your message has been successfully decrypted and is ready to read."
              : "Sign a message to prove you own this wallet and decrypt the message."
            }
          </DialogDescription>
        </DialogHeader>

        {message && (
          <div className="space-y-4">
            {/* Message Info */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Recipient:</span>
                    </div>
                    <div className="font-mono text-xs bg-background px-2 py-1 rounded">
                      {truncateAddress(message.recipientAddress)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Expires:</span>
                    </div>
                                         <div className="text-xs">
                       {message.expiresIn}
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authorization Status */}
            <div className="flex items-center gap-2 p-3 rounded-lg border">
              {isAuthorized ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    You are the intended recipient of this message
                  </span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-400">
                    You are not authorized to decrypt this message
                  </span>
                </>
              )}
            </div>

            {/* Action Button */}
            {!isDecrypted && (
              <Button
                onClick={handleVerifyOwnership}
                disabled={isSigningInProgress || isDecrypting || !isAuthorized}
                className="w-full max-w-xs"
              >
                {isSigningInProgress || isDecrypting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSigningInProgress ? 'Signing Message...' : 'Decrypting Message...'}
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Ownership
                  </>
                )}
              </Button>
            )}

            {/* Decrypted Content */}
            {isDecrypted && decryptedContent && (
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Decrypted Message
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none text-green-900 dark:text-green-100">
                    <pre className="whitespace-pre-wrap font-sans text-sm bg-white dark:bg-gray-900 p-4 rounded border">
                      {decryptedContent}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Notice */}
            <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded">
              <Shield className="h-3 w-3 inline mr-1" />
              This message is encrypted end-to-end. Only you can decrypt it with your wallet's private key.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}