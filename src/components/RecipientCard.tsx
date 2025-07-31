import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, XCircle, AlertCircle, Clock, Calendar, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

const expirationOptions = [
  {
    value: '1',
    label: '1 Day',
    description: 'Message expires in 24 hours',
    icon: Clock,
    color: 'text-yellow-500'
  },
  {
    value: '10', 
    label: '10 Days',
    description: 'Message expires in 10 days',
    icon: Calendar,
    color: 'text-blue-500'
  },
  {
    value: '30',
    label: '30 Days', 
    description: 'Message expires in 30 days',
    icon: CalendarDays,
    color: 'text-green-500'
  }
]

interface RecipientCardProps {
  recipientAddress: string
  onRecipientAddressChange: (address: string) => void
  expiration: string
  onExpirationChange: (expiration: string) => void
}

export function RecipientCard({
  recipientAddress,
  onRecipientAddressChange,
  expiration,
  onExpirationChange
}: RecipientCardProps) {
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

  const selectedOption = expirationOptions.find(option => option.value === expiration)

  return (
    <Card className="shadow h-fit">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-semibold text-foreground">Recipient</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipient Address */}
        <div className="space-y-2">
          <Label htmlFor="wallet-address" className="text-sm font-medium">
            Recipient Wallet Address
          </Label>
          <div className="relative">
            <Input
              id="wallet-address"
              type="text"
              value={recipientAddress}
              onChange={(e) => onRecipientAddressChange(e.target.value.trim())}
              placeholder="0x742d35Cc... or vitalik.eth"
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
            {validationStatus === 'valid' 
              ? (recipientAddress.endsWith('.eth') ? 'Valid ENS domain' : 'Valid Ethereum address')
              : validationStatus === 'invalid' 
              ? 'Invalid address format'
              : 'Enter Ethereum address or ENS domain'
            }
          </p>
        </div>

        {/* Expiration Selector */}
        <div className="space-y-2">
          <Label htmlFor="expiration" className="text-sm font-medium">
            Message Expiration
          </Label>
          <Select value={expiration} onValueChange={onExpirationChange}>
            <SelectTrigger 
              id="expiration"
              className="w-full focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <SelectValue placeholder="Choose expiration time">
                {selectedOption && (
                  <div className="flex items-center gap-2">
                    <selectedOption.icon className={cn("h-4 w-4", selectedOption.color)} />
                    <span>{selectedOption.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {expirationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-3 py-1">
                    <option.icon className={cn("h-4 w-4", option.color)} />
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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