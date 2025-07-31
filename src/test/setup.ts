import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

// Mock Web3 and wallet functionality
global.window.ethereum = {
  isMetaMask: true,
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
} as any

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
global.localStorage = localStorageMock as Storage

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
global.sessionStorage = sessionStorageMock as Storage

// Mock crypto for secure random values
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
    subtle: {
      generateKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    }
  }
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = vi.fn()
  console.warn = vi.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock WebSocket
class WebSocketMock {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  
  send = vi.fn()
  close = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  readyState = 1 // OPEN
  
  constructor() {
    return this
  }
}

global.WebSocket = WebSocketMock as any

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn()
global.URL.revokeObjectURL = vi.fn()

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'node.js',
    clipboard: {
      writeText: vi.fn(),
      readText: vi.fn(),
    },
  },
  writable: true,
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:8080',
    origin: 'http://localhost:8080',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
})

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock window.alert
window.alert = vi.fn()

// Mock window.confirm
window.confirm = vi.fn()

// Mock window.prompt
window.prompt = vi.fn()

// Mock DOMPurify for security tests
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input: string, config: any) => {
      if (config.ALLOWED_TAGS && config.ALLOWED_TAGS.length === 0) {
        // Remove all HTML tags
        return input.replace(/<[^>]*>/g, '')
      } else if (config.ALLOWED_TAGS) {
        // Allow only specified tags
        const allowedTags = config.ALLOWED_TAGS
        return input.replace(/<(?!\/?(?:b|i|em|strong|code|pre|br|p)\b)[^>]*>/gi, '')
      }
      return input
    }),
  },
}))

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}))

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  })),
  useSignMessage: vi.fn(() => ({
    signMessageAsync: vi.fn(() => Promise.resolve('0xsignature')),
  })),
  useNetwork: vi.fn(() => ({
    chain: { id: 1, name: 'Ethereum' },
  })),
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  })),
}))

// Test utilities
export const mockEthereumAddress = '0x1234567890123456789012345678901234567890'
export const mockENSAddress = 'test.eth'
export const mockMessage = 'Hello, this is a test message!'
export const mockSignature = '0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'

// Helper function to create mock message data
export const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  recipientAddress: mockEthereumAddress,
  encryptedAt: '2 hours ago',
  expiresIn: '8 days',
  isRead: false,
  expirationDays: 10,
  ...overrides,
})

// Helper function to create mock challenge
export const createMockChallenge = (overrides = {}) => ({
  message: 'DeGhost Messenger v0.1\n\nBy signing this message...',
  messageId: 'test-message-id',
  address: mockEthereumAddress,
  timestamp: Date.now(),
  ...overrides,
}) 