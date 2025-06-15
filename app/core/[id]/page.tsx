"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Zap, AlertCircle, Clock } from "lucide-react"; // icons
import { useEffect, useState } from "react";
import { useSimpleCore } from "@/lib/core-contract-service";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
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
];

interface TradeHistoryItem {
  id: string;
  trader: string;
  bidAmount: string | number;
  marginProfit: string | number;
  timestamp: Date;
}

interface BoxDetails {
  tokenType: string;
  basePrice: string | number;
  marketPrice: string | number;
  lastBidPrice: string | number;
  totalBidders: number;
  currentHolder: string;
  deadline: Date;
  isExpired: boolean;
}

// interface CoreInfoPageProps {
//   boxDetails: BoxDetails;
//   address: string; // current user wallet address
//   isAuthenticated: boolean;
//   mockTradeHistory: TradeHistoryItem[];
//   onBid: (amount: number) => Promise<void>;
//   onRedeem: () => Promise<void>;
// }

function CountdownTimer({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isEndingSoon, setIsEndingSoon] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline.getTime() - now;

      if (distance < 0) {
        setTimeLeft("EXPIRED");
        setIsEndingSoon(false);
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setIsEndingSoon(distance < 24 * 60 * 60 * 1000); // under 24h
        setTimeLeft(
          `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <motion.div
      className="flex items-center gap-2"
      animate={isEndingSoon ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Clock className="h-4 w-4 text-primary" />
      <span
        className={`text-sm font-mono ${
          isEndingSoon ? "text-primary font-medium" : "text-white"
        }`}
      >
        {timeLeft}
      </span>

      <AnimatePresence>
        {isEndingSoon && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Badge className="text-xs bg-primary text-black font-bold animate-pulse-glow">
              Ends Soon
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CoreInfoPage() {
  const params = useParams();

  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    connectWallet,
    account,
    getSecondaryData,
    bidOnCore,
    getCorePrice,
    isConnected,
  } = useSimpleCore();
  const [price, setPrice] = useState<string>();

  const privy = usePrivy();
  const address = privy.user?.wallet?.address;

  const isAuthenticated = privy.user !== undefined;

  const [boxDetails, setBoxDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !account) {
      connectWallet().catch(console.error);
    }
  }, [isAuthenticated, account, connectWallet]);
  useEffect(() => {
    const fetchBoxDetails = async () => {
      if (!params?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const index = Number(params.id);

        console.log(index);

        const data = await getSecondaryData(index as number);
        if (data === null) {
          setError("Box not found or not initialized");
          console.log("nothing");
          setBoxDetails(null);
        } else {
          setBoxDetails(data);
          console.log(data);
          console.log(data.poolInitiator);

          console.log(data.basePrice);
        }
      } catch (err) {
        console.error("Failed to fetch box data:", err);
        setError("Failed to fetch box data");
        setBoxDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && account) {
      fetchBoxDetails();
    } else if (isAuthenticated && !account) {
      const timer = setTimeout(() => {
        fetchBoxDetails();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      fetchBoxDetails();
    }
  }, [params?.id, isAuthenticated, account]);

  const fetchPrice = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!params?.id) {
      setLoading(false);
      return;
    }

    try {
      const index = Number(params.id);

      console.log(index);
      setError("");
      const result = await getCorePrice(index as number);
      setPrice(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch price";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, [isConnected]);

  // Helper function to shorten addresses
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  // Check if current user is the holder
  const isCurrentHolder =
    boxDetails?.poolInitiator?.toLowerCase() === address?.toLowerCase();

  const handleBid = async () => {
    console.log("handleBid clicked"); // ← Add this
    if (!isAuthenticated || !bidAmount || !boxDetails) return;
    console.log("bid params :", bidAmount, boxDetails);

    // Assuming boxDetails.ownerAddress holds the owner address and account is connected wallet
    if (isCurrentHolder) {
      alert(
        " 🚫 You're the initiator & current owner. You cannot place a bid."
      );
      setTimeout(() => setError(null), 4000);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const boxAddress = Number(boxDetails.boxAddress || params.id);

      console.log("intenral ", boxAddress);
      await bidOnCore(boxAddress, bidAmount);

      setShowSuccess(true);
      setBidAmount("");
      const updatedData = await getSecondaryData(boxAddress);
      setBoxDetails(updatedData);
    } catch (err) {
      console.error("Bid failed:", err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  //   async function handleRedeem() {
  //     if (isSubmitting) return;
  //     setIsSubmitting(true);
  //     try {
  //       await onRedeem();
  //     } catch (e) {
  //       console.error("Redeem failed", e);
  //     }
  //     setIsSubmitting(false);
  //   }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!boxDetails) {
    return <div className="text-white">No box details available.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black to-black p-2">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed bottom-10 right-10 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg"
          >
            🎉 Bid placed successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Left Column */}
      <motion.div
        className="lg:col-span-2 space-y-6 m-2 w-2/3"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Box Details */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300 glow-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <motion.span
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Box Details
                </motion.span>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge className="bg-primary text-black font-bold">WND</Badge>
                </motion.div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Base Price",
                    value: `${boxDetails?.basePrice ?? "0"} WND`,
                  },
                  {
                    label: "Market Price",
                    value: `${price ?? "0"} WND`,
                  },
                  {
                    label: "Last Price",
                    value: `${boxDetails?.lastPrice ?? "0"} WND`,
                  },
                  { label: "Total Bids", value: boxDetails?.totalBids ?? "0" },
                  {
                    label: "Bid Start",
                    value:
                      boxDetails?.bidInitialTime?.toLocaleString?.() ?? "N/A",
                  },
                  {
                    label: "Bid End",
                    value: boxDetails?.bidEndTime?.toLocaleString?.() ?? "N/A",
                  },
                  {
                    label: "Core Start",
                    value:
                      boxDetails?.coreStartTime?.toLocaleString?.() ?? "N/A",
                  },
                  {
                    label: "Core End",
                    value: boxDetails?.coreEndTime?.toLocaleString?.() ?? "N/A",
                  },
                  {
                    label: "Obligation",
                    value: boxDetails?.isObligated ? "Yes" : "No",
                  },
                  {
                    label: "Expired",
                    value: boxDetails?.isExpired ? "Yes" : "No",
                    highlight: boxDetails?.isExpired,
                  },
                ].map(({ label, value, highlight }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.05, x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-sm text-white/60">{label}</p>
                    {highlight ? (
                      <motion.p
                        className="text-lg font-semibold text-primary"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {value}
                      </motion.p>
                    ) : (
                      <p className="text-lg font-semibold text-white">
                        {value}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#222222]">
                <motion.div
                  className="flex items-center justify-between mb-2"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-sm text-white/60">Pool Initiator</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm text-white">
                      {shortenAddress(boxDetails?.poolInitiator ?? "")}
                    </span>
                  </div>
                </motion.div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Time Remaining</span>
                  <CountdownTimer
                    deadline={boxDetails?.bidEndTime ?? new Date()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Place Bid */}
      </motion.div>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="space-y-6 w-1/3 m-2"
      >
        <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Place Bid
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {!isAuthenticated ? (
              <motion.div
                className="bg-black/30 p-4 rounded-lg border border-primary/30 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AlertCircle className="h-10 w-10 text-primary mx-auto mb-2" />
                <h3 className="text-white font-bold text-lg mb-2">
                  Wallet Not Connected
                </h3>
                <p className="text-white/60 mb-4">
                  Connect your wallet to place bids on this box
                </p>
              </motion.div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Bid Amount
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
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
                    Minimum bid: {boxDetails.lastBidPrice} + 0.01{" "}
                    {boxDetails.tokenType}
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
                    disabled={
                      !bidAmount || isSubmitting || boxDetails.isExpired
                    }
                  >
                    <motion.span
                      animate={isSubmitting ? { rotate: 360 } : {}}
                      transition={{
                        duration: 1,
                        repeat: isSubmitting ? Infinity : 0,
                        ease: "linear",
                      }}
                    >
                      {isSubmitting ? "⚡" : "🚀"}
                    </motion.span>
                    <span className="ml-2">
                      {isSubmitting ? "Placing Bid..." : "Bid Now!"}
                    </span>
                  </Button>
                </motion.div>

                {boxDetails.isExpired && (
                  <motion.div
                    className="pt-4 border-t border-[#222222]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-white/60 mb-3">
                      This box has expired. As the current holder, you can
                      redeem the tokens.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-black"
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

      {/* Right Column - Trade History */}
      {/* <motion.div
        className="space-y-6 w-1/3 m-2"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
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
                  {mockTradeHistory.map((trade, idx) => (
                    <motion.tr
                      key={trade.id}
                      className="border-[#222222] hover:bg-black/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      whileHover={{
                        x: 5,
                        backgroundColor: "rgba(29, 205, 159, 0.1)",
                      }}
                    >
                      <TableCell className="font-mono text-xs text-white">
                        {shortenAddress(trade.trader)}
                        {address.toLowerCase() ===
                          trade.trader.toLowerCase() && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs text-primary border-primary"
                          >
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-white">
                        {trade.bidAmount}
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        +{trade.marginProfit}
                      </TableCell>
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
      </motion.div> */}
    </div>
  );
}
