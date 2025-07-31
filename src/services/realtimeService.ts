import { supabase } from '@/integrations/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface MessageUpdate {
  id: string
  recipientAddress: string
  encryptedAt: string
  expiresIn: string
  isRead: boolean
  expirationDays: number
  type: 'INSERT' | 'UPDATE' | 'DELETE'
}

export interface RealtimeCallbacks {
  onMessageCreated?: (message: MessageUpdate) => void
  onMessageUpdated?: (message: MessageUpdate) => void
  onMessageDeleted?: (messageId: string) => void
  onError?: (error: Error) => void
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private isConnected = false

  /**
   * Connect to real-time subscriptions
   */
  async connect(callbacks: RealtimeCallbacks): Promise<void> {
    if (this.isConnected) return

    try {
      // Subscribe to messages table changes
      const messagesChannel = supabase
        .channel('messages_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const message = this.formatMessageUpdate(payload.new, 'INSERT')
            callbacks.onMessageCreated?.(message)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const message = this.formatMessageUpdate(payload.new, 'UPDATE')
            callbacks.onMessageUpdated?.(message)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            callbacks.onMessageDeleted?.(payload.old.id)
          }
        )
        .on('error', (error) => {
          console.error('Real-time error:', error)
          callbacks.onError?.(new Error(error.message))
        })

      await messagesChannel.subscribe()
      this.channels.set('messages', messagesChannel)
      this.isConnected = true

      console.log('Real-time subscriptions connected')
    } catch (error) {
      console.error('Failed to connect to real-time:', error)
      callbacks.onError?.(error as Error)
    }
  }

  /**
   * Disconnect from real-time subscriptions
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) return

    try {
      for (const [name, channel] of this.channels) {
        await supabase.removeChannel(channel)
        console.log(`Disconnected from ${name} channel`)
      }
      
      this.channels.clear()
      this.isConnected = false
    } catch (error) {
      console.error('Failed to disconnect from real-time:', error)
    }
  }

  /**
   * Subscribe to messages for a specific address
   */
  async subscribeToAddress(address: string, callbacks: RealtimeCallbacks): Promise<void> {
    const channelName = `messages_${address.toLowerCase()}`
    
    if (this.channels.has(channelName)) {
      return // Already subscribed
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `recipient_address=eq.${address.toLowerCase()}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const message = this.formatMessageUpdate(payload.new, 'INSERT')
              callbacks.onMessageCreated?.(message)
            } else if (payload.eventType === 'UPDATE') {
              const message = this.formatMessageUpdate(payload.new, 'UPDATE')
              callbacks.onMessageUpdated?.(message)
            } else if (payload.eventType === 'DELETE') {
              callbacks.onMessageDeleted?.(payload.old.id)
            }
          }
        )
        .on('error', (error) => {
          console.error(`Real-time error for ${address}:`, error)
          callbacks.onError?.(new Error(error.message))
        })

      await channel.subscribe()
      this.channels.set(channelName, channel)
      
      console.log(`Subscribed to messages for ${address}`)
    } catch (error) {
      console.error(`Failed to subscribe to ${address}:`, error)
      callbacks.onError?.(error as Error)
    }
  }

  /**
   * Unsubscribe from messages for a specific address
   */
  async unsubscribeFromAddress(address: string): Promise<void> {
    const channelName = `messages_${address.toLowerCase()}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      try {
        await supabase.removeChannel(channel)
        this.channels.delete(channelName)
        console.log(`Unsubscribed from messages for ${address}`)
      } catch (error) {
        console.error(`Failed to unsubscribe from ${address}:`, error)
      }
    }
  }

  /**
   * Check if connected to real-time
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  /**
   * Format message update from database payload
   */
  private formatMessageUpdate(data: any, type: 'INSERT' | 'UPDATE' | 'DELETE'): MessageUpdate {
    return {
      id: data.id,
      recipientAddress: data.recipient_address,
      encryptedAt: this.formatRelativeTime(new Date(data.created_at)),
      expiresIn: this.formatExpirationTime(new Date(data.expires_at)),
      isRead: data.is_read,
      expirationDays: data.expiration_days,
      type
    }
  }

  /**
   * Format relative time
   */
  private formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  /**
   * Format expiration time
   */
  private formatExpirationTime(expiresAt: Date): string {
    const now = new Date()
    const diffInMinutes = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60))
    
    if (diffInMinutes <= 0) return 'Expired'
    if (diffInMinutes < 60) return `${diffInMinutes}m left`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h left`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d left`
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService() 