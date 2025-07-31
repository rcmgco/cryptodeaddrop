import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DecryptionModal } from '@/components/DecryptionModal'
import { Search, Eye, Clock, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react'
import { searchMessages, getRecentMessages, MessageSummary } from '@/services/messageService'
import { realtimeService, MessageUpdate } from '@/services/realtimeService'
import { useAccount } from 'wagmi'
import { useToast } from '@/hooks/use-toast'

export function MessageExplorer() {
  const [searchAddress, setSearchAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<MessageSummary | null>(null)
  const [isDecryptionModalOpen, setIsDecryptionModalOpen] = useState(false)
  const [messages, setMessages] = useState<MessageSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const { address } = useAccount()
  const { toast } = useToast()

  // Load recent messages on component mount
  useEffect(() => {
    loadRecentMessages()
    setupRealtimeConnection()
  }, [])

  // Setup real-time connection when wallet connects
  useEffect(() => {
    if (address) {
      subscribeToAddress(address)
    }
  }, [address])

  // Cleanup real-time connection on unmount
  useEffect(() => {
    return () => {
      cleanupRealtimeConnection()
    }
  }, [])

  const setupRealtimeConnection = async () => {
    try {
      await realtimeService.connect({
        onMessageCreated: handleMessageCreated,
        onMessageUpdated: handleMessageUpdated,
        onMessageDeleted: handleMessageDeleted,
        onError: handleRealtimeError
      })
      setIsRealtimeConnected(true)
    } catch (error) {
      console.error('Failed to setup real-time connection:', error)
      setIsRealtimeConnected(false)
    }
  }

  const subscribeToAddress = async (walletAddress: string) => {
    try {
      await realtimeService.subscribeToAddress(walletAddress, {
        onMessageCreated: handleMessageCreated,
        onMessageUpdated: handleMessageUpdated,
        onMessageDeleted: handleMessageDeleted,
        onError: handleRealtimeError
      })
    } catch (error) {
      console.error('Failed to subscribe to address:', error)
    }
  }

  const cleanupRealtimeConnection = async () => {
    try {
      await realtimeService.disconnect()
      setIsRealtimeConnected(false)
    } catch (error) {
      console.error('Failed to cleanup real-time connection:', error)
    }
  }

  const handleMessageCreated = (messageUpdate: MessageUpdate) => {
    // Convert MessageUpdate to MessageSummary format
    const newMessage: MessageSummary = {
      id: messageUpdate.id,
      recipientAddress: messageUpdate.recipientAddress,
      encryptedAt: messageUpdate.encryptedAt,
      expiresIn: messageUpdate.expiresIn,
      isRead: messageUpdate.isRead,
      expirationDays: messageUpdate.expirationDays
    }

    setMessages(prev => [newMessage, ...prev])
    
    // Show notification for new messages
    if (address && messageUpdate.recipientAddress.toLowerCase() === address.toLowerCase()) {
      toast({
        title: "New Message Received",
        description: "You have received a new encrypted message.",
      })
    }
  }

  const handleMessageUpdated = (messageUpdate: MessageUpdate) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageUpdate.id 
        ? {
            ...msg,
            isRead: messageUpdate.isRead,
            expiresIn: messageUpdate.expiresIn
          }
        : msg
    ))
  }

  const handleMessageDeleted = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const handleRealtimeError = (error: Error) => {
    console.error('Real-time error:', error)
    setIsRealtimeConnected(false)
    toast({
      title: "Connection Error",
      description: "Lost connection to real-time updates. Trying to reconnect...",
      variant: "destructive",
    })
  }

  const loadRecentMessages = async () => {
    setIsLoading(true)
    try {
      const recentMessages = await getRecentMessages(20)
      setMessages(recentMessages)
    } catch (error) {
      console.error('Failed to load recent messages:', error)
      toast({
        title: "Failed to Load Messages",
        description: "Unable to load recent messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      // If search is empty, load recent messages
      await loadRecentMessages()
      return
    }
    
    setIsSearching(true)
    try {
      const searchResults = await searchMessages({
        recipientAddress: searchAddress,
        limit: 20
      })
      setMessages(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
      setMessages([])
      toast({
        title: "Search Failed",
        description: "Unable to search for messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const truncateAddress = (address: string) => {
    if (address.endsWith('.eth')) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleDecryptMessage = (message: MessageSummary) => {
    setSelectedMessage(message)
    setIsDecryptionModalOpen(true)
  }

  const handleCloseDecryptionModal = () => {
    setIsDecryptionModalOpen(false)
    setSelectedMessage(null)
    // Refresh messages after decryption
    if (searchAddress) {
      handleSearch()
    } else {
      loadRecentMessages()
    }
  }

  const getStatusBadge = (isRead: boolean, expiresIn: string) => {
    if (expiresIn.includes('Expired')) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (isRead) {
      return <Badge variant="secondary" className="text-accent">Read ✓</Badge>
    }
    return <Badge variant="outline">Unread</Badge>
  }

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Message Explorer</span>
          <div className="flex items-center gap-2">
            {isRealtimeConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {isRealtimeConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by wallet address to find your messages..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching || isLoading}
            variant="outline"
            className="px-6"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">
              {searchAddress ? (
                <>
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No messages found</p>
                  <p className="text-sm">No messages found for address: {searchAddress}</p>
                </>
              ) : (
                <>
                  <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Messages will appear here as they are encrypted</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground flex items-center justify-between">
              <span>
                Showing {messages.length} message{messages.length !== 1 ? 's' : ''}
                {searchAddress && ` for "${searchAddress}"`}
              </span>
              {isRealtimeConnected && (
                <span className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-3 w-3" />
                  Live updates
                </span>
              )}
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Encrypted</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id} className="hover:bg-muted/50">
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {truncateAddress(message.recipientAddress)}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {message.encryptedAt}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{message.expiresIn}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(message.isRead, message.expiresIn)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={message.isRead ? "outline" : "default"}
                          className="h-8 px-3"
                          onClick={() => handleDecryptMessage(message)}
                        >
                          {message.isRead ? 'View' : 'Decrypt'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      
      <DecryptionModal
        isOpen={isDecryptionModalOpen}
        onClose={handleCloseDecryptionModal}
        message={selectedMessage}
      />
    </Card>
  )
}