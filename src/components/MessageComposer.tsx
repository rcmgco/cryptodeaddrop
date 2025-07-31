import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageInput } from '@/components/MessageInput'
import { WalletAddressInput } from '@/components/WalletAddressInput'
import { ExpirationSelector } from '@/components/ExpirationSelector'
import { Shield, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

  const isAddressValid = recipientAddress && (
    isValidEthereumAddress(recipientAddress) || isValidENS(recipientAddress)
  )

  const isFormValid = message.trim().length > 0 && 
                     message.length <= 500 && 
                     isAddressValid &&
                     expiration

  const handleEncrypt = async () => {
    if (!isFormValid) return

    setIsEncrypting(true)
    
    try {
      // Simulate encryption process for now
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Message Encrypted Successfully",
        description: `Message encrypted for ${recipientAddress} with ${expiration} day expiration.`,
      })

      // Reset form
      setMessage('')
      setRecipientAddress('')
      setExpiration('10')
      
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
    <div className="space-y-6">
      <MessageInput
        value={message}
        onChange={setMessage}
        maxLength={500}
      />

      <WalletAddressInput
        value={recipientAddress}
        onChange={setRecipientAddress}
      />

      <ExpirationSelector
        value={expiration}
        onChange={setExpiration}
      />

      <div className="flex flex-col gap-4">
        <Button
          onClick={handleEncrypt}
          disabled={!isFormValid || isEncrypting}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 hover:shadow-lg transition-all duration-300"
        >
          {isEncrypting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Encrypting Message...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-5 w-5" />
              Encrypt & Send Message
            </>
          )}
        </Button>

        {!isFormValid && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Please ensure:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {!message.trim() && <li>Message is not empty</li>}
              {message.length > 500 && <li>Message is under 500 characters</li>}
              {!isAddressValid && <li>Valid Ethereum address or ENS domain</li>}
              {!expiration && <li>Expiration time is selected</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}