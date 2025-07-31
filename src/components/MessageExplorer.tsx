import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Eye, Clock, CheckCircle, XCircle } from 'lucide-react'

// Mock data for demonstration
const mockMessages = [
  {
    id: '1',
    recipientAddress: '0x742d35Cc6625C5532c2B68Deb094B6E0e4b19320',
    encryptedAt: '2 hours ago',
    expiresIn: '22 hours',
    isRead: false,
    expiration: '1 day'
  },
  {
    id: '2', 
    recipientAddress: '0x8ba1f109551bD432803012645Hac136c82da2d23',
    encryptedAt: '1 day ago',
    expiresIn: '9 days',
    isRead: true,
    expiration: '10 days'
  },
  {
    id: '3',
    recipientAddress: 'vitalik.eth',
    encryptedAt: '3 days ago',
    expiresIn: '27 days',
    isRead: false,
    expiration: '30 days'
  }
]

export function MessageExplorer() {
  const [searchAddress, setSearchAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const filteredMessages = searchAddress 
    ? mockMessages.filter(msg => 
        msg.recipientAddress.toLowerCase().includes(searchAddress.toLowerCase())
      )
    : mockMessages

  const handleSearch = async () => {
    if (!searchAddress.trim()) return
    
    setIsSearching(true)
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSearching(false)
  }

  const truncateAddress = (address: string) => {
    if (address.endsWith('.eth')) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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
    <Card className="shadow-card">
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
            disabled={isSearching || !searchAddress.trim()}
            variant="outline"
            className="px-6"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredMessages.length === 0 ? (
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
              Showing {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
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
                  {filteredMessages.map((message) => (
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
    </Card>
  )
}