import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageInput } from '@/components/MessageInput'

interface MessageComposerCardProps {
  message: string
  onMessageChange: (message: string) => void
}

export function MessageComposerCard({ message, onMessageChange }: MessageComposerCardProps) {
  return (
    <Card className="shadow h-fit">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-semibold text-foreground">Compose Message</CardTitle>
      </CardHeader>
      <CardContent>
        <MessageInput
          value={message}
          onChange={onMessageChange}
          maxLength={500}
          className="border-none shadow-none p-0"
        />
      </CardContent>
    </Card>
  )
}