# DeGhost Messenger v0.1 - Architecture Specification

## System Overview
DeGhost Messenger is a Web3-enabled encrypted messaging platform that leverages Ethereum wallet cryptography for secure, ephemeral communication. The system uses asymmetric encryption where messages are encrypted with public wallet addresses and can only be decrypted by the corresponding private key holder.

## Architecture Principles
- **Security First**: End-to-end encryption with no plaintext storage
- **Decentralized**: No central authority can access encrypted messages
- **Privacy by Design**: Minimal data collection, temporary storage
- **Wallet-Centric**: Leverage existing Web3 identity infrastructure
- **Ephemeral**: Time-bound messages with automatic expiration

## Technology Stack

### Frontend
```
React 18 + TypeScript
├── UI Framework: Tailwind v4 + shadcn/ui (Doom 64 theme)
├── Web3 Integration: ethers.js v6
├── Wallet Connectors: WalletConnect v2, MetaMask SDK
├── State Management: React Query + Zustand
├── Routing: React Router v6
├── Markdown: react-markdown + remark plugins
└── Crypto: Web Crypto API + ethers crypto utils
```

### Backend (Supabase Integration)
```
Supabase
├── Database: PostgreSQL with RLS policies
├── Authentication: Wallet-based auth
├── Edge Functions: Deno runtime for crypto operations
├── Real-time: Subscriptions for message updates
└── Storage: Temporary encrypted message storage
```

## Data Architecture

### Database Schema
```sql
-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_address TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  sender_hash TEXT, -- Optional anonymous sender identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  decrypted_at TIMESTAMP WITH TIME ZONE,
  read_count INTEGER DEFAULT 0,
  metadata JSONB -- Additional encrypted metadata
);

-- Indexes for performance
CREATE INDEX idx_messages_recipient ON messages(recipient_address);
CREATE INDEX idx_messages_expiry ON messages(expires_at);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'encrypt', 'decrypt', 'expire'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);
```

### Row Level Security (RLS) Policies
```sql
-- Messages can be read by anyone (for discovery)
CREATE POLICY "Messages are publicly readable" ON messages
  FOR SELECT USING (true);

-- Only authenticated users can insert messages
CREATE POLICY "Authenticated users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages can be updated only for decryption tracking
CREATE POLICY "Allow decryption updates" ON messages
  FOR UPDATE USING (true)
  WITH CHECK (decrypted_at IS NOT NULL);
```

## Encryption Architecture

### Message Encryption Flow
```
1. User inputs plaintext message
2. System derives public key from recipient wallet address
3. Generate ephemeral key pair for ECIES encryption
4. Encrypt message using hybrid encryption:
   - Generate random AES-256-GCM key
   - Encrypt message with AES key
   - Encrypt AES key with recipient's public key (ECIES)
5. Store encrypted payload in database
6. Return encryption confirmation
```

### Decryption Flow
```
1. User connects wallet and searches for messages
2. System finds encrypted messages for wallet address
3. User initiates decryption for specific message
4. Wallet signs verification challenge (gasless)
5. System verifies signature matches recipient address
6. If verified, return encrypted payload to client
7. Client decrypts using wallet's private key:
   - Extract encrypted AES key from payload
   - Decrypt AES key using wallet private key
   - Decrypt message content using AES key
8. Display plaintext message
9. Send read receipt to database
```

### Cryptographic Specifications
- **Asymmetric Encryption**: ECIES (Elliptic Curve Integrated Encryption Scheme)
- **Symmetric Encryption**: AES-256-GCM for message content
- **Key Derivation**: secp256k1 curve (Ethereum standard)
- **Signature Verification**: EIP-191 personal_sign method
- **Random Generation**: Cryptographically secure PRNG

## API Design

### Core Endpoints
```typescript
// Message Management
POST /api/messages/encrypt
GET /api/messages/search?address={wallet_address}
PUT /api/messages/{id}/decrypt
DELETE /api/messages/cleanup-expired

// Analytics
GET /api/analytics/stats
POST /api/analytics/track

// Wallet Operations
POST /api/wallet/verify-signature
GET /api/wallet/challenges/{address}
```

