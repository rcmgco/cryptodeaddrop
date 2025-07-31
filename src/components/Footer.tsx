import { Github, Twitter, Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container max-w-screen-2xl py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              DeGhost Messenger v0.1 - Secure. Decentralized. Ephemeral.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Built with love for the Web3 community. Your privacy is our priority.
        </div>
      </div>
    </footer>
  )
}