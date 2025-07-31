# CryptoDeadDrop v0.1 - Implementation Instructions

## Overview

This file serves as the master reference for implementing CryptoDeadDrop v0.1. **ALL development must strictly adhere to the specifications outlined in the documentation files.**

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)

#### 1.1 Project Setup
- [x] Initialize React + TypeScript + Vite project
- [x] Configure Tailwind CSS + shadcn/ui
- [x] Set up ESLint and Prettier
- [x] Configure Git hooks and CI/CD
- [x] Set up Supabase project and database

#### 1.2 Database Schema
- [x] Create messages table with proper indexes
- [x] Create decryptions tracking table
- [x] Create read_receipts table
- [x] Implement Row Level Security (RLS) policies
- [x] Set up database migrations

#### 1.3 Cryptographic Foundation
- [x] Implement ECIES encryption/decryption
- [x] Set up secure random number generation
- [x] Implement key derivation (HKDF-SHA256)
- [x] Add signature verification utilities
- [x] Create cryptographic test suite

### Phase 2: Core Features (Week 3-4)

#### 2.1 Message Composition
- [x] Create MessageComposer component
- [x] Implement character limit (500 chars)
- [x] Add markdown support with preview
- [x] Implement address validation
- [x] Add expiration selection (1/10/30 days)

#### 2.2 Message Encryption
- [x] Implement client-side encryption
- [x] Add ephemeral key generation
- [x] Create encrypted message storage
- [x] Implement message metadata handling
- [x] Add encryption error handling

#### 2.3 Message Discovery
- [x] Create MessageExplorer component
- [x] Implement address-based search
- [x] Add message listing with pagination
- [x] Implement expiration filtering
- [x] Add message status indicators

### Phase 3: Wallet Integration (Week 5-6)

#### 3.1 Wallet Connection
- [x] Set up Web3Modal integration
- [x] Implement MetaMask connector
- [x] Add WalletConnect support
- [x] Create wallet connection state management
- [x] Add wallet connection error handling

#### 3.2 Signature Verification
- [x] Implement EIP-191 signature challenges
- [x] Add gasless signature verification
- [x] Create signature replay protection
- [x] Implement challenge expiration
- [x] Add signature validation utilities

#### 3.3 Message Decryption
- [x] Implement client-side decryption
- [x] Add private key access handling
- [x] Create decryption error handling
- [x] Implement read receipt tracking
- [x] Add decryption success feedback

### Phase 4: User Interface (Week 7-8)

#### 4.1 Core UI Components
- [x] Create responsive layout
- [x] Implement dark/light theme toggle
- [x] Add loading states and animations
- [x] Create error message components
- [x] Implement toast notifications

#### 4.2 User Experience
- [x] Add keyboard shortcuts
- [x] Implement form validation
- [x] Create responsive design
- [x] Add accessibility features
- [x] Implement progressive enhancement

#### 4.3 Analytics Dashboard
- [x] Create analytics data collection
- [x] Implement real-time statistics
- [x] Add message success rate tracking
- [x] Create user engagement metrics
- [x] Implement privacy-preserving analytics

### Phase 5: Security & Testing (Week 9-10)

#### 5.1 Security Implementation
- [x] Implement input validation and sanitization
- [x] Add XSS protection
- [x] Implement rate limiting
- [x] Add security headers
- [x] Create security monitoring

#### 5.2 Testing Suite
- [x] Write unit tests for core functions
- [x] Implement integration tests
- [x] Add end-to-end testing
- [x] Create security test cases
- [x] Implement performance testing

#### 5.3 Code Quality
- [x] Add comprehensive error handling
- [x] Implement logging and monitoring
- [x] Add code documentation
- [x] Create development guidelines
- [x] Implement code review process

## Technical Specifications

### Cryptographic Requirements