### WebSocket Events
```typescript
// Real-time updates
"message:encrypted" // New message available
"message:decrypted" // Message was read
"message:expired"   // Message expired and removed
"analytics:updated" // Stats updated
```

## Security Considerations

### Threat Model
- **Adversaries**: Database administrators, network attackers, malicious users
- **Assets**: Encrypted messages, wallet addresses, usage patterns
- **Threats**: Message interception, replay attacks, timing analysis

### Security Measures
```
1. Encryption at Rest
   - All messages stored encrypted
   - No plaintext in database logs
   - Secure key derivation

2. Transport Security
   - HTTPS/TLS 1.3 for all communications
   - Certificate pinning in production
   - HSTS headers

3. Wallet Security
   - Gasless signature verification
   - EIP-191 standard compliance
   - Replay attack prevention
   - Rate limiting on verification attempts

4. Privacy Protection
   - Address truncation in UI
   - Optional sender anonymity
   - Minimal metadata collection
   - Automatic message expiration

5. Application Security
   - Input validation and sanitization
   - XSS protection via CSP headers
   - CSRF protection
   - Rate limiting on all endpoints
```

## Performance Architecture

### Optimization Strategies
```
1. Database Performance
   - Efficient indexing on search columns
   - Automatic cleanup of expired messages
   - Connection pooling
   - Query optimization

2. Frontend Performance
   - Code splitting by route
   - Lazy loading of wallet connectors
   - Memoized expensive calculations
   - Optimistic UI updates

3. Caching Strategy
   - Browser caching for static assets
   - Service worker for offline capabilities
   - React Query for API response caching
   - CDN for global distribution

4. Real-time Updates
   - WebSocket connections for live updates
   - Efficient subscription management
   - Debounced search queries
```

### Scalability Considerations
- Horizontal scaling via database read replicas
- Edge function deployment for global latency
- CDN integration for static assets
- Background job processing for cleanup tasks

## Integration Architecture

### Wallet Integration
```typescript
interface WalletProvider {
  connect(): Promise<string>; // Returns wallet address
  sign(message: string): Promise<string>; // Signs verification message
  getPublicKey(): Promise<string>; // For encryption
  isConnected(): boolean;
  disconnect(): void;
}

// Supported Wallets
const supportedWallets = [
  'MetaMask',
  'WalletConnect',
  'Coinbase Wallet',
  'Ledger',
  'Trezor'
];
```

### Blockchain Integration
```typescript
// Minimal blockchain interaction
interface BlockchainService {
  verifyAddress(address: string): boolean;
  validateSignature(
    message: string, 
    signature: string, 
    address: string
  ): boolean;
  derivePublicKey(address: string): string;
}
```

## Deployment Architecture

### Infrastructure
```
Production Environment:
├── Frontend: Vercel/Netlify CDN
├── Backend: Supabase Cloud
├── Database: PostgreSQL (Supabase)
├── Edge Functions: Deno Deploy
└── Monitoring: Supabase Analytics + Sentry

Development Environment:
├── Frontend: Local Vite dev server
├── Backend: Supabase local development
├── Database: Local PostgreSQL
└── Testing: Vitest + Playwright
```

### CI/CD Pipeline
```
1. Code commit to repository
2. Automated testing (unit + integration)
3. Security scanning (dependencies + SAST)
4. Build optimization and bundling
5. Deployment to staging environment
6. Automated E2E testing
7. Production deployment approval
8. Database migration execution
9. Production deployment
10. Health checks and monitoring
```

## Monitoring & Analytics

### Application Metrics
- Message encryption/decryption rates
- Wallet connection success rates
- Search query performance
- Error rates and response times
- User engagement patterns

### Security Monitoring
- Failed signature verification attempts
- Suspicious access patterns
- Rate limit violations
- Encryption/decryption anomalies

### Performance Monitoring
- Database query performance
- Frontend load times
- API response times
- Real-time connection stability

## Compliance & Privacy

### Data Retention
- Encrypted messages: Until expiration date
- Analytics data: Aggregated, no PII
- Wallet addresses: Hashed for privacy
- Logs: 30-day retention maximum

### Privacy by Design
- No personal information collection
- Wallet addresses as pseudo-anonymous identifiers
- Optional sender anonymity
- Client-side decryption only
- Automatic data expiration