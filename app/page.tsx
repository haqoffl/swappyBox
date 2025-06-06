'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Zap, Activity } from 'lucide-react';
import Header from '@/components/header';
import { useSimpleContract } from '@/lib/contract-service'; // adjust path as needed
import { usePrivy } from '@privy-io/react-auth';

// Mock data for boxes
const mockBoxes = [
  {
    id: 1,
    address: '0x87Ca4FCc89F4c4118BcfAb72606217ea2AD26563',

    tokenAmount: '10 ETH',
    tokenType: 'ETH',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    marketPrice: '2.45 ETH',
    marketPriceUSD: '$8,820',
    lastBidPrice: '2.40 ETH',
    priceChange: 5.2,
    totalBidders: 12,
    isActive: true,
  },
  {
    id: 2,
    tokenAmount: '500 USDC',
    tokenType: 'USDC',
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
    marketPrice: '510 USDC',
    marketPriceUSD: '$510',
    lastBidPrice: '505 USDC',
    priceChange: -2.1,
    totalBidders: 8,
    isActive: true,
  },
  {
    id: 3,
    tokenAmount: '1000 LINK',
    tokenType: 'LINK',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    marketPrice: '1.2 ETH',
    marketPriceUSD: '$4,320',
    lastBidPrice: '1.15 ETH',
    priceChange: 8.7,
    totalBidders: 15,
    isActive: true,
  },
  {
    id: 4,
    tokenAmount: '0.5 BTC',
    tokenType: 'WBTC',
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
    marketPrice: '0.52 BTC',
    marketPriceUSD: '$49,920',
    lastBidPrice: '0.51 BTC',
    priceChange: 3.4,
    totalBidders: 23,
    isActive: true,
  },
  {
    id: 5,
    tokenAmount: '2000 UNI',
    tokenType: 'UNI',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    marketPrice: '0.8 ETH',
    marketPriceUSD: '$2,880',
    lastBidPrice: '0.75 ETH',
    priceChange: -1.8,
    totalBidders: 6,
    isActive: true,
  },
  {
    id: 6,
    tokenAmount: '50 ETH',
    tokenType: 'ETH',
    deadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
    marketPrice: '52 ETH',
    marketPriceUSD: '$187,200',
    lastBidPrice: '51.5 ETH',
    priceChange: 4.1,
    totalBidders: 31,
    isActive: true,
  },
];

function CountdownTimer({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isEndingSoon, setIsEndingSoon] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline.getTime() - now;

      if (distance < 0) {
        setTimeLeft('EXPIRED');
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
          `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`
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
          isEndingSoon ? 'text-primary font-medium' : 'text-white'
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
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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

export default function AllBoxesPage() {
  const privy = usePrivy();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [boxList, setBoxList] = useState<any[]>([]);

  const { getAllBoxes, getBoxData, connectWallet, account } =
    useSimpleContract();

  const address = privy.user?.wallet?.address;

  const isAuthenticated = privy.user !== undefined;
  // 1. Connect wallet when authenticated
  useEffect(() => {
    if (isAuthenticated && !account) {
      connectWallet().catch(console.error);
    }
  }, [isAuthenticated, account]);

  // 2. Fetch boxes only once account is ready
  useEffect(() => {
    if (!account) return;

    // const fetchBoxes = async () => {

    //   try {
    //     const boxes = await getAllBoxes();
    //     console.log('Fetched Boxes:', boxes);
    //     setBoxList(boxes);
    //   } catch (err) {
    //     console.error('Failed to fetch boxes:', err);
    //   }
    // };

    // fetchBoxes();

    const fetchBoxesAndData = async () => {
      try {
        const boxes = await getAllBoxes(); // array of box addresses
        console.log('Fetched Boxes:', boxes);

        // fetch data for all boxes in parallel
        const boxesData = await Promise.all(
          boxes.map(async (boxAddress: string) => {
            const data = await getBoxData(boxAddress);
            return { boxAddress, data };
          })
        );

        console.log('Boxes with data:', boxesData);
        setBoxList(boxesData);
      } catch (err) {
        console.error('Failed to fetch boxes and data:', err);
      }
    };

    fetchBoxesAndData();
  }, [account]); // ⚠️ depends only on `account`

  // console.log('Privy user:', privy.user);
  // console.log('Wallets:', privy.user?.wallet);
  // console.log('Account:', account);

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-2 text-white">
            Active Trading Boxes
          </h2>
          <motion.p
            className="text-white/70 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Discover and trade tokenized assets with competitive bidding
          </motion.p>
        </motion.div>

        {/* Boxes Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {boxList.map((box, index) => (
            <motion.div
              key={box.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.8 + index * 0.1,
                duration: 0.5,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{
                y: -10,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              onHoverStart={() => setHoveredCard(box.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card
                className={`bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300 overflow-hidden ${
                  hoveredCard === box.id ? 'glow-primary' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <motion.div
                      animate={
                        hoveredCard === box.id ? { scale: 1.05 } : { scale: 1 }
                      }
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <CardTitle className="text-lg text-white">
                        {' '}
                        {box.data?.basePrice ?? '0'} ETH
                      </CardTitle>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Badge className="bg-primary text-black font-bold">
                        {box.data?.basePrice ?? '0'} ETH{' '}
                      </Badge>
                    </motion.div>
                  </div>
                  {box.data && (
                    <CountdownTimer deadline={new Date(box.data.deadline)} />
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price Information */}
                  <div className="space-y-3">
                    <motion.div
                      className="flex justify-between items-center"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <span className="text-sm text-white/60">
                        Market Price
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {box.data?.marketPrice ?? '0'}
                        </span>
                        <motion.div
                          animate={{
                            scale:
                              box.priceChange > 0 ? [1, 1.2, 1] : [1, 1.1, 1],
                            rotate:
                              box.priceChange > 0 ? [0, 5, 0] : [0, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        >
                          {box.priceChange > 0 ? (
                            <div className="flex items-center gap-1 text-primary">
                              <TrendingUp className="h-3 w-3" />
                              <span className="text-xs font-bold">
                                +{box.priceChange}%
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[#169976]">
                              <TrendingDown className="h-3 w-3" />
                              <span className="text-xs font-bold">
                                {box.priceChange}%
                              </span>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex justify-between items-center"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <span className="text-sm text-white/60">USD Value</span>
                      <span className="text-sm font-medium text-primary">
                        $
                        {(
                          parseFloat(box.data?.marketPrice ?? '0') * 2000
                        ).toFixed(2)}
                      </span>
                    </motion.div>

                    <motion.div
                      className="flex justify-between items-center"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <span className="text-sm text-white/60">Last Bid</span>
                      <span className="text-sm text-white">
                        {box.data?.lastBidPrice ?? '0'}
                      </span>
                    </motion.div>

                    <motion.div
                      className="flex justify-between items-center"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <span className="text-sm text-white/60">
                        Total Bidders
                      </span>
                      <motion.span
                        className="text-sm text-white font-bold"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      >
                        {box.data?.totalBidders ?? 0}
                      </motion.span>
                    </motion.div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/box/${box.boxAddress}/`} className="block">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <Button className="w-full bg-primary hover:bg-[#169976] text-black font-bold text-lg py-6 glow-primary-strong">
                        <motion.span
                          animate={{ x: hoveredCard === box.id ? 5 : 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          Trade Now
                        </motion.span>
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
