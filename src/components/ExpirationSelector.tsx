import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Calendar, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpirationSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

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

export function ExpirationSelector({ value, onChange, className }: ExpirationSelectorProps) {
  const selectedOption = expirationOptions.find(option => option.value === value)

  return (
    <Card className={cn("shadow-card", className)}>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="expiration" className="text-sm font-medium">
            Message Expiration
          </Label>
          <Select value={value} onValueChange={onChange}>
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

        {selectedOption && (
          <div className="bg-secondary/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <selectedOption.icon className={cn("h-4 w-4", selectedOption.color)} />
              <h4 className="text-sm font-medium text-foreground">
                {selectedOption.label} Selected
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedOption.description}. After this time, the message will be automatically 
              removed from the database and cannot be recovered.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}