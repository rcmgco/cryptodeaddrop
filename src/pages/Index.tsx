import { MessageComposer } from '@/components/MessageComposer'
import { MessageExplorer } from '@/components/MessageExplorer'

const Index = () => {
  return (
    <div className="container max-w-screen-2xl py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <div className="bg-primary bg-clip-text">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
            DeGhost Messenger v0.1
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Secure. Decentralized. Ephemeral.
        </p>
        <p className="text-lg text-foreground max-w-3xl mx-auto">
          Send encrypted messages using Ethereum wallet addresses. 
          Only the private key holder can decrypt and read them.
        </p>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Message Composer */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Compose Message</h2>
          <MessageComposer />
        </div>

        {/* Message Explorer */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Message Explorer</h2>
          <MessageExplorer />
        </div>
      </div>

      {/* Analytics Dashboard */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground text-center">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground">Encrypted Messages</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-accent">1</div>
            <div className="text-sm text-muted-foreground">Decrypted Messages</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-accent-bright">33.3%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </section>

      {/* Technical Explanation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground text-center">How It Works</h2>
        <div className="bg-card border border-border rounded-lg p-6 shadow prose prose-sm max-w-none dark:prose-invert">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">🔐 Encryption Process</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Write your message (up to 500 characters)</li>
                <li>Enter recipient's Ethereum wallet address</li>
                <li>Choose expiration time (1, 10, or 30 days)</li>
                <li>Message encrypted with recipient's public key</li>
                <li>Encrypted data stored securely in database</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-accent mb-2">🔓 Decryption Process</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Search for messages using your wallet address</li>
                <li>Connect your wallet (MetaMask, WalletConnect, Hardware)</li>
                <li>Sign gasless transaction to prove ownership</li>
                <li>Message decrypted client-side with your private key</li>
                <li>Read receipt sent automatically</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
            <h4 className="text-md font-semibold text-primary mb-2">🛡️ Security Features</h4>
            <p className="text-sm text-muted-foreground">
              Messages are encrypted using ECIES (Elliptic Curve Integrated Encryption Scheme) with AES-256-GCM. 
              Only the holder of the private key corresponding to the target Ethereum address can decrypt the message. 
              No plaintext is ever stored on our servers, ensuring complete privacy and security.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;