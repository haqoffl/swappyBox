'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CONTRACT_ABI from '../lib/SwappyBox.json';
import { useWallets } from '@privy-io/react-auth';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export const useSimpleContract = () => {
  const { wallets } = useWallets();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Connect wallet via Privy
  const connectWallet = async () => {
    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet connected via Privy');
    }

    const wallet = wallets[0];
    const privyProvider = await wallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(privyProvider);
    const ethersSigner = await ethersProvider.getSigner();
    const address = await ethersSigner.getAddress();

    setProvider(ethersProvider);
    setSigner(ethersSigner);
    setAccount(address);
  };

  const getContract = () => {
    if (!signer) throw new Error('Wallet not connected');
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.abi, signer);
  };

  const createBox = async () => {
    setIsSubmitting(true);
    try {
      const contract = getContract();
      const tx = await contract.createYourBox();
      await tx.wait();
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating box:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const depositToBox = async (
    index: number,
    deadline: number,
    strikeInUSDC: number
  ) => {
    setIsSubmitting(true);
    try {
      const contract = getContract();
      const tx = await contract.depositToBox(index, deadline, strikeInUSDC);
      await tx.wait();
      setShowSuccess(true);
    } catch (error) {
      console.error('Error depositing to box:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const bid = async (boxAddress: string, ethValue: string) => {
    setIsSubmitting(true);
    try {
      const contract = getContract();
      const tx = await contract.bid(boxAddress, {
        value: ethers.parseEther(ethValue),
      });
      await tx.wait();
      setShowSuccess(true);
    } catch (error) {
      console.error('Error bidding:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const obligate = async (boxAddress: string) => {
    setIsSubmitting(true);
    try {
      const contract = getContract();
      const tx = await contract.obligate(boxAddress);
      await tx.wait();
      setShowSuccess(true);
    } catch (error) {
      console.error('Error obligating:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const withdraw = async (boxAddress: string) => {
    setIsSubmitting(true);
    try {
      const contract = getContract();
      const tx = await contract.withdraw(boxAddress);
      await tx.wait();
      setShowSuccess(true);
    } catch (error) {
      console.error('Error withdrawing:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const getBoxData = async (boxAddress: string) => {
    setIsSubmitting(true);
    try {
      const contract = getContract();
      const data = await contract.getBoxData(boxAddress); // no `.wait()`
      return {
        basePrice: ethers.formatEther(data.basePrice),
        marketPrice: ethers.formatEther(data.marketPrice),
        lastBidPrice: ethers.formatEther(data.lastBidPrice),
        totalBidders: data.totalBidders.toNumber(),
        currentHolder: data.currentHolder,
        isExpired: data.isExpired,
        deadline: new Date(data.deadline.toNumber() * 1000), // assuming deadline is a UNIX timestamp
        tokenType: data.tokenType,
        totalTrades: data.totalTrades.toNumber(),
        totalVolume: ethers.formatEther(data.totalVolume),
        avgMargin: `${data.avgMargin.toString()}%`, // or process as needed
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optional: listen for wallet/account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
      });
    }
  }, []);

  return {
    connectWallet,
    account,
    createBox,
    depositToBox,
    bid,
    obligate,
    withdraw,
    isSubmitting,
    showSuccess,
    getBoxData,
  };
};
