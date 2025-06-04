"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, User, Activity, Zap, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/components/wallet-provider"
import Header from "@/components/header"

// Mock data for box details
const mockBoxDetails = {
  1: {
    id: 1,
    tokenAmount: "10 ETH",
    tokenType: "ETH",
    basePrice: "2.30 ETH",
    marketPrice: "2.45 ETH",
    lastBidPrice: "2.40 ETH",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    totalBidders: 12,
    currentHolder: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
    creator: "0x123d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
    totalTrades: 45,
    totalVolume: "108.5 ETH",
    avgMargin: "0.15 ETH",
    isExpired: false,
  },
}

const mockTradeHistory = [
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
  {
    id: 4,
    trader: "0x789d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
    bidAmount: "2.30 ETH",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    marginProfit: "0.02 ETH",
  },
]

function CountdownTimer({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = deadline.getTime() - now

      if (distance < 0) {
        setTimeLeft("EXPIRED")
        setIsExpired(true)
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        setIsExpired(false)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  return (
    <motion.div
      className="flex items-center gap-2"
      animate={!isExpired ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
    >
      <Clock className="h-4 w-4 text-primary" />
      <span className={`font-mono text-lg font-bold ${isExpired ? "text-[#169976]" : "text-primary"}`}>{timeLeft}</span>
      {isExpired && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
          <Badge className="bg-[#169976] text-white">Expired</Badge>
        </motion.div>
      )}
    </motion.div>
  )
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function BoxInfoPage() {
  const params = useParams()
  const [bidAmount, setBidAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { isConnected, address } = useWallet()

  const boxId = Number.parseInt(params.id as string)
  const boxDetails = mockBoxDetails[boxId as keyof typeof mockBoxDetails]

  if (!boxDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold mb-2 text-white">Box Not Found</h1>
          <p className="text-white/60 mb-4">The requested box does not exist.</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-[#169976] text-black font-bold">Back to All Boxes</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  const handleBid = async () => {
    if (!isConnected) {
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setShowSuccess(true)
    setBidAmount("")
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleRedeem = async () => {
    if (!isConnected) {
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
  }

  const isCurrentHolder = address && address === boxDetails.currentHolder

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <Header
        title={`Box #${boxDetails.id}`}
        subtitle={`${boxDetails.tokenAmount} Trading Box`}
        showCreateButton={false}
      />

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed top-20 right-4 z-50 bg-primary text-black p-4 rounded-lg font-bold"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            🎉 Bid placed successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Section - Box Details & Trading */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Box Details Card */}
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300 glow-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <motion.span
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                    >
                      Box Details
                    </motion.span>
                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                      <Badge className="bg-primary text-black font-bold">{boxDetails.tokenType}</Badge>
                    </motion.div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div whileHover={{ scale: 1.05, x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                      <p className="text-sm text-white/60">Base Price</p>
                      <p className="text-lg font-semibold text-white">{boxDetails.basePrice}</p>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05, x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                      <p className="text-sm text-white/60">Market Price</p>
                      <motion.p
                        className="text-lg font-semibold text-primary"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        {boxDetails.marketPrice}
                      </motion.p>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05, x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                      <p className="text-sm text-white/60">Last Bid Price</p>
                      <p className="text-lg font-semibold text-white">{boxDetails.lastBidPrice}</p>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05, x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                      <p className="text-sm text-white/60">Total Bidders</p>
                      <p className="text-lg font-semibold text-white">{boxDetails.totalBidders}</p>
                    </motion.div>
                  </div>

                  <div className="pt-4 border-t border-[#222222]">
                    <motion.div
                      className="flex items-center justify-between mb-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-sm text-white/60">Current Holder</span>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm text-white">
                          {shortenAddress(boxDetails.currentHolder)}
                          {isCurrentHolder && (
                            <Badge variant="outline" className="ml-2 text-primary border-primary">
                              You
                            </Badge>
                          )}
                        </span>
                      </div>
                    </motion.div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Time Remaining</span>
                      <CountdownTimer deadline={boxDetails.deadline} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trading Card */}
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Place Bid
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isConnected ? (
                    <motion.div
                      className="bg-black/30 p-4 rounded-lg border border-primary/30 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <AlertCircle className="h-10 w-10 text-primary mx-auto mb-2" />
                      <h3 className="text-white font-bold text-lg mb-2">Wallet Not Connected</h3>
                      <p className="text-white/60 mb-4">Connect your wallet to place bids on this box</p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Bid Amount ({boxDetails.tokenType})</label>
                        <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                          <Input
                            type="number"
                            placeholder="Enter bid amount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            disabled={boxDetails.isExpired}
                            className="bg-black border-[#222222] text-white focus:border-primary"
                          />
                        </motion.div>
                        <p className="text-xs text-white/60">
                          Minimum bid: {boxDetails.lastBidPrice} + 0.01 {boxDetails.tokenType}
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Button
                          className="w-full bg-primary hover:bg-[#169976] text-black font-bold text-lg py-6 glow-primary-strong"
                          size="lg"
                          onClick={handleBid}
                          disabled={!bidAmount || isSubmitting || boxDetails.isExpired}
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
                          <span className="ml-2">{isSubmitting ? "Placing Bid..." : "Bid Now!"}</span>
                        </Button>
                      </motion.div>

                      {boxDetails.isExpired && isCurrentHolder && (
                        <motion.div
                          className="pt-4 border-t border-[#222222]"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <p className="text-sm text-white/60 mb-3">
                            This box has expired. As the current holder, you can redeem the tokens.
                          </p>
                          <Button
                            variant="outline"
                            className="w-full border-primary text-primary hover:bg-primary hover:text-black"
                            onClick={handleRedeem}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Processing..." : "Redeem Tokens"}
                          </Button>
                        </motion.div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Section - Trade History */}
          <motion.div
            className="space-y-6"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Stats Card */}
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="h-5 w-5 text-primary" />
                    Trading Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <motion.div
                    className="flex justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-sm text-white/60">Total Trades</span>
                    <motion.span
                      className="font-semibold text-white"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {boxDetails.totalTrades}
                    </motion.span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-sm text-white/60">Total Volume</span>
                    <span className="font-semibold text-primary">{boxDetails.totalVolume}</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-sm text-white/60">Avg Margin</span>
                    <motion.span
                      className="font-semibold text-primary"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {boxDetails.avgMargin}
                    </motion.span>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trade History Card */}
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#222222]">
                        <TableHead className="text-white/60">Trader</TableHead>
                        <TableHead className="text-white/60">Bid</TableHead>
                        <TableHead className="text-white/60">Profit</TableHead>
                        <TableHead className="text-white/60">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTradeHistory.map((trade, index) => (
                        <motion.tr
                          key={trade.id}
                          className="border-[#222222] hover:bg-black/50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          whileHover={{ x: 5, backgroundColor: "rgba(29, 205, 159, 0.1)" }}
                        >
                          <TableCell className="font-mono text-xs text-white">
                            {shortenAddress(trade.trader)}
                            {address === trade.trader && (
                              <Badge variant="outline" className="ml-2 text-xs text-primary border-primary">
                                You
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold text-white">{trade.bidAmount}</TableCell>
                          <TableCell className="text-primary font-medium">+{trade.marginProfit}</TableCell>
                          <TableCell className="text-xs text-white/60">
                            {trade.timestamp.toLocaleTimeString()}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
