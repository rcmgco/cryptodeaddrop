import { Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground">DeGhost Messenger</h1>
            <span className="text-xs text-muted-foreground">v0.1</span>
          </div>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="text-sm text-muted-foreground">
              Wallet: Not Connected
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}