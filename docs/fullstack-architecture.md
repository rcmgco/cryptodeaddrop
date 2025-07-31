# CryptoDeadDrop v0.1 - Architecture Specification

## Overview

CryptoDeadDrop is a Web3-enabled encrypted messaging platform that leverages Ethereum wallet cryptography for secure, ephemeral communication. The system uses asymmetric encryption where messages are encrypted with the recipient's public key and can only be decrypted by the holder of the corresponding private key.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Supabase)    │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web3 Wallet   │    │   Real-time     │    │   Row Level     │
│   Integration   │    │   Subscriptions │    │   Security      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Web3**: Wagmi + Web3Modal + Ethers.js

#### Backend
- **Platform**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Wallet-based (EIP-191 signatures)
- **API**: Supabase Client + Edge Functions
- **Real-time**: Supabase Realtime

#### Cryptography
- **Encryption**: ECIES (Elliptic Curve Integrated Encryption Scheme)
- **Algorithm**: AES-256-GCM
- **Curve**: secp256k1 (Ethereum standard)
- **Key Derivation**: HKDF-SHA256
- **Libraries**: @noble/ciphers, @noble/secp256k1

## Data Flow

### Message Encryption Flow

```
1. User Input
   ├── Message (max 500 chars)
   ├── Recipient Address (Ethereum)
   └── Expiration (1/10/30 days)

2. Validation
   ├── Address format validation
   ├── Message length check
   └── Expiration validation

3. Encryption
   ├── Generate ephemeral key pair
   ├── Derive shared secret (ECDH)
   ├── Encrypt message (AES-256-GCM)
   └── Create ciphertext package

4. Storage
   ├── Store encrypted message
   ├── Store metadata (expiration, timestamp)
   └── Return message ID
```

### Message Decryption Flow

```
1. Message Discovery
   ├── Search by wallet address
   ├── Filter by expiration
   └── Return encrypted messages

2. Wallet Connection
   ├── Connect Web3 wallet
   ├── Verify wallet ownership
   └── Get private key access

3. Decryption
   ├── Extract ephemeral public key
   ├── Derive shared secret (ECDH)
   ├── Decrypt message (AES-256-GCM)
   └── Verify message integrity

4. Verification
   ├── Sign challenge message
   ├── Verify signature
   └── Record decryption event
```

## Database Schema

### Core Tables

#### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_address TEXT NOT NULL,
  encrypted_message TEXT NOT NULL,
  ephemeral_public_key TEXT NOT NULL,
  expiration_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_recipient ON messages(recipient_address);
CREATE INDEX idx_messages_expiration ON messages(expiration_timestamp);
CREATE INDEX idx_messages_created ON messages(created_at);
```

#### decryptions
```sql
CREATE TABLE decryptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  decrypted_by_address TEXT NOT NULL,
  decrypted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signature TEXT NOT NULL,
  challenge_message TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_decryptions_message ON decryptions(message_id);
CREATE INDEX idx_decryptions_address ON decryptions(decrypted_by_address);
```

#### read_receipts
```sql
CREATE TABLE read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  read_by_address TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_read_receipts_message ON read_receipts(message_id);
CREATE INDEX idx_read_receipts_address ON read_receipts(read_by_address);
```

### Row Level Security (RLS)

```sql
-- Messages: Only recipient can read their messages
CREATE POLICY "Users can read their own messages" ON messages
  FOR SELECT USING (recipient_address = current_setting('app.current_user_address'));

-- Decryptions: Public read, authenticated write
CREATE POLICY "Anyone can read decryptions" ON decryptions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create decryptions" ON decryptions
  FOR INSERT WITH CHECK (current_setting('app.current_user_address') IS NOT NULL);

-- Read receipts: Public read, authenticated write
CREATE POLICY "Anyone can read read receipts" ON read_receipts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create read receipts" ON read_receipts
  FOR INSERT WITH CHECK (current_setting('app.current_user_address') IS NOT NULL);
