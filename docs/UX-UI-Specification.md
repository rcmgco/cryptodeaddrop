# DeGhost Messenger v0.1 - UX/UI Specification

## Design Philosophy
**Dark Cyberpunk Aesthetic** inspired by the Doom 64 theme with modern Web3 sensibilities. The interface should feel futuristic, secure, and professional while maintaining excellent usability.

## Design System

### Color Palette (Doom 64 Theme)
- **Primary**: Deep reds and oranges (#FF6B35, #D63031)
- **Secondary**: Dark grays and blacks (#2D3436, #636E72)
- **Accent**: Bright highlights (#00B894, #0984E3)
- **Background**: Rich dark tones with subtle gradients
- **Text**: High contrast whites and light grays

### Typography
- **Headers**: Bold, futuristic sans-serif
- **Body**: Clean, readable monospace or sans-serif
- **Code/Addresses**: Monospace for wallet addresses and technical content

### Components Theme
- Rounded corners with subtle shadows
- Glowing borders for active states
- Smooth transitions and micro-animations
- High contrast for accessibility

## Layout Structure

### 1. Header Navigation
```
[DeGhost Messenger v0.1 Logo] [                    ] [Theme Toggle] [Wallet Status]
```
- **Logo**: Cyberpunk-styled logo with version number
- **Theme Toggle**: Light/Dark mode switch with smooth transition
- **Wallet Status**: Connection indicator with address truncation

### 2. Hero Section
```
┌─────────────────────────────────────────────────────────────┐
│  [Icon] DeGhost Messenger v0.1                             │
│  Secure. Decentralized. Ephemeral.                         │
│                                                             │
│  Send encrypted messages using Ethereum wallet addresses.   │
│  Only the private key holder can decrypt and read them.    │
└─────────────────────────────────────────────────────────────┘
```

### 3. Main Interface Layout
```
┌─────────────────────┐ ┌─────────────────────────────────────┐
│                     │ │                                     │
│   Message Composer  │ │        Message Explorer             │
│                     │ │                                     │
│   - Text Area       │ │   [Search: Enter wallet address]   │
│   - Markdown Preview│ │                                     │
│   - Character Count │ │   ┌─────────────────────────────┐   │
│   - Wallet Address  │ │   │ Address  │ Date │ Exp │ Read │   │
│   - Expiration      │ │   ├─────────────────────────────┤   │
│   - Encrypt Button  │ │   │ 0x123... │ 2h   │ 1d  │ ✓   │   │
│                     │ │   │ 0x456... │ 4h   │ 10d │ ✗   │   │
└─────────────────────┘ │   └─────────────────────────────┘   │
                        └─────────────────────────────────────┘
```

### 4. Analytics Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                    Platform Statistics                      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Encrypted   │  │ Decrypted   │  │ Success Rate        │ │
│  │    1,247    │  │     892     │  │      71.5%          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Component Specifications

### Message Composer Component
**Purpose**: Primary interface for creating encrypted messages

**Elements**:
- **Textarea**: Auto-resizing, 500 character limit
- **Character Counter**: `247/500` with color coding (green→yellow→red)
- **Markdown Preview**: Side-by-side or toggle view
- **Recipient Address Input**: 
  - Placeholder: "Enter Ethereum wallet address (0x...)"
  - Real-time validation with checkmark/error icons
  - ENS domain support
- **Expiration Selector**: Dropdown with visual icons
  - 1 Day (⏰)
  - 10 Days (📅) 
  - 30 Days (🗓️)
- **Encrypt Button**: Prominent CTA with loading states

**States**:
- Default: Ready for input
- Typing: Real-time character count updates
- Validating: Address verification in progress
- Ready: All inputs valid, button enabled
- Encrypting: Loading spinner, disabled inputs
- Success: Confirmation message with animation
- Error: Clear error messaging with recovery options

### Message Explorer Component
**Purpose**: Discovery and decryption interface

**Search Bar**:
- Placeholder: "Search by wallet address to find your messages..."
- Auto-complete with address formatting
- Clear button when populated
- Loading indicator during search

**Message Table**:
```
┌──────────────┬────────────┬────────────┬──────────┬────────────┐
│ Address      │ Encrypted  │ Expires    │ Status   │ Action     │
├──────────────┼────────────┼────────────┼──────────┼────────────┤
│ 0x1234...89A │ 2h ago     │ 22h left   │ Unread   │ [Decrypt]  │
│ 0x5678...BCD │ 1d ago     │ 9d left    │ Read ✓   │ [View]     │
│ 0xABCD...123 │ 3d ago     │ Expired    │ Expired  │ [Remove]   │
└──────────────┴────────────┴────────────┴──────────┴────────────┘
```

**Table Features**:
- Responsive design with mobile stacking
- Sortable columns
- Status indicators with appropriate colors
- Hover effects for interactive elements
- Empty state: "No messages found for this address"

### Wallet Connection Modal
**Purpose**: Secure wallet connection and signature verification

**Connection Options**:
```
┌─────────────────────────────────────────────────────────────┐
│                 Connect Your Wallet                        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ [MetaMask]  │  │[WalletConn] │  │   [Hardware]        │ │
│  │             │  │             │  │ Ledger • Trezor     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Verification Flow**:
1. Wallet selection
2. Connection request
3. Signature prompt: "Sign this message to verify ownership"
4. Success confirmation
5. Message decryption reveal

### Decryption Modal
**Purpose**: Secure message reveal interface

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  🔐 Message Decryption                              [X]     │
│                                                             │
│  From: 0x1234...89AB                                       │
│  Encrypted: 2 hours ago                                    │
│  Expires: 22 hours remaining                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Click "Verify Ownership" to decrypt this message  │   │
│  │                                                     │   │
│  │           [Verify Ownership]                       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Post-Verification**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✅ Message Decrypted                               [X]     │
│                                                             │
│  From: 0x1234...89AB                                       │
│  Read: Just now                                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  **Hello!** This is a *secret* message for you.   │   │
│  │                                                     │   │
│  │  Hope you're having a great day! 🎉               │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📧 Read receipt sent                                      │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Design

### Desktop (1024px+)
- Side-by-side composer and explorer layout
- Full table view with all columns
- Hover states and detailed interactions

### Tablet (768px - 1023px)
- Stacked layout with composer on top
- Condensed table with priority columns
- Touch-friendly button sizes

### Mobile (< 768px)
- Single column layout
- Card-based message list instead of table
- Drawer-style modals
- Simplified navigation

## Accessibility Requirements
- High contrast ratios (WCAG 2.1 AA)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Alt text for all images and icons
- Semantic HTML structure

## Animation & Micro-interactions
- Smooth theme transitions (0.3s ease)
- Button hover effects with slight glow
- Loading spinners for async operations
- Success checkmarks with scale animation
- Error states with subtle shake animation
- Wallet connection progress indicators