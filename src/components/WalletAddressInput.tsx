import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletAddressInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function WalletAddressInput({ value, onChange, className }: WalletAddressInputProps) {
  const [isValidating, setIsValidating] = useState(false)

  // Ethereum address validation
  const isValidEthereumAddress = (address: string): boolean => {
    const regex = /^0x[a-fA-F0-9]{40}$/
    return regex.test(address)
  }

  // ENS domain validation (basic check)
  const isValidENS = (domain: string): boolean => {
    const regex = /^[a-zA-Z0-9-]+\.eth$/
    return regex.test(domain)
  }

  const getValidationStatus = () => {
    if (!value) return 'empty'
    if (value.startsWith('0x')) {
      return isValidEthereumAddress(value) ? 'valid' : 'invalid'
    }
    if (value.endsWith('.eth')) {
      return isValidENS(value) ? 'valid' : 'invalid'
    }
    return 'invalid'
  }

  const validationStatus = getValidationStatus()

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-accent" />
      case 'invalid':
        return <XCircle className="h-5 w-5 text-destructive" />
      case 'empty':
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
      default:
        return null
    }
  }

  const getValidationMessage = () => {
    switch (validationStatus) {
      case 'valid':
        return value.endsWith('.eth') ? 'Valid ENS domain' : 'Valid Ethereum address'
      case 'invalid':
        return 'Invalid address format'
      case 'empty':
        return 'Enter Ethereum address or ENS domain'
      default:
        return ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim()
    onChange(newValue)
  }

  return (
    <Card className={cn("shadow-card", className)}>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wallet-address" className="text-sm font-medium">
            Recipient Wallet Address
          </Label>
          <div className="relative">
            <Input
              id="wallet-address"
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder="0x742d35Cc6625C5532c2B68Deb094B6E0e4b19320 or vitalik.eth"
              className={cn(
                "pr-12 transition-all duration-200",
                "focus:ring-2 focus:ring-primary/20",
                validationStatus === 'valid' && "border-accent focus:border-accent focus:ring-accent/20",
                validationStatus === 'invalid' && "border-destructive focus:border-destructive focus:ring-destructive/20"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getValidationIcon()}
            </div>
          </div>
          <p className={cn(
            "text-xs transition-colors",
            validationStatus === 'valid' && "text-accent",
            validationStatus === 'invalid' && "text-destructive",
            validationStatus === 'empty' && "text-muted-foreground"
          )}>
            {getValidationMessage()}
          </p>
        </div>

        <div className="bg-secondary/50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Supported Formats</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Ethereum Address: 0x742d35Cc6625C5532c2B68Deb094B6E0e4b19320</li>
            <li>• ENS Domain: vitalik.eth</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}