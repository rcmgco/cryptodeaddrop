import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageInput } from './MessageInput'

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('MessageInput', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderMessageInput = (props = {}) => {
    return render(
      <MessageInput
        value=""
        onChange={mockOnChange}
        {...props}
      />
    )
  }

  describe('Rendering', () => {
    it('should render the textarea', () => {
      renderMessageInput()
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should render the preview button', () => {
      renderMessageInput()
      const previewButton = screen.getByRole('button', { name: /preview/i })
      expect(previewButton).toBeInTheDocument()
    })

    it('should render character counter', () => {
      renderMessageInput()
      const counter = screen.getByText(/0\/500/)
      expect(counter).toBeInTheDocument()
    })

    it('should display current value', () => {
      const testMessage = 'Hello, World!'
      renderMessageInput({ value: testMessage })
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(testMessage)
    })

    it('should update character counter based on value', () => {
      const testMessage = 'Hello, World!'
      renderMessageInput({ value: testMessage })
      const counter = screen.getByText(`${testMessage.length}/500`)
      expect(counter).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup()
      renderMessageInput()
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello')
      
      // user.type calls onChange for each character
      expect(mockOnChange).toHaveBeenCalledWith('H')
      expect(mockOnChange).toHaveBeenCalledWith('He')
      expect(mockOnChange).toHaveBeenCalledWith('Hel')
      expect(mockOnChange).toHaveBeenCalledWith('Hell')
      expect(mockOnChange).toHaveBeenCalledWith('Hello')
    })

    it('should toggle preview mode when preview button is clicked', async () => {
      const user = userEvent.setup()
      renderMessageInput({ value: 'Test message' })
      
      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)
      
      // Should show preview content
      expect(screen.getByText('Test message')).toBeInTheDocument()
      
      // Button should change to "Edit"
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('should show markdown preview correctly', async () => {
      const user = userEvent.setup()
      const markdownText = '**Bold** and *italic* text'
      renderMessageInput({ value: markdownText })
      
      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)
      
      // Should render markdown
      expect(screen.getByText('Bold')).toBeInTheDocument()
      expect(screen.getByText('italic')).toBeInTheDocument()
    })

    it('should auto-resize textarea based on content', async () => {
      const user = userEvent.setup()
      renderMessageInput()
      
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'This is a longer message that should cause the textarea to resize')
      
      // Verify the interaction works
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Validation and Limits', () => {
    it('should show warning when approaching limit', () => {
      const longMessage = 'A'.repeat(450)
      renderMessageInput({ value: longMessage })
      
      const counter = screen.getByText('450/500')
      expect(counter).toBeInTheDocument()
      
      // Should show remaining characters warning
      expect(screen.getByText('50 characters remaining')).toBeInTheDocument()
    })

    it('should show error when over limit', () => {
      const overLimitMessage = 'A'.repeat(550)
      renderMessageInput({ value: overLimitMessage })
      
      const counter = screen.getByText('550/500')
      expect(counter).toBeInTheDocument()
      
      // Should show over limit warning
      expect(screen.getByText('50 characters over limit')).toBeInTheDocument()
    })

    it('should handle messages exactly at the limit', () => {
      const maxMessage = 'A'.repeat(500)
      renderMessageInput({ value: maxMessage })
      
      const counter = screen.getByText('500/500')
      expect(counter).toBeInTheDocument()
    })
  })

  describe('Preview Mode', () => {
    it('should show preview content when in preview mode', async () => {
      const user = userEvent.setup()
      const testMessage = 'Hello, World!'
      renderMessageInput({ value: testMessage })
      
      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)
      
      expect(screen.getByText(testMessage)).toBeInTheDocument()
    })

    it('should show placeholder when no content in preview mode', async () => {
      const user = userEvent.setup()
      renderMessageInput({ value: '' })
      
      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)
      
      expect(screen.getByText('Nothing to preview yet...')).toBeInTheDocument()
    })

    it('should render markdown correctly in preview', async () => {
      const user = userEvent.setup()
      const markdownText = '**Bold text** and `code`'
      renderMessageInput({ value: markdownText })
      
      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)
      
      // Check for bold text
      const boldElement = screen.getByText('Bold text')
      expect(boldElement.tagName).toBe('STRONG')
      
      // Check for code
      const codeElement = screen.getByText('code')
      expect(codeElement.tagName).toBe('CODE')
    })
  })

  describe('Accessibility', () => {
    it('should have proper placeholder text', () => {
      renderMessageInput()
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('placeholder', 'Write your encrypted message...')
    })

    it('should have proper button labels', () => {
      renderMessageInput()
      
      const previewButton = screen.getByRole('button', { name: /preview/i })
      expect(previewButton).toHaveTextContent('Preview')
    })

    it('should have proper label', () => {
      renderMessageInput()
      
      const label = screen.getByText('Message Content')
      expect(label).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string input', async () => {
      const user = userEvent.setup()
      renderMessageInput()
      
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      
      expect(mockOnChange).toHaveBeenCalledWith('')
    })

    it('should handle special characters', async () => {
      const user = userEvent.setup()
      renderMessageInput()
      
      const textarea = screen.getByRole('textbox')
      const specialChars = 'Hello & World! <script>alert("test")</script>'
      
      await user.type(textarea, specialChars)
      
      // Check that the last call contains the full string
      const calls = mockOnChange.mock.calls
      expect(calls[calls.length - 1][0]).toBe(specialChars)
    })

    it('should handle unicode characters', async () => {
      const user = userEvent.setup()
      renderMessageInput()
      
      const textarea = screen.getByRole('textbox')
      const unicodeMessage = 'Hello World!'
      
      await user.type(textarea, unicodeMessage)
      
      // Check that the last call contains the full string
      const calls = mockOnChange.mock.calls
      expect(calls[calls.length - 1][0]).toBe(unicodeMessage)
    })

    it('should handle very long words', async () => {
      const user = userEvent.setup()
      renderMessageInput()
      
      const textarea = screen.getByRole('textbox')
      const longWord = 'A'.repeat(100)
      
      await user.type(textarea, longWord)
      
      // Check that the last call contains the full string
      const calls = mockOnChange.mock.calls
      expect(calls[calls.length - 1][0]).toBe(longWord)
    })
  })

  describe('Performance', () => {
    it('should handle rapid typing', async () => {
      const user = userEvent.setup()
      renderMessageInput()
      
      const textarea = screen.getByRole('textbox')
      
      // Type rapidly
      for (let i = 0; i < 10; i++) {
        await user.type(textarea, 'test')
      }
      
      // Each character triggers onChange, so 4 characters * 10 = 40 calls
      expect(mockOnChange).toHaveBeenCalledTimes(40)
    })

    it('should handle large inputs efficiently', () => {
      const largeMessage = 'A'.repeat(1000)
      renderMessageInput({ value: largeMessage })
      
      // Should display the full message
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(largeMessage)
    })
  })

  describe('Custom Props', () => {
    it('should use custom placeholder', () => {
      const customPlaceholder = 'Custom placeholder text'
      renderMessageInput({ placeholder: customPlaceholder })
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('placeholder', customPlaceholder)
    })

    it('should use custom max length', () => {
      renderMessageInput({ maxLength: 1000 })
      
      const counter = screen.getByText('0/1000')
      expect(counter).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const customClass = 'custom-class'
      renderMessageInput({ className: customClass })
      
      // Find the main container div that has the custom class
      const container = screen.getByText('Message Content').closest('div')?.parentElement
      expect(container).toHaveClass(customClass)
    })
  })
}) 