import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageComposerCard } from '@/components/MessageComposerCard'
import { RecipientCard } from '@/components/RecipientCard'
import { Shield, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { encryptAndStoreMessage } from '@/services/messageService'

export function MessageComposer() {
  const [message, setMessage] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [expiration, setExpiration] = useState('10')
  const [isEncrypting, setIsEncrypting] = useState(false)
  const { toast } = useToast()

  const isValidEthereumAddress = (address: string): boolean => {
    const regex = /^0x[a-fA-F0-9]{40}$/
    return regex.test(address)
  }

  const isValidENS = (domain: string): boolean => {
    const regex = /^[a-zA-Z0-9-]+\.eth$/
    return regex.test(domain)
  }

  const getValidationStatus = () => {
    if (!recipientAddress) return 'empty'
    if (recipientAddress.startsWith('0x')) {
      return isValidEthereumAddress(recipientAddress) ? 'valid' : 'invalid'
    }
    if (recipientAddress.endsWith('.eth')) {
      return isValidENS(recipientAddress) ? 'valid' : 'invalid'
    }
    return 'invalid'
  }

  const validationStatus = getValidationStatus()
  const isAddressValid = validationStatus === 'valid'
  const isFormValid = message.trim().length > 0 && 
                     message.length <= 500 && 
                     isAddressValid &&
                     expiration

  const handleEncrypt = async () => {
    if (!isFormValid) return

    setIsEncrypting(true)
    
    try {
      const result = await encryptAndStoreMessage({
        message,
        recipientAddress,
        expirationDays: parseInt(expiration) as 1 | 10 | 30
      })

      if (result.success) {
        toast({
          title: "Message Encrypted Successfully",
          description: `Message encrypted for ${recipientAddress} with ${expiration} day expiration.`,
        })

        // Reset form
        setMessage('')
        setRecipientAddress('')
        setExpiration('10')
      } else {
        toast({
          title: "Encryption Failed",
          description: result.error || "There was an error encrypting your message.",
          variant: "destructive",
        })
      }
      
    } catch (error) {
      toast({
        title: "Encryption Failed",
        description: "There was an error encrypting your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEncrypting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Two Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MessageComposerCard
          message={message}
          onMessageChange={setMessage}
        />
        <RecipientCard
          recipientAddress={recipientAddress}
          onRecipientAddressChange={setRecipientAddress}
          expiration={expiration}
          onExpirationChange={setExpiration}
        />
      </div>

      {/* Centered Encrypt Button */}
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={handleEncrypt}
          disabled={!isFormValid || isEncrypting}
          size="lg"
          className="w-full max-w-md h-14 text-lg font-semibold bg-primary hover:bg-primary/90 hover:shadow-lg transition-all duration-300"
        >
          {isEncrypting ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Encrypting Message...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-6 w-6" />
              Encrypt & Send Message
            </>
          )}
        </Button>

        {!isFormValid && (
          <div className="text-xs text-muted-foreground text-center max-w-md">
            <p className="mb-2">Please ensure:</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              {!message.trim() && <span>• Message is not empty</span>}
              {message.length > 500 && <span>• Message is under 500 characters</span>}
              {!isAddressValid && <span>• Valid Ethereum address or ENS domain</span>}
              {!expiration && <span>• Expiration time is selected</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}