```

## API Endpoints

### Message Management

#### POST /api/messages
**Purpose**: Create encrypted message
**Authentication**: None (public endpoint)
**Request**:
```typescript
{
  recipientAddress: string;
  encryptedMessage: string;
  ephemeralPublicKey: string;
  expirationDays: 1 | 10 | 30;
}
```
**Response**:
```typescript
{
  id: string;
  createdAt: string;
  expiresAt: string;
}
```

#### GET /api/messages/:address
**Purpose**: Get messages for wallet address
**Authentication**: None (public endpoint)
**Response**:
```typescript
{
  messages: Array<{
    id: string;
    encryptedMessage: string;
    ephemeralPublicKey: string;
    createdAt: string;
    expiresAt: string;
  }>;
}
```

### Decryption Tracking

#### POST /api/decryptions
**Purpose**: Record successful decryption
**Authentication**: Wallet signature verification
**Request**:
```typescript
{
  messageId: string;
  signature: string;
  challengeMessage: string;
}
```

#### GET /api/analytics
**Purpose**: Get platform analytics
**Authentication**: None (public endpoint)
**Response**:
```typescript
{
  totalMessages: number;
  totalDecryptions: number;
  successRate: number;
  recentActivity: Array<{
    timestamp: string;
    type: 'encryption' | 'decryption';
    address: string;
  }>;
}
```

## Security Architecture

### Cryptographic Security

#### Key Management
- **Ephemeral Keys**: Generated per message for forward secrecy
- **Key Derivation**: HKDF-SHA256 for secure key expansion
- **Key Validation**: Proper curve point validation

#### Encryption Process
```typescript
function encryptMessage(message: string, recipientPublicKey: string): EncryptedMessage {
  // 1. Generate ephemeral key pair
  const ephemeralKeyPair = secp256k1.utils.randomPrivateKey();
  const ephemeralPublicKey = secp256k1.getPublicKey(ephemeralKeyPair);
  
  // 2. Derive shared secret
  const sharedSecret = secp256k1.getSharedSecret(ephemeralKeyPair, recipientPublicKey);
  
  // 3. Derive encryption key
  const salt = randomBytes(32);
  const info = utf8ToBytes('CryptoDeadDrop-v0.1');
  const encryptionKey = hkdf(sha256, sharedSecret, salt, info, 32);
  
  // 4. Encrypt message
  const cipher = aes_256_gcm(encryptionKey);
  const encrypted = cipher.encrypt(utf8ToBytes(message));
  
  return {
    encryptedMessage: bytesToBase64(encrypted),
    ephemeralPublicKey: bytesToBase64(ephemeralPublicKey),
    salt: bytesToBase64(salt)
  };
}
```

#### Decryption Process
```typescript
function decryptMessage(encryptedMessage: EncryptedMessage, privateKey: string): string {
  // 1. Extract ephemeral public key
  const ephemeralPublicKey = base64ToBytes(encryptedMessage.ephemeralPublicKey);
  
  // 2. Derive shared secret
  const sharedSecret = secp256k1.getSharedSecret(privateKey, ephemeralPublicKey);
  
  // 3. Derive decryption key
  const salt = base64ToBytes(encryptedMessage.salt);
  const info = utf8ToBytes('CryptoDeadDrop-v0.1');
  const decryptionKey = hkdf(sha256, sharedSecret, salt, info, 32);
  
  // 4. Decrypt message
  const cipher = aes_256_gcm(decryptionKey);
  const decrypted = cipher.decrypt(base64ToBytes(encryptedMessage.encryptedMessage));
  
  return utf8ToString(decrypted);
}
```

### Authentication & Authorization

#### Wallet Authentication
- **Challenge-Response**: EIP-191 personal message signing
- **Nonce Protection**: Time-based challenge with expiration
- **Signature Verification**: Local verification without network calls

#### Access Control
- **Row Level Security**: Database-level access control
- **Address Validation**: Proper Ethereum address format validation
- **Rate Limiting**: Request throttling to prevent abuse

## Performance Considerations

### Optimization Strategies

#### Database Optimization
- **Indexing**: Strategic indexes on frequently queried columns
- **Partitioning**: Time-based partitioning for large datasets
- **Connection Pooling**: Efficient database connection management

#### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Caching**: React Query for API response caching
- **Bundle Optimization**: Tree shaking and minification

#### Cryptographic Optimization
- **Web Workers**: Offload encryption/decryption to background threads
- **Batch Operations**: Efficient handling of multiple messages
- **Memory Management**: Proper cleanup of sensitive data

### Scalability

#### Horizontal Scaling
- **CDN**: Static asset delivery optimization
- **Load Balancing**: Multiple server instances
- **Database Sharding**: Geographic data distribution

#### Vertical Scaling
- **Resource Optimization**: Efficient memory and CPU usage
- **Connection Pooling**: Database connection optimization
- **Caching Layers**: Redis for frequently accessed data

## Monitoring & Observability

### Metrics Collection

#### Application Metrics
- **Message Volume**: Encryption/decryption rates
- **Success Rates**: Decryption success percentages
- **Performance**: Response times and throughput
- **Errors**: Error rates and types

#### Security Metrics
- **Failed Decryptions**: Potential attack attempts
- **Rate Limit Violations**: Abuse detection
- **Signature Failures**: Authentication issues
- **Expired Messages**: Cleanup effectiveness

### Logging Strategy

#### Structured Logging
```typescript
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  component: string;
  action: string;
  metadata: Record<string, any>;
  userId?: string; // Truncated address for privacy
}
```

#### Privacy-Preserving Logs
- **Address Truncation**: Only log first/last 4 characters
- **Message Content**: Never log plaintext messages
- **Sensitive Data**: Exclude private keys and signatures

## Deployment Architecture

### Environment Configuration

#### Development
- **Local Database**: Supabase local development
- **Hot Reloading**: Vite development server
- **Debug Mode**: Enhanced error messages and logging

#### Production
- **CDN**: Global content delivery
- **SSL/TLS**: End-to-end encryption
- **Security Headers**: CSP, HSTS, etc.
- **Monitoring**: Real-time application monitoring

### CI/CD Pipeline

#### Build Process
1. **Code Quality**: ESLint and TypeScript checks
2. **Testing**: Unit and integration tests
3. **Security Scan**: Dependency vulnerability scanning
4. **Build**: Production-optimized build
5. **Deploy**: Automated deployment to production

#### Deployment Strategy
- **Blue-Green**: Zero-downtime deployments
- **Rollback**: Quick rollback capabilities
- **Health Checks**: Automated health monitoring
- **Gradual Rollout**: Feature flag-based releases

## Future Architecture Considerations

### Planned Enhancements

#### Multi-Chain Support
- **Polygon**: Lower gas fees for frequent users
- **BSC**: Alternative blockchain option
- **Cross-Chain**: Interoperability between chains

#### Advanced Features
- **Group Messaging**: Multi-recipient encryption
- **File Attachments**: Encrypted file sharing
- **Message Threading**: Conversation organization
- **Mobile App**: Native mobile applications

#### Scalability Improvements
- **Microservices**: Service decomposition
- **Event Sourcing**: Event-driven architecture
- **CQRS**: Command Query Responsibility Segregation
- **Distributed Caching**: Redis cluster implementation

---

**Architecture Version**: v0.1  
**Last Updated**: July 31, 2025  
**Next Review**: August 31, 2025