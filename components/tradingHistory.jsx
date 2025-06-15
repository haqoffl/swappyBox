import React from 'react';
('use client');

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

const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
const tradingHistory = () => {
  return (
    <div>
      <motion.div
        className="space-y-6"
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

      <motion.div
        className="space-y-6"
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
};

export default tradingHistory;
