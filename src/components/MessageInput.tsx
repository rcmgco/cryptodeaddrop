import React, { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
}

export function MessageInput({ 
  value, 
  onChange, 
  placeholder = "Write your encrypted message...", 
  maxLength = 500,
  className 
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value])

  const characterCount = value.length
  const remaining = maxLength - characterCount
  const isNearLimit = remaining <= 50
  const isOverLimit = remaining < 0

  const getCharacterCountColor = () => {
    if (isOverLimit) return 'text-destructive'
    if (isNearLimit) return 'text-yellow-500'
    return 'text-muted-foreground'
  }

  const renderMarkdownPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Message Content</Label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isPreviewMode ? 'Edit' : 'Preview'}
          </button>
          <Badge variant={isOverLimit ? "destructive" : "secondary"}>
            <span className={getCharacterCountColor()}>
              {characterCount}/{maxLength}
            </span>
          </Badge>
        </div>
      </div>
        {isPreviewMode ? (
          <div className="min-h-[120px] p-3 bg-muted/50 rounded-lg border">
            {value ? (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(value) }}
              />
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview yet...</p>
            )}
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "min-h-[120px] resize-none transition-all duration-200",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary",
              isOverLimit && "border-destructive focus:border-destructive focus:ring-destructive/20"
            )}
          />
        )}
      
      <div className="text-xs text-muted-foreground">
        <p>
          <strong>Markdown supported:</strong> *italic*, **bold**, `code`
        </p>
        {remaining < 100 && (
          <p className={getCharacterCountColor()}>
            {isOverLimit 
              ? `${Math.abs(remaining)} characters over limit`
              : `${remaining} characters remaining`
            }
          </p>
        )}
      </div>
    </div>
  )
}