#### Encryption Algorithm
```typescript
// ECIES with AES-256-GCM
const encryptedMessage = {
  ciphertext: string,        // AES-256-GCM encrypted message
  ephemeralPublicKey: string, // secp256k1 ephemeral public key
  salt: string,              // HKDF salt
  iv: string                 // AES initialization vector
}
```

#### Key Derivation
```typescript
// HKDF-SHA256 key derivation
const derivedKey = hkdf(
  sha256,
  sharedSecret,
  salt,
  info,  // 'CryptoDeadDrop-v0.1'
  32     // 256-bit key
)
```

#### Signature Verification
```typescript
// EIP-191 personal signature
const challenge = `CryptoDeadDrop v0.1

By signing this message, you are proving ownership of the wallet address:
${address}

Message ID: ${messageId}
Timestamp: ${timestamp}

This signature is used for message decryption verification only.`
```

### Database Schema

#### Messages Table
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
```

#### Decryptions Table
```sql
CREATE TABLE decryptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  decrypted_by_address TEXT NOT NULL,
  decrypted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signature TEXT NOT NULL,
  challenge_message TEXT NOT NULL
);
```

### API Endpoints

#### Message Management
```typescript
// POST /api/messages
interface CreateMessageRequest {
  recipientAddress: string;
  encryptedMessage: string;
  ephemeralPublicKey: string;
  expirationDays: 1 | 10 | 30;
}

// GET /api/messages/:address
interface GetMessagesResponse {
  messages: Array<{
    id: string;
    encryptedMessage: string;
    ephemeralPublicKey: string;
    createdAt: string;
    expiresAt: string;
  }>;
}
```

#### Decryption Tracking
```typescript
// POST /api/decryptions
interface CreateDecryptionRequest {
  messageId: string;
  signature: string;
  challengeMessage: string;
}
```

## Security Requirements

### Input Validation
- All Ethereum addresses must be validated using `ethers.isAddress()`
- Message content must be sanitized to prevent XSS
- Expiration dates must be validated (1, 10, or 30 days only)
- Character limits must be enforced (500 chars max)

### Cryptographic Security
- Use cryptographically secure random number generation
- Implement proper key validation
- Add signature replay protection
- Ensure secure key derivation

### Privacy Protection
- Never log plaintext messages
- Truncate addresses in logs (first/last 4 chars)
- Implement automatic message expiration
- Use session storage for temporary data

## Performance Requirements

### Response Times
- Message encryption: < 500ms
- Message search: < 1s
- Message decryption: < 2s
- Wallet connection: < 3s

### Scalability
- Support 1000+ concurrent users
- Handle 100+ messages per second
- Efficient database queries with proper indexing
- Optimized bundle size (< 2MB)

## Testing Requirements

### Unit Tests
- All cryptographic functions must have 100% test coverage
- Input validation functions must be thoroughly tested
- Error handling must be tested for all edge cases

### Integration Tests
- End-to-end message encryption/decryption flow
- Wallet connection and signature verification
- Database operations and RLS policies
- API endpoint functionality

### Security Tests
- XSS vulnerability testing
- SQL injection prevention
- Cryptographic strength validation
- Rate limiting effectiveness

## Deployment Requirements

### Environment Configuration
```bash
# Required environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build

# Testing
npm run test
npm run test:coverage
```

### Security Headers
```typescript
// Required security headers
{
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff'
}
```

## Quality Assurance

### Code Review Checklist
- [ ] Security best practices followed
- [ ] Error handling implemented
- [ ] Input validation present
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Performance considerations addressed

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Accessibility requirements satisfied
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness tested

## Maintenance

### Regular Tasks
- Monitor security vulnerabilities in dependencies
- Review and update cryptographic implementations
- Analyze performance metrics and optimize
- Update documentation as needed
- Conduct security audits

### Monitoring
- Track message encryption/decryption success rates
- Monitor wallet connection reliability
- Watch for unusual activity patterns
- Monitor database performance
- Track user engagement metrics

---

**Implementation Version**: v0.1  
**Last Updated**: July 31, 2025  
**Next Review**: August 31, 2025