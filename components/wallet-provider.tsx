"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Wallet, AlertCircle, Check, Copy, ExternalLink } from "lucide-react"

// Mock wallet data for demonstration
const NETWORKS = {
  1: {
    name: "Ethereum Mainnet",
    currency: "ETH",
    rpcUrl: "https://mainnet.infura.io/v3/your-infura-key",
    blockExplorer: "https://etherscan.io",
  },
  5: {
    name: "Goerli Testnet",
    currency: "ETH",
    rpcUrl: "https://goerli.infura.io/v3/your-infura-key",
    blockExplorer: "https://goerli.etherscan.io",
  },
  137: {
    name: "Polygon Mainnet",
    currency: "MATIC",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
  },
}

type Network = {
  name: string
  currency: string
  rpcUrl: string
  blockExplorer: string
}

type WalletContextType = {
  address: string | null
  balance: string
  chainId: number
  network: Network | null
  isConnecting: boolean
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  copyAddress: () => void
  viewOnExplorer: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [chainId, setChainId] = useState<number>(1)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [showCopied, setShowCopied] = useState<boolean>(false)

  // Check if wallet is already connected on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress")
    const savedChainId = localStorage.getItem("walletChainId")

    if (savedAddress) {
      setAddress(savedAddress)
      setBalance("2.45") // Mock balance
      setChainId(savedChainId ? Number.parseInt(savedChainId) : 1)
      setIsConnected(true)
    }
  }, [])

  const connectWallet = async () => {
    setIsConnecting(true)

    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock successful connection
      const mockAddress = "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4"
      setAddress(mockAddress)
      setBalance("2.45")
      setChainId(1)
      setIsConnected(true)

      // Save to localStorage for persistence
      localStorage.setItem("walletAddress", mockAddress)
      localStorage.setItem("walletChainId", "1")
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setBalance("0")
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("walletChainId")
  }

  const switchNetwork = async (newChainId: number) => {
    setIsConnecting(true)

    try {
      // Simulate network switch delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setChainId(newChainId)
      localStorage.setItem("walletChainId", newChainId.toString())
    } catch (error) {
      console.error("Error switching network:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }

  const viewOnExplorer = () => {
    if (address && network) {
      window.open(`${network.blockExplorer}/address/${address}`, "_blank")
    }
  }

  const network = chainId in NETWORKS ? NETWORKS[chainId as keyof typeof NETWORKS] : null

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        chainId,
        network,
        isConnecting,
        isConnected,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        copyAddress,
        viewOnExplorer,
      }}
    >
      {children}
      <AnimatePresence>
        {showCopied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-primary text-black px-4 py-2 rounded-md flex items-center gap-2 z-50"
          >
            <Check className="h-4 w-4" />
            <span>Address copied!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

export function ConnectWalletButton() {
  const {
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    address,
    balance,
    network,
    copyAddress,
    viewOnExplorer,
  } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)

  function shortenAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-primary hover:bg-[#169976] text-black font-bold glow-primary"
        >
          {isConnecting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="mr-2"
            >
              <Wallet className="h-4 w-4" />
            </motion.div>
          ) : (
            <Wallet className="h-4 w-4 mr-2" />
          )}
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">
          <Wallet className="h-4 w-4 mr-2" />
          <span className="font-mono">{shortenAddress(address || "")}</span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-64 bg-[#222222] border border-primary rounded-md shadow-lg z-50"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">Balance</span>
                  <span className="text-primary font-bold">
                    {balance} {network?.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60 text-sm">Network</span>
                  <span className="text-white">{network?.name}</span>
                </div>

                <div className="border-t border-[#333333] pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-black/30"
                    onClick={() => {
                      copyAddress()
                      setShowDropdown(false)
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2 text-primary" />
                    Copy Address
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-black/30"
                    onClick={() => {
                      viewOnExplorer()
                      setShowDropdown(false)
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 text-primary" />
                    View on Explorer
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-black/30"
                    onClick={() => {
                      disconnectWallet()
                      setShowDropdown(false)
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
