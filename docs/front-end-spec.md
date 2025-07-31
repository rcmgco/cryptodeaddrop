# CryptoDeadDrop v0.1 - UX/UI Specification

## Design System Overview

CryptoDeadDrop uses a modern, privacy-focused design system with a dark theme optimized for security-conscious users. The interface emphasizes simplicity, clarity, and trust while maintaining a professional appearance.

## Color Palette

### Primary Colors
- **Primary**: `hsl(220 13% 91%)` - Light gray for primary text
- **Primary Foreground**: `hsl(220 9% 46%)` - Darker gray for contrast
- **Secondary**: `hsl(215 27% 16%)` - Dark blue-gray for secondary elements
- **Secondary Foreground**: `hsl(215 20% 65%)` - Light blue-gray for secondary text

### Accent Colors
- **Accent**: `hsl(215 27% 16%)` - Dark accent for highlights
- **Accent Foreground**: `hsl(210 40% 98%)` - Light accent text
- **Destructive**: `hsl(0 84% 60%)` - Red for errors and warnings
- **Destructive Foreground**: `hsl(210 40% 98%)` - Light text on destructive elements

### Background Colors
- **Background**: `hsl(224 71% 4%)` - Very dark blue for main background
- **Foreground**: `hsl(213 31% 91%)` - Light text on dark background
- **Card**: `hsl(224 71% 4%)` - Dark card backgrounds
- **Card Foreground**: `hsl(213 31% 91%)` - Light text on cards
- **Popover**: `hsl(224 71% 4%)` - Dark popover backgrounds
- **Popover Foreground**: `hsl(213 31% 91%)` - Light text on popovers

### Border Colors
- **Border**: `hsl(215 27% 16%)` - Subtle borders
- **Input**: `hsl(215 27% 16%)` - Input field borders
- **Ring**: `hsl(216 12% 84%)` - Focus ring color

## Typography

### Font Stack
- **Primary**: `Inter` - Modern, readable sans-serif
- **Monospace**: `JetBrains Mono` - For code and addresses
- **Fallback**: `system-ui, -apple-system, sans-serif`

### Font Sizes
- **xs**: `0.75rem` (12px) - Small labels and captions
- **sm**: `0.875rem` (14px) - Body text
- **base**: `1rem` (16px) - Default text size
- **lg**: `1.125rem` (18px) - Large body text
- **xl**: `1.25rem` (20px) - Section headers
- **2xl**: `1.5rem` (24px) - Page headers
- **3xl**: `1.875rem` (30px) - Hero text
- **4xl**: `2.25rem` (36px) - Large hero text

### Font Weights
- **Normal**: `400` - Regular text
- **Medium**: `500` - Emphasis
- **Semibold**: `600` - Headers
- **Bold**: `700` - Strong emphasis

## Layout Structure

### Main Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ [Logo] CryptoDeadDrop v0.1 [                    ] [Theme]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Hero Section                                                │
│ CryptoDeadDrop v0.1                                         │
│ Anonymous. Encrypted. Ephemeral.                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Message Composer                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Message Input] [Address Input] [Expiration] [Send]    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Message Explorer                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Search] [Messages Table] [Decrypt Modal]              │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Analytics Dashboard                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Stats Cards] [Charts] [Activity Feed]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ How It Works                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Encryption Process] [Decryption Process] [Security]   │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
│ CryptoDeadDrop v0.1 - Anonymous. Encrypted. Ephemeral.     │
└─────────────────────────────────────────────────────────────┘
```

## Component Specifications

### Header Component
```tsx
<header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-14 items-center">
    <div className="flex items-center space-x-2">
      <Shield className="h-8 w-8 text-primary" />
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-foreground">CryptoDeadDrop</h1>
        <span className="text-xs text-muted-foreground">v0.1</span>
      </div>
    </div>
    <div className="flex flex-1 items-center justify-end space-x-2">
      <WalletConnection />
      <ThemeToggle />
    </div>
  </div>
</header>
```

### Message Composer
```tsx
<Card className="w-full">
  <CardHeader>
    <CardTitle>Send Encrypted Message</CardTitle>
    <CardDescription>
      Compose and encrypt a message for any Ethereum wallet address
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea
        id="message"
        placeholder="Enter your message (max 500 characters)..."
        maxLength={500}
        className="min-h-[120px]"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Markdown supported</span>
        <span>{messageLength}/500</span>
      </div>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="recipient">Recipient Address</Label>
      <Input
        id="recipient"
        placeholder="0x..."
        className="font-mono"
      />
    </div>
    
    <div className="space-y-2">
      <Label>Expiration</Label>
      <ExpirationSelector />
    </div>
    
    <Button className="w-full" disabled={!isValid}>
      <Lock className="mr-2 h-4 w-4" />
      Encrypt & Send
    </Button>
  </CardContent>
