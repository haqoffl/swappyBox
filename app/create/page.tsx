'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Wallet,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  Zap,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/header';
import { usePrivy } from '@privy-io/react-auth';
import { useSimpleContract } from '../../lib/contract-service'; // adjust path as needed

interface BoxFormData {
  tokenType: string;
  tokenAmount: string;
  tokenAddress: string;
  estimatedUSD: string;
  deadline: string;
  walletAddress: string;
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function CreateBoxPage() {
  const privy = usePrivy();
  const {
    connectWallet,
    account,
    createBox,
    depositToBox,
    isSubmitting: contractSubmitting,
    showSuccess: contractSuccess,
  } = useSimpleContract();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [createdBoxIndex, setCreatedBoxIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<BoxFormData>({
    tokenType: '',
    tokenAmount: '',
    tokenAddress: '',
    estimatedUSD: '',
    deadline: '',
    walletAddress: '',
  });
  const [createdBoxAddress, setCreatedBoxAddress] = useState<
    typeof address | null
  >(null);

  const address = privy.user?.wallet?.address;
  const isAuthenticated = privy.user !== undefined;

  // Update wallet address when connected
  useEffect(() => {
    if (address) {
      setFormData((prev) => ({
        ...prev,
        walletAddress: address,
      }));
    }
  }, [address]);

  // Connect wallet automatically when Privy is authenticated
  useEffect(() => {
    if (isAuthenticated && !account) {
      connectWallet().catch(console.error);
    }
  }, [isAuthenticated, account, connectWallet]);

  useEffect(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7); // Add 7 days (1 week)
    const defaultDeadline = nextWeek.toISOString().slice(0, 16);
    setFormData((prev) => ({
      ...prev,
      deadline: defaultDeadline,
    }));
  }, []);

  // Handle contract success
  useEffect(() => {
    if (contractSuccess && !showConfirmation) {
      setShowConfirmation(true);
      setCurrentStep(3);
    }
  }, [contractSuccess, showConfirmation]);

