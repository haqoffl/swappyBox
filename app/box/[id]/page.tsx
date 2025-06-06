'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock, User, Activity, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/header';
import { usePrivy } from '@privy-io/react-auth';
import { useSimpleContract } from '@/lib/contract-service';
import HandleBid from '@/components/handlebid';
import tradingHistory from '@/components/tradingHistory';

const mockTradeHistory = [
  {
    id: 1,
    trader: '0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
    bidAmount: '2.40 ETH',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    marginProfit: '0.12 ETH',
  },
  {
    id: 2,
    trader: '0x891d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
    bidAmount: '2.35 ETH',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    marginProfit: '0.08 ETH',
  },
  {
    id: 3,
    trader: '0x456d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
    bidAmount: '2.32 ETH',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    marginProfit: '0.05 ETH',
  },
  {
    id: 4,
    trader: '0x789d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4',
    bidAmount: '2.30 ETH',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    marginProfit: '0.02 ETH',
  },
];

export default function BoxInfoPage() {
  const params = useParams();
  const { connectWallet, account, getBoxData } = useSimpleContract();
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const privy = usePrivy();
  const address = privy.user?.wallet?.address;

  const isAuthenticated = privy.user !== undefined;

  const [boxDetails, setBoxDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to shorten addresses
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if current user is the holder
  const isCurrentHolder =
    boxDetails?.currentHolder?.toLowerCase() === address?.toLowerCase();

  // Countdown Timer Component
  const CountdownTimer = ({ deadline }: { deadline: Date }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = deadline.getTime() - now;

        if (distance < 0) {
          setTimeLeft('EXPIRED');
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }, [deadline]);

    return (
      <span
        className={`font-mono text-sm ${
          timeLeft === 'EXPIRED' ? 'text-red-400' : 'text-primary'
        }`}
      >
        {timeLeft}
      </span>
    );
  };

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

        const data = await getBoxData(params.id as string);
        if (data === null) {
          setError('Box not found or not initialized');
          setBoxDetails(null);
        } else {
          setBoxDetails(data);
        }
      } catch (err) {
        console.error('Failed to fetch box data:', err);
        setError('Failed to fetch box data');
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
  }, [params?.id, isAuthenticated, account, getBoxData]);

  // // Handler for placing bids

  // // Debug renders
  // console.log('BoxInfoPage render:', {
  //   paramsId: params?.id,
  //   isAuthenticated,
  //   account,
  //   loading,
  //   boxDetails,
  //   error,
  // });

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!boxDetails) {
    return <div>Box not found or not initialized</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black  to-black">
      <motion.div
        className="lg:col-span-2 space-6 m-2 w-2/3"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Box Details Card */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300 glow-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <motion.span
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  Box Details
                </motion.span>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Badge className="bg-primary text-black font-bold">
                    {boxDetails.tokenType}
                  </Badge>
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className="text-sm text-white/60">Base Price</p>
                  <p className="text-lg font-semibold text-white">
                    {boxDetails.basePrice} ETH
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className="text-sm text-white/60">Market Price</p>
                  <motion.p
                    className="text-lg font-semibold text-primary"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    {boxDetails?.marketPrice ?? '0'} ETH
                  </motion.p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className="text-sm text-white/60">Last Bid Price</p>
                  <p className="text-lg font-semibold text-white">
                    {boxDetails.lastBidPrice} ETH
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className="text-sm text-white/60">Total Bidders</p>
                  <p className="text-lg font-semibold text-white">
                    {boxDetails.totalBidders}
                  </p>
                </motion.div>
              </div>

              <div className="pt-4 border-t border-[#222222]">
                <motion.div
                  className="flex items-center justify-between mb-2"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-sm text-white/60">Current Holder</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm text-white">
                      {shortenAddress(boxDetails.currentHolder)}
                      {isCurrentHolder && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-primary border-primary"
                        >
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

        <HandleBid />
      </motion.div>

      <motion.div
        className="space-6 w-1/3 m-2"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* Trade History Card */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
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
                  {mockTradeHistory.map((trade, index) => (
                    <motion.tr
                      key={trade.id}
                      className="border-[#222222] hover:bg-black/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{
                        x: 5,
                        backgroundColor: 'rgba(29, 205, 159, 0.1)',
                      }}
                    >
                      <TableCell className="font-mono text-xs text-white">
                        {shortenAddress(trade.trader)}
                        {address === trade.trader && (
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
      </motion.div>
    </div>
  );
}
