# Ghost Key Whisper (DeGhost Messenger)

A decentralized, privacy-focused messaging platform that enables secure communication using Ethereum wallet addresses and cryptographic encryption.

## 🎯 Overview

Ghost Key Whisper is a Web3-native messaging application that leverages blockchain technology to provide truly private, decentralized communication. Messages are encrypted using the recipient's Ethereum public key and can only be decrypted by the holder of the corresponding private key through cryptographic signature verification.

### Core Features

- **🔐 End-to-End Encryption**: Messages encrypted with recipient's public key
- **🌐 Decentralized**: No central authority can access or decrypt messages
- **⏰ Time-Bound**: Automatic message expiration (1, 10, or 30 days)
- **💨 Gasless**: Signature verification without network fees
- **🔍 Message Discovery**: Search and retrieve messages by wallet address
- **📊 Analytics**: Track encryption and decryption statistics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern browser with Web3 wallet support (MetaMask, WalletConnect, etc.)
- Ethereum wallet for message decryption

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ghost-key-whisper

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives

### Web3 & Cryptography
- **Ethers.js** - Ethereum interaction
- **Wagmi** - React hooks for Ethereum
- **Web3Modal** - Wallet connection
- **@noble/ciphers** - Cryptographic operations
- **@noble/secp256k1** - Elliptic curve operations

### Backend & Database
- **Supabase** - Database and real-time features
- **PostgreSQL** - Primary database

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

## 📖 Usage Guide

### Sending Encrypted Messages

1. **Compose Message**: Write your message (max 500 characters)
2. **Enter Recipient**: Input the recipient's Ethereum wallet address
3. **Set Expiration**: Choose message lifetime (1, 10, or 30 days)
4. **Encrypt & Send**: Message is encrypted and stored securely

### Receiving & Decrypting Messages

1. **Search Messages**: Enter your wallet address to find messages
2. **Connect Wallet**: Link your Web3 wallet (MetaMask, etc.)
3. **Verify Ownership**: Sign a gasless transaction to prove ownership
4. **Decrypt & Read**: Message is decrypted client-side and displayed

### Security Features

- **ECIES Encryption**: Elliptic Curve Integrated Encryption Scheme
- **AES-256-GCM**: Advanced encryption standard for message content
- **Zero-Knowledge**: No plaintext stored on servers
- **Signature Verification**: Cryptographic proof of wallet ownership
- **Automatic Cleanup**: Expired messages removed from database

## 🏗️ Architecture

### Frontend Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── MessageComposer.tsx
│   ├── MessageExplorer.tsx
│   ├── AnalyticsDashboard.tsx
│   └── ...
├── contexts/           # React contexts
│   ├── ThemeContext.tsx
│   └── Web3Context.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   ├── encryption.ts   # Cryptographic operations
│   ├── security.ts     # Security utilities
│   └── utils.ts        # General utilities
├── pages/              # Page components
├── services/           # API services
└── integrations/       # External integrations
    └── supabase/       # Database client
```

### Database Schema

The application uses Supabase with the following key tables:

- **messages**: Encrypted message storage
- **decryptions**: Decryption tracking and analytics
- **read_receipts**: Message read status

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API and database interaction testing
- **E2E Tests**: End-to-end user flow testing

Run tests with:
```bash
npm run test
```

## 🔒 Security Considerations

### Cryptographic Implementation

- **Key Derivation**: Uses ECDH for shared secret generation
- **Message Encryption**: AES-256-GCM for authenticated encryption
- **Signature Verification**: ECDSA for wallet ownership proof
- **Random Generation**: Cryptographically secure random number generation

### Privacy Features

- **No Plaintext Storage**: Only encrypted data stored in database
- **Client-Side Decryption**: Decryption happens in user's browser
- **Address Privacy**: Wallet addresses truncated in UI for privacy
- **Automatic Expiration**: Messages automatically deleted after expiration

### Best Practices

- **Input Validation**: All user inputs validated and sanitized
- **Rate Limiting**: API endpoints protected against abuse
- **Error Handling**: Secure error messages without information leakage
- **HTTPS Only**: All communications encrypted in transit

## 📊 Analytics & Monitoring

The application tracks various metrics for operational insights:

- **Message Statistics**: Total encrypted messages, decryption success rate
- **User Engagement**: Active wallets, message frequency
- **Performance Metrics**: Response times, error rates
- **Security Events**: Failed decryption attempts, suspicious activity

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure accessibility compliance
- Follow security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed specifications
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

## 🔮 Roadmap

### Planned Features

- **Multi-Chain Support**: Extend to other blockchain networks
- **Group Messaging**: Encrypted group conversations
- **File Attachments**: Secure file sharing capabilities
- **Mobile App**: Native mobile applications
- **Advanced Analytics**: Enhanced privacy-preserving analytics

### Version History

- **v0.1**: Initial release with core messaging functionality
- **v0.2**: Enhanced security and performance improvements
- **v0.3**: Multi-chain support and advanced features

---

**Built with ❤️ for the Web3 community**
