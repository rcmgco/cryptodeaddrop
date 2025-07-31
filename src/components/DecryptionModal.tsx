import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Loader2, CheckCircle, Lock, User, Clock, Eye } from 'lucide-react'
import { useSignature } from '@/hooks/useSignature'
import { useAccount } from 'wagmi'
import { cn } from '@/lib/utils'
import { MessageSummary } from '@/services/messageService'

interface DecryptionModalProps {
  isOpen: boolean
  onClose: () => void
  message: MessageSummary | null
}

export function DecryptionModal({ isOpen, onClose, message }: DecryptionModalProps) {
  const [isDecrypted, setIsDecrypted] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState<string>('')
  const { address } = useAccount()
  const { verifyOwnership, isSigningInProgress, resetChallenge } = useSignature()

  // Mock decrypted content
  const mockDecryptedContent = `**Hello there!** 

This is a *secret* message encrypted specifically for you using your wallet address.

Only you can read this message because you hold the private key to decrypt it.

Hope you're having a great day! 🎉

*DeGhost Messenger - Secure. Decentralized. Ephemeral.*`

  const handleVerifyOwnership = async () => {
    if (!message) return

    const success = await verifyOwnership(message.id)
    
    if (success) {
      // Simulate message decryption
      setDecryptedContent(mockDecryptedContent)
      setIsDecrypted(true)
      
      // Here you would normally:
      // 1. Send the signature to your backend
      // 2. Decrypt the message server-side or client-side
      // 3. Mark the message as read in the database
      // 4. Send read receipt
    }
  }

  const handleClose = () => {
    setIsDecrypted(false)
    setDecryptedContent('')
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
                <CheckCircle className="h-5 w-5 text-accent" />
                Message Decrypted
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-primary" />
                Message Decryption
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isDecrypted 
              ? "Your message has been successfully decrypted and a read receipt has been sent."
              : "Sign with your wallet to prove ownership and decrypt this message."
            }
          </DialogDescription>
        </DialogHeader>

        {message && (
          <div className="space-y-6">
            {/* Message Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Recipient</p>
                      <p className="font-mono">{truncateAddress(message.recipientAddress)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Encrypted</p>
                      <p>{message.encryptedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p>{message.expiresIn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={message.isRead ? "secondary" : "outline"}>
                        {message.isRead ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authorization Check */}
            {!isAuthorized && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <Shield className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Unauthorized Access</p>
                      <p className="text-sm text-muted-foreground">
                        This message was not encrypted for your wallet address.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Decryption Content */}
            <Card>
              <CardContent className="pt-6">
                {!isDecrypted ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Lock className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Message is Encrypted</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Click "Verify Ownership" to sign with your wallet and decrypt this message.
                        This signature is gasless and will not cost any fees.
                      </p>
                      <Button
                        onClick={handleVerifyOwnership}
                        disabled={isSigningInProgress || !isAuthorized}
                        className="w-full max-w-xs"
                      >
                        {isSigningInProgress ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying Ownership...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Verify Ownership
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-accent">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Successfully Decrypted</span>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ 
                          __html: decryptedContent
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
                            .replace(/\n/g, '<br>')
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Read receipt sent automatically
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}