import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DecryptionModal } from '@/components/DecryptionModal'
import { Search, Eye, Clock, CheckCircle, XCircle } from 'lucide-react'
import { searchMessages, getRecentMessages, MessageSummary } from '@/services/messageService'

export function MessageExplorer() {
  const [searchAddress, setSearchAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<MessageSummary | null>(null)
  const [isDecryptionModalOpen, setIsDecryptionModalOpen] = useState(false)
  const [messages, setMessages] = useState<MessageSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load recent messages on component mount
  useEffect(() => {
    loadRecentMessages()
  }, [])

  const loadRecentMessages = async () => {
    setIsLoading(true)
    try {
      const recentMessages = await getRecentMessages(20)
      setMessages(recentMessages)
    } catch (error) {
      console.error('Failed to load recent messages:', error)
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
        <CardTitle className="text-lg">Message Explorer</CardTitle>
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
            <div className="text-sm text-muted-foreground">
              Showing {messages.length} message{messages.length !== 1 ? 's' : ''}
              {searchAddress && ` for "${searchAddress}"`}
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