"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, TrendingUp, Users, DollarSign, Sparkles, Zap, AlertCircle, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/components/wallet-provider"
import Header from "@/components/header"

interface BoxFormData {
  tokenType: string
  tokenAmount: string
  tokenAddress: string
  estimatedUSD: string
  deadline: string
  walletAddress: string
}

const mockCreatedBoxStats = {
  transactionCut: "0.25 ETH",
  numberOfTrades: 23,
  uniqueTraders: 15,
  totalVolume: "45.8 ETH",
}

const mockTraderActivity = [
  {
    id: 1,
    trader: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
    bidAmount: "2.40 ETH",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    marginProfit: "0.12 ETH",
  },
  {
    id: 2,
    trader: "0x891d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
    bidAmount: "2.35 ETH",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    marginProfit: "0.08 ETH",
  },
  {
    id: 3,
    trader: "0x456d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
    bidAmount: "2.32 ETH",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    marginProfit: "0.05 ETH",
  },
]

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function CreateBoxPage() {
  const { isConnected, address } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<BoxFormData>({
    tokenType: "",
    tokenAmount: "",
    tokenAddress: "",
    estimatedUSD: "",
    deadline: "",
    walletAddress: "",
  })

  // Update wallet address when connected
  useEffect(() => {
    if (address) {
      setFormData((prev) => ({
        ...prev,
        walletAddress: address,
      }))
    }
  }, [address])

  // Set default deadline to 24 hours from now
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const defaultDeadline = tomorrow.toISOString().slice(0, 16) // Format for datetime-local

    setFormData((prev) => ({
      ...prev,
      deadline: defaultDeadline,
    }))
  }, [])

  const handleInputChange = (field: keyof BoxFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-calculate USD value
    if (field === "tokenAmount" || field === "tokenType") {
      const amount = field === "tokenAmount" ? value : formData.tokenAmount
      const token = field === "tokenType" ? value : formData.tokenType

      if (amount && token) {
        const prices: Record<string, number> = {
          ETH: 3600,
          BTC: 96000,
          USDC: 1,
          USDT: 1,
          LINK: 25,
          UNI: 12,
        }

        const price = prices[token] || 0
        const usdValue = (Number.parseFloat(amount) * price).toLocaleString()
        setFormData((prev) => ({
          ...prev,
          estimatedUSD: usdValue,
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      alert("Please connect your wallet first!")
      return
    }

    if (!formData.tokenType || !formData.tokenAmount || !formData.deadline) {
      alert("Please fill in all required fields!")
      return
    }

    setIsSubmitting(true)
    setCurrentStep(2)

    try {
      // Simulate box creation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setCurrentStep(3)
      setShowConfirmation(true)
    } catch (error) {
      console.error("Error creating box:", error)
      alert("Error creating box. Please try again.")
      setCurrentStep(1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert("Withdrawal successful!")
    } catch (error) {
      console.error("Error withdrawing:", error)
      alert("Error withdrawing. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.tokenType && formData.tokenAmount && formData.deadline && isConnected

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-black">
        <Header
          title="Box Created Successfully!"
          subtitle="Your SwapBox is now live and ready for trading"
          showCreateButton={false}
        />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Success Animation */}
            <motion.div
              className="text-center py-8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="inline-block text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-primary mb-2">Congratulations!</h2>
              <p className="text-white/70">Your trading box is now active</p>
            </motion.div>

            {/* Confirmation Card */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-[#222222] border-primary glow-primary">
                <CardHeader>
                  <CardTitle className="text-white">Box Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/60">Token Type</p>
                      <p className="font-semibold text-primary">{formData.tokenType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Token Amount</p>
                      <p className="font-semibold text-white">
                        {formData.tokenAmount} {formData.tokenType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Estimated USD Value</p>
                      <p className="font-semibold text-primary">${formData.estimatedUSD}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Deadline</p>
                      <p className="font-semibold text-white">{new Date(formData.deadline).toLocaleString()}</p>
                    </div>
                    {formData.tokenAddress && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-white/60">Token Address</p>
                        <p className="font-mono text-sm text-white">{formData.tokenAddress}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#222222]">
                    <Button
                      variant="outline"
                      className="w-full md:w-auto border-primary text-primary hover:bg-primary hover:text-black"
                      onClick={handleWithdraw}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Withdraw (Available after deadline + 24h)"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  icon: DollarSign,
                  label: "Transaction Cut",
                  value: mockCreatedBoxStats.transactionCut,
                },
                {
                  icon: TrendingUp,
                  label: "Total Trades",
                  value: mockCreatedBoxStats.numberOfTrades,
                },
                {
                  icon: Users,
                  label: "Unique Traders",
                  value: mockCreatedBoxStats.uniqueTraders,
                },
                {
                  icon: Wallet,
                  label: "Total Volume",
                  value: mockCreatedBoxStats.totalVolume,
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <stat.icon className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-white/60">{stat.label}</p>
                          <p className="font-semibold text-primary">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Trader Activity */}
            <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Recent Trader Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#222222]">
                      <TableHead className="text-white/60">Trader Address</TableHead>
                      <TableHead className="text-white/60">Bid Amount</TableHead>
                      <TableHead className="text-white/60">Margin Profit</TableHead>
                      <TableHead className="text-white/60">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTraderActivity.map((activity) => (
                      <TableRow key={activity.id} className="border-[#222222] hover:bg-black/50">
                        <TableCell className="font-mono text-white">{shortenAddress(activity.trader)}</TableCell>
                        <TableCell className="font-semibold text-white">{activity.bidAmount}</TableCell>
                        <TableCell className="text-primary font-medium">+{activity.marginProfit}</TableCell>
                        <TableCell className="text-white/60">{activity.timestamp.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-black"
                >
                  Back to All Boxes
                </Button>
              </Link>
              <Link href="/box/7" className="flex-1">
                <Button className="w-full bg-primary hover:bg-[#169976] text-black font-bold glow-primary-strong">
                  View Your Box
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header title="Create New SwapBox" subtitle="Set up your tokenized trading box" showCreateButton={false} />

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className={`flex items-center gap-2 ${currentStep >= step ? "text-primary" : "text-white/40"}`}
                animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: currentStep === step ? Number.POSITIVE_INFINITY : 0 }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step ? "bg-primary text-black" : "bg-[#222222] text-white/40"
                  }`}
                >
                  {step}
                </div>
                <span className="text-sm font-medium">
                  {step === 1 && "Configure"}
                  {step === 2 && "Processing"}
                  {step === 3 && "Complete"}
                </span>
                {step < 3 && <div className="w-8 h-0.5 bg-[#222222]" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Processing Animation */}
      <AnimatePresence>
        {currentStep === 2 && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="text-6xl mb-4"
              >
                ⚡
              </motion.div>
              <h2 className="text-2xl font-bold text-primary mb-2">Creating Your SwapBox</h2>
              <p className="text-white/70">Please wait while we deploy your trading box...</p>
              <motion.div className="w-64 h-2 bg-[#222222] rounded-full mx-auto mt-4 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Wallet Connection Check */}
          <AnimatePresence>
            {!isConnected && (
              <motion.div
                className="mb-8 bg-[#222222] border border-primary/30 rounded-lg p-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <AlertCircle className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Wallet Required</h3>
                    <p className="text-white/60">Please connect your wallet to create a SwapBox</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300 glow-primary">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Box Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Token Type */}
                <div className="space-y-2">
                  <Label htmlFor="tokenType" className="text-white">
                    Token Type *
                  </Label>
                  <Select
                    value={formData.tokenType}
                    onValueChange={(value) => handleInputChange("tokenType", value)}
                    disabled={!isConnected}
                  >
                    <SelectTrigger className="bg-black border-[#222222] text-white focus:border-primary">
                      <SelectValue placeholder="Select token type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222222] border-[#222222]">
                      <SelectItem value="ETH" className="text-white hover:bg-black">
                        ETH - Ethereum
                      </SelectItem>
                      <SelectItem value="BTC" className="text-white hover:bg-black">
                        WBTC - Wrapped Bitcoin
                      </SelectItem>
                      <SelectItem value="USDC" className="text-white hover:bg-black">
                        USDC - USD Coin
                      </SelectItem>
                      <SelectItem value="USDT" className="text-white hover:bg-black">
                        USDT - Tether
                      </SelectItem>
                      <SelectItem value="LINK" className="text-white hover:bg-black">
                        LINK - Chainlink
                      </SelectItem>
                      <SelectItem value="UNI" className="text-white hover:bg-black">
                        UNI - Uniswap
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Token Amount */}
                <div className="space-y-2">
                  <Label htmlFor="tokenAmount" className="text-white">
                    Token Amount *
                  </Label>
                  <Input
                    id="tokenAmount"
                    type="number"
                    step="0.000001"
                    placeholder="Enter token amount"
                    value={formData.tokenAmount}
                    onChange={(e) => handleInputChange("tokenAmount", e.target.value)}
                    required
                    disabled={!isConnected}
                    className="bg-black border-[#222222] text-white focus:border-primary"
                  />
                </div>

                {/* Token Address (for ERC20) */}
                <AnimatePresence>
                  {formData.tokenType && formData.tokenType !== "ETH" && (
                    <motion.div
                      className="space-y-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label htmlFor="tokenAddress" className="text-white">
                        Token Address (Optional)
                      </Label>
                      <Input
                        id="tokenAddress"
                        placeholder="0x..."
                        value={formData.tokenAddress}
                        onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
                        disabled={!isConnected}
                        className="bg-black border-[#222222] text-white focus:border-primary"
                      />
                      <p className="text-xs text-white/60">Leave empty to use default {formData.tokenType} contract</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Estimated USD Value */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedUSD" className="text-white">
                    Estimated USD Value
                  </Label>
                  <Input
                    id="estimatedUSD"
                    placeholder="Auto-calculated"
                    value={formData.estimatedUSD ? `$${formData.estimatedUSD}` : ""}
                    disabled
                    className="bg-black border-[#222222] text-primary"
                  />
                </div>

                {/* Box Deadline */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Box Deadline *
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                    disabled={!isConnected}
                    className="bg-black border-[#222222] text-white focus:border-primary"
                  />
                  {formData.deadline && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Deadline: {new Date(formData.deadline).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <Label htmlFor="walletAddress" className="text-white">
                    Your Wallet Address
                  </Label>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <Input
                      id="walletAddress"
                      value={formData.walletAddress}
                      disabled
                      className="font-mono bg-black border-[#222222] text-white"
                    />
                  </div>
                  <p className="text-xs text-white/60">
                    {isConnected ? "Connected wallet address (auto-filled)" : "Connect wallet to auto-fill"}
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-[#169976] text-black font-bold text-lg py-6 glow-primary-strong"
                  size="lg"
                  disabled={!isFormValid || isSubmitting}
                >
                  <motion.span
                    animate={isSubmitting ? { rotate: 360 } : {}}
                    transition={{
                      duration: 1,
                      repeat: isSubmitting ? Number.POSITIVE_INFINITY : 0,
                      ease: "linear",
                    }}
                  >
                    {isSubmitting ? "⚡" : "🚀"}
                  </motion.span>
                  <span className="ml-2">
                    {!isConnected ? "Connect Wallet to Create" : isSubmitting ? "Creating Box..." : "Create SwapBox"}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
