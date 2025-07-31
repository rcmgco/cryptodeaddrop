import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors'

// Get projectId from Web3Modal Cloud
const projectId = 'b0e4a4d2be0a8c3e7c8f9a5b1d2e3f4a' // Demo project ID - replace with your own

const metadata = {
  name: 'DeGhost Messenger v0.1',
  description: 'Secure. Decentralized. Ephemeral messaging using Ethereum wallet encryption',
  url: 'https://deghost-messenger.lovable.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({ projectId, metadata }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    })
    // Note: Hardware wallet connectors (Ledger, Trezor) are not available in current wagmi version
    // They can be added when supported in future versions
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http()
  }
})

export { projectId, metadata }