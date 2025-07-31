# DeGhost Messenger v0.1 - Implementation Instructions

## CRITICAL: FOLLOW ALL SPECIFICATIONS

This file serves as the master reference for implementing DeGhost Messenger v0.1. **ALL development must strictly adhere to the specifications outlined in the documentation files.**

## Required Reading & Compliance

### 1. Product Requirements (docs/PRD.md)
- **MUST** implement all core features as specified
- **MUST** maintain 500 character message limit
- **MUST** support 1/10/30 day expiration options
- **MUST** implement wallet-based encryption/decryption
- **MUST** track analytics (encrypted/decrypted counters)

### 2. UX/UI Specification (docs/UX-UI-Specification.md)
- **MUST** implement Doom 64 theme with dark cyberpunk aesthetic
- **MUST** use specified color palette (Deep reds #FF6B35, #D63031)
- **MUST** follow exact layout structure (side-by-side composer/explorer)
- **MUST** implement responsive design for desktop/tablet/mobile
- **MUST** include all specified components (composer, explorer, modals)

### 3. Architecture Specification (docs/Architecture-Specification.md)
- **MUST** use React + TypeScript + Tailwind CSS + Supabase
- **MUST** implement ECIES encryption with AES-256-GCM
- **MUST** support MetaMask, WalletConnect, Hardware wallets
- **MUST** implement Row Level Security (RLS) policies
- **MUST** follow specified database schema

### 4. Task Breakdown (docs/Task-Breakdown.md)
- **MUST** follow the 8-phase development approach
- **MUST** complete dependencies before proceeding to next tasks
- **MUST** implement all specified functionality in each phase
- **MUST** maintain estimated timelines and success criteria

## Development Rules

### Code Quality
- Use semantic design tokens from index.css and tailwind.config.ts
- Create focused, reusable components
- Implement proper error handling and validation
- Follow TypeScript best practices

### Design System
- **NEVER** use direct colors (text-white, bg-black, etc.)
- **ALWAYS** use HSL color format in CSS variables
- **MUST** customize shadcn components with Doom 64 theme
- **MUST** implement light/dark mode toggle

### Security
- Implement proper RLS policies
- Validate all inputs (wallet addresses, message content)
- Use gasless signature verification
- Ensure encrypted messages cannot be accessed without private key

### Performance
- Optimize bundle size and loading
- Implement responsive design
- Use proper caching strategies
- Minimize blockchain network calls

## Phase Completion Checklist

Each phase must be 100% complete before proceeding:

### Phase 1: Foundation & Design System ✓
- [ ] Tailwind v4 with Doom 64 theme configured
- [ ] All shadcn/ui components installed and themed
- [ ] Base CSS with design tokens implemented
- [ ] Light/dark mode toggle functional
- [ ] Base layout components created

### Phase 2: Core Components & Layout
- [ ] Message composer with markdown support
- [ ] Wallet address input with validation
- [ ] Expiration selector implemented
- [ ] Hero section and main layout grid
- [ ] Responsive design verified

### Phase 3: Wallet Integration
- [ ] Web3 dependencies installed
- [ ] Wallet connection service implemented
- [ ] MetaMask, WalletConnect, Hardware wallet support
- [ ] Wallet connection modal functional
- [ ] Signature verification implemented

### Phase 4: Encryption & Messaging Core
- [ ] ECIES encryption utilities implemented
- [ ] Message encryption/decryption services
- [ ] Encryption flow integrated with composer
- [ ] Decryption modal with wallet verification

### Phase 5: Database & Backend Integration
- [ ] Supabase project configured
- [ ] Database schema with RLS policies
- [ ] Message storage/retrieval APIs
- [ ] Read receipt tracking implemented

### Phase 6: Message Explorer & Search
- [ ] Message search interface
- [ ] Responsive message table
- [ ] Message actions (decrypt, view, delete)
- [ ] Real-time updates and notifications

### Phase 7: Analytics & Monitoring
- [ ] Analytics dashboard components
- [ ] Event tracking system
- [ ] Error monitoring and logging

### Phase 8: Testing, Polish & Deployment
- [ ] Unit and integration testing
- [ ] Security audit completed
- [ ] Performance optimization
- [ ] Accessibility compliance
- [ ] Production deployment ready

## Critical Success Criteria

The following MUST work perfectly:
- ✅ Users can encrypt messages using any Ethereum wallet address
- ✅ Only private key holders can decrypt their messages
- ✅ Gasless signature verification works reliably
- ✅ Messages expire automatically as configured
- ✅ Search discovers messages by wallet address
- ✅ Analytics track usage accurately
- ✅ Security requirements are fully met
- ✅ Doom 64 theme is properly implemented

## Non-Negotiable Requirements

1. **Security First**: No shortcuts on encryption or validation
2. **Exact UI Compliance**: Follow UX/UI spec precisely
3. **Complete Feature Set**: All PRD features must be implemented
4. **Quality Code**: Maintainable, documented, tested
5. **Performance**: Fast, responsive, optimized

---

**This document supersedes all other instructions when conflicts arise. Refer back to this file and the specification documents for any implementation questions.**