  const handleInputChange = (field: keyof BoxFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate USD value
    if (field === 'tokenAmount' || field === 'tokenType') {
      const amount = field === 'tokenAmount' ? value : formData.tokenAmount;
      const token = field === 'tokenType' ? value : formData.tokenType;
      if (amount && token) {
        const prices: Record<string, number> = {
          ETH: 2000,
          USDC: 1,
          USDT: 1,
        };
        const price = prices[token] || 0;
        const usdValue = (Number.parseFloat(amount) * price).toLocaleString();
        setFormData((prev) => ({
          ...prev,
          estimatedUSD: usdValue,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!account) {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
        return;
      }
    }

    if (!formData.tokenType || !formData.tokenAmount || !formData.deadline) {
      alert('Please fill in all required fields!');
      return;
    }

    setIsSubmitting(true);
    setCurrentStep(2);

    try {
      // Step 1: Create box and get the actual index
      console.log('Creating box...');
      const boxResult = await createBox();

      if (!boxResult) {
        throw new Error('Failed to get box information after creation');
      }

      // Step 2: Get values dynamically from form
      const boxIndex = boxResult.index;
      const boxAddress = boxResult.boxAddress; // Use the actual created box index
      const deadlineTimestamp = Math.floor(
        new Date(formData.deadline).getTime() / 1000
      );
      const strikeInUSDC = Math.floor(
        parseFloat(formData.estimatedUSD.replace(/,/g, '').replace('$', '')) *
          1e6
      );
      const valueETH = formData.tokenAmount;

      console.log('Using box index:', boxIndex);
      console.log('Deposit parameters:', {
        boxIndex,
        deadlineTimestamp,
        strikeInUSDC,
        valueETH,
      });

      // Step 3: Deposit to the newly created box
      await depositToBox(boxIndex, deadlineTimestamp, strikeInUSDC, valueETH);

      setCreatedBoxIndex(boxIndex);
      setCreatedBoxAddress(boxAddress);
    } catch (error) {
      console.error('Error in box creation/deposit process:', error);
      alert('Error creating box or depositing. Please try again.');
      setCurrentStep(1);
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!account || createdBoxIndex === null) {
      alert('No box available for withdrawal');
      return;
    }

    setIsSubmitting(true);
    try {
      // You'll need to get the actual box address from your contract
      // This is a placeholder - implement according to your contract structure
      const boxAddress = `0x${createdBoxIndex.toString().padStart(40, '0')}`;
      console.log(boxAddress);
      // await withdraw(boxAddress);
      alert('Withdrawal functionality will be available after implementation');
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Error withdrawing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.tokenType &&
    formData.tokenAmount &&
    formData.deadline &&
    isAuthenticated &&
    account;

  // Mock data for display (replace with real data from your contract)
  const mockCreatedBoxStats = {
    transactionCut: '2.5%',
    numberOfTrades: '12',
    uniqueTraders: '8',
    totalVolume: '$24,500',
  };

  const mockTraderActivity = [
    {
      id: 1,
      trader: '0x1234...5678',
      bidAmount: '1.5 ETH',
      marginProfit: '$50.25',
      timestamp: new Date(),
    },
    // Add more mock data as needed
  ];

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-black">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Success Animation */}
            <motion.div
              className="text-center py-8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
                className="inline-block text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-primary mb-2">
                Congratulations!
              </h2>
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
                  <p className="font-semibold text-primary">
                    {createdBoxAddress}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/60">Token Type</p>
                      <p className="font-semibold text-primary">
                        {formData.tokenType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Token Amount</p>
                      <p className="font-semibold text-white">
                        {formData.tokenAmount} {formData.tokenType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">
                        Estimated USD Value
                      </p>
                      <p className="font-semibold text-primary">
                        ${formData.estimatedUSD}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Deadline</p>
                      <p className="font-semibold text-white">
                        {new Date(formData.deadline).toLocaleString()}
                      </p>
                    </div>
                    {formData.tokenAddress && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-white/60">Token Address</p>
                        <p className="font-mono text-sm text-white">
                          {formData.tokenAddress}
                        </p>
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
                      {isSubmitting
                        ? 'Processing...'
                        : 'Withdraw (Available after deadline + 24h)'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

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
                      <TableHead className="text-white/60">
                        Trader Address
                      </TableHead>
                      <TableHead className="text-white/60">
                        Bid Amount
                      </TableHead>
                      <TableHead className="text-white/60">
                        Margin Profit
                      </TableHead>
                      <TableHead className="text-white/60">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTraderActivity.map((activity) => (
                      <TableRow
                        key={activity.id}
                        className="border-[#222222] hover:bg-black/50"
                      >
                        <TableCell className="font-mono text-white">
                          {shortenAddress(activity.trader)}
                        </TableCell>
                        <TableCell className="font-semibold text-white">
                          {activity.bidAmount}
                        </TableCell>
                        <TableCell className="text-primary font-medium">
                          +{activity.marginProfit}
                        </TableCell>
                        <TableCell className="text-white/60">
                          {activity.timestamp.toLocaleString()}
                        </TableCell>
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
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className={`flex items-center gap-2 ${
                  currentStep >= step ? 'text-primary' : 'text-white/40'
                }`}
                animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                transition={{
                  duration: 1,
                  repeat: currentStep === step ? Number.POSITIVE_INFINITY : 0,
                }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step
                      ? 'bg-primary text-black'
                      : 'bg-[#222222] text-white/40'
                  }`}
                >
                  {step}
                </div>
                <span className="text-sm font-medium">
                  {step === 1 && 'Configure'}
                  {step === 2 && 'Processing'}
                  {step === 3 && 'Complete'}
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
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
                className="text-6xl mb-4"
              >
                ⚡
              </motion.div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Creating Your SwapBox
              </h2>
              <p className="text-white/70">
                Please wait while we deploy your trading box...
              </p>
              <motion.div className="w-64 h-2 bg-[#222222] rounded-full mx-auto mt-4 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
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
            {!isAuthenticated && (
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
                    <h3 className="text-white font-bold text-xl">
                      Wallet Required
                    </h3>
                    <p className="text-white/60">
                      Please connect your wallet to create a SwapBox
                    </p>
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
                    onValueChange={(value) =>
                      handleInputChange('tokenType', value)
                    }
                    disabled={!isAuthenticated}
                  >
                    <SelectTrigger className="bg-black border-[#222222] text-white focus:border-primary">
                      <SelectValue placeholder="Select token type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222222] border-[#222222]">
                      <SelectItem
                        value="ETH"
                        className="text-white hover:bg-black"
                      >
                        ETH - Ethereum
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
                    onChange={(e) =>
                      handleInputChange('tokenAmount', e.target.value)
                    }
                    required
                    disabled={!isAuthenticated}
                    className="bg-black border-[#222222] text-white focus:border-primary"
                  />
                </div>

                {/* Token Address (for ERC20) */}
                <AnimatePresence>
                  {formData.tokenType && formData.tokenType !== 'ETH' && (
                    <motion.div
                      className="space-y-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
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
                        onChange={(e) =>
                          handleInputChange('tokenAddress', e.target.value)
                        }
                        disabled={!isAuthenticated}
                        className="bg-black border-[#222222] text-white focus:border-primary"
                      />
                      <p className="text-xs text-white/60">
                        Leave empty to use default {formData.tokenType} contract
                      </p>
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
                    value={
                      formData.estimatedUSD ? `$${formData.estimatedUSD}` : ''
                    }
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
                    onChange={(e) =>
                      handleInputChange('deadline', e.target.value)
                    }
                    min={new Date().toISOString().slice(0, 16)}
                    required
                    disabled={!isAuthenticated}
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
                    {isAuthenticated
                      ? 'Connected wallet address (auto-filled)'
                      : 'Connect wallet to auto-fill'}
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
                      ease: 'linear',
                    }}
                  >
                    {isSubmitting ? '⚡' : '🚀'}
                  </motion.span>
                  <span className="ml-2">
                    {!isAuthenticated
                      ? 'Connect Wallet to Create'
                      : isSubmitting
                      ? 'Creating Box...'
                      : 'Create SwapBox'}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
