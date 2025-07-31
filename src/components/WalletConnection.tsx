import { useAccount, useDisconnect, useEnsName } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Button } from '@/components/ui/button'
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

export function WalletConnection() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const { toast } = useToast()
  
  const { data: ensName } = useEnsName({ address })

  const handleConnect = () => {
    open()
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected successfully.",
    })
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard.",
      })
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const openEtherscan = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, '_blank')
    }
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        variant="outline"
        className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-accent/10 border-accent hover:bg-accent hover:text-accent-foreground"
        >
          <div className="w-2 h-2 bg-accent rounded-full"></div>
          <span className="font-mono text-sm">
            {ensName || (address ? truncateAddress(address) : 'Connected')}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Wallet Connected</span>
            <span className="text-xs text-muted-foreground font-mono">
              {address && truncateAddress(address)}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openEtherscan} className="cursor-pointer">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Etherscan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}