</Card>
```

### Message Explorer
```tsx
<Card className="w-full">
  <CardHeader>
    <CardTitle>Message Explorer</CardTitle>
    <CardDescription>
      Search and decrypt messages sent to your wallet address
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex space-x-2">
      <Input
        placeholder="Enter your wallet address..."
        className="font-mono flex-1"
      />
      <Button>
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </div>
    
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell>{formatDate(message.createdAt)}</TableCell>
              <TableCell className="font-mono">
                {truncateAddress(message.recipientAddress)}
              </TableCell>
              <TableCell>
                <Badge variant={message.expired ? "destructive" : "default"}>
                  {message.expired ? "Expired" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => handleDecrypt(message.id)}
                  disabled={message.expired}
                >
                  <Unlock className="mr-2 h-4 w-4" />
                  Decrypt
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
```

### Analytics Dashboard
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
      <MessageSquare className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.totalMessages}</div>
      <p className="text-xs text-muted-foreground">
        +{stats.newMessagesToday} today
      </p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Successful Decryptions</CardTitle>
      <Unlock className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.totalDecryptions}</div>
      <p className="text-xs text-muted-foreground">
        {stats.successRate}% success rate
      </p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
      <Users className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.activeWallets}</div>
      <p className="text-xs text-muted-foreground">
        +{stats.newWalletsToday} today
      </p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Messages Expired</CardTitle>
      <Clock className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.expiredMessages}</div>
      <p className="text-xs text-muted-foreground">
        Automatic cleanup
      </p>
    </CardContent>
  </Card>
</div>
```

## Responsive Design

### Breakpoints
- **Mobile**: `max-width: 640px`
- **Tablet**: `min-width: 641px` and `max-width: 1024px`
- **Desktop**: `min-width: 1025px`

### Mobile Layout
```
┌─────────────────┐
│ Header          │
│ [Logo] [Menu]   │
├─────────────────┤
│ Hero            │
│ (Stacked)       │
├─────────────────┤
│ Composer        │
│ (Full Width)    │
├─────────────────┤
│ Explorer        │
│ (Full Width)    │
├─────────────────┤
│ Analytics       │
│ (2x2 Grid)      │
├─────────────────┤
│ Footer          │
└─────────────────┘
```

### Tablet Layout
```
┌─────────────────────────────────┐
│ Header                          │
│ [Logo] [                    ]   │
├─────────────────────────────────┤
│ Hero                            │
│ (Centered)                      │
├─────────────────────────────────┤
│ Composer | Explorer             │
│ (Side by Side)                  │
├─────────────────────────────────┤
│ Analytics                       │
│ (2x2 Grid)                      │
├─────────────────────────────────┤
│ Footer                          │
└─────────────────────────────────┘
```

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ [Logo] [                    ] [Theme] [Wallet]             │
├─────────────────────────────────────────────────────────────┤
│ Hero Section                                                │
│ (Centered, Large)                                           │
├─────────────────────────────────────────────────────────────┤
│ Composer | Explorer                                         │
│ (Side by Side, Equal Width)                                 │
├─────────────────────────────────────────────────────────────┤
│ Analytics Dashboard                                         │
│ (4x1 Grid)                                                  │
├─────────────────────────────────────────────────────────────┤
│ How It Works                                                │
│ (2x1 Grid)                                                  │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

## Interactive States

### Button States
- **Default**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **Secondary**: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Destructive**: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- **Disabled**: `opacity-50 cursor-not-allowed`

### Input States
- **Default**: `border-input bg-background`
- **Focus**: `ring-2 ring-ring ring-offset-2`
- **Error**: `border-destructive focus:ring-destructive`
- **Success**: `border-green-500 focus:ring-green-500`

### Loading States
- **Spinner**: `animate-spin` with `Loader2` icon
- **Skeleton**: `animate-pulse` with `bg-muted`
- **Disabled**: `opacity-50 cursor-not-allowed`

## Accessibility

### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Focus Indicators**: Clear focus rings on all interactive elements
- **Skip Links**: Skip to main content for screen readers

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Live Regions**: Announce dynamic content changes
- **Semantic HTML**: Proper heading hierarchy and landmarks

### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: Minimum 3:1 contrast ratio

## Animation & Transitions

### Micro-interactions
- **Hover Effects**: Subtle scale and color transitions
- **Focus Transitions**: Smooth focus ring animations
- **Loading States**: Spinner and skeleton animations

### Page Transitions
- **Route Changes**: Fade in/out transitions
- **Modal Open/Close**: Scale and fade animations
- **Form Submissions**: Loading state transitions

### Performance
- **Hardware Acceleration**: Use `transform` and `opacity` for animations
- **Reduced Motion**: Respect user's motion preferences
- **Efficient Animations**: Use `will-change` sparingly

## Error States

### Form Validation
- **Inline Errors**: Show errors below input fields
- **Error Icons**: Visual indicators for invalid fields
- **Error Messages**: Clear, actionable error text

### Network Errors
- **Retry Buttons**: Allow users to retry failed operations
- **Error Boundaries**: Graceful handling of unexpected errors
- **Offline Support**: Handle network connectivity issues

### Wallet Errors
- **Connection Issues**: Clear messaging for wallet problems
- **Signature Failures**: Helpful guidance for signature errors
- **Network Mismatches**: Warn about wrong network connections

## Success States

### Message Encryption
- **Success Toast**: Confirm message was encrypted and sent
- **Clear Form**: Reset form after successful submission
- **Visual Feedback**: Brief success animation

### Message Decryption
- **Success Modal**: Display decrypted message
- **Copy Option**: Allow copying decrypted content
- **Read Receipt**: Confirm message was read

### Wallet Connection
- **Connected State**: Clear indication of wallet status
- **Address Display**: Show truncated wallet address
- **Disconnect Option**: Easy way to disconnect wallet

---

**Design System Version**: v0.1  
**Last Updated**: July 31, 2025  
**Next Review**: August 31, 2025