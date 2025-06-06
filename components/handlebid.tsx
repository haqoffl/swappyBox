'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Zap, AlertCircle } from 'lucide-react';

const HandleBid() => {
 

  

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
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
                  Bid Amount ({boxDetails.tokenType})
                </label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
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
                  Minimum bid: {boxDetails.lastBidPrice} + 0.01{' '}
                  {boxDetails.tokenType}
                </p>
                <p className="text-white">Address: {address}</p>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400 }}
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
                      ease: 'linear',
                    }}
                  >
                    {isSubmitting ? '⚡' : '🚀'}
                  </motion.span>
                  <span className="ml-2">
                    {isSubmitting ? 'Placing Bid...' : 'Bid Now!'}
                  </span>
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
                    This box has expired. As the current holder, you can redeem
                    the tokens.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-black"
                    onClick={handleRedeem}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Redeem Tokens'}
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HandleBid;
