# DeGhost Messenger v0.1 - Product Requirements Document

## Product Vision
A decentralized messaging platform where messages are encrypted using Ethereum wallet addresses and can only be decrypted by the private key holder through gasless signature verification.

## Core Value Proposition
- **Privacy**: Messages encrypted with public wallet addresses, only accessible by private key holders
- **Decentralized**: No central authority can access messages
- **Secure**: Cryptographic proof of ownership through wallet signatures
- **Time-bound**: Messages automatically expire to ensure ephemeral communication

## Target Users
- Crypto enthusiasts and Web3 users
- Privacy-conscious individuals
- Ethereum wallet holders seeking secure communication
- DeFi users wanting private messaging

## Key Features

### 1. Message Composition
- **Character Limit**: 500 characters maximum
- **Markdown Support**: Rich text formatting for enhanced communication
- **Real-time Preview**: Live markdown rendering
- **Character Counter**: Visual feedback on remaining characters

### 2. Wallet-Based Encryption
- **Public Address Input**: Accept any valid Ethereum wallet address
- **Address Validation**: Real-time validation of Ethereum address format
- **Encryption**: Messages encrypted using the recipient's public key
- **Cross-wallet Support**: Works with any Ethereum-compatible wallet

### 3. Expiration Controls
- **Flexible Timeframes**: 1 day, 10 days, or 30 days
- **Automatic Cleanup**: Expired messages removed from database
- **Expiration Indicators**: Clear visual feedback on message lifespan

### 4. Decryption & Verification
- **Wallet Connection**: Support for browser wallets and hardware wallets
- **Gasless Signatures**: Sign verification without network fees
- **Ownership Proof**: Cryptographic verification of wallet ownership
- **One-time Reveal**: Message revealed only after successful verification

### 5. Message Discovery
- **Search Functionality**: Find messages by wallet address
- **Recent Messages**: Display top 20 latest encrypted messages
- **Message Table**: Organized view with key information
- **Privacy Protection**: Addresses truncated for privacy

### 6. Analytics & Tracking
- **Message Counter**: Track total encrypted messages
- **Decryption Counter**: Track successful decryptions
- **Success Ratio**: Calculate and display decryption rate
- **Read Receipts**: Timestamp when messages are decrypted

## Technical Requirements

### Security
- End-to-end encryption using public key cryptography
- No plaintext message storage
- Secure signature verification
- Protection against replay attacks

### Performance
- Fast message encryption/decryption
- Responsive search functionality
- Optimized for mobile and desktop
- Minimal blockchain network calls

### Usability
- Intuitive wallet connection flow
- Clear error messages and feedback
- Responsive design across devices
- Accessibility compliance

## Success Metrics
- **Adoption**: Number of unique wallet addresses using the platform
- **Engagement**: Messages encrypted per user
- **Discovery Rate**: Percentage of messages successfully decrypted
- **Return Usage**: Users returning to encrypt/decrypt multiple messages

## Technical Constraints
- Ethereum wallet requirement for decryption
- 500 character message limit
- Supported wallet types (MetaMask, WalletConnect, Ledger, Trezor)
- Browser compatibility for Web3 features

## Future Enhancements (Out of Scope v0.1)
- Multi-chain support (Polygon, BSC, etc.)
- Group messaging capabilities
- Message threading
- File attachment encryption
- Mobile app development