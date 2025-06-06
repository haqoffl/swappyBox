'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import type { EventLog } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

const CONTRACT_ABI = [
  'function createYourBox() external',
  'function getAllBoxes() view returns (address[])',
  'function depositToBox(uint256 _index, uint256 _deadline, uint256 _strikeInUSDC) payable',
  'function obligate(address _contract) external',
  'function bid(address _contract) payable',
  'function withdraw(address _contract) external',
  'function getPrice(address _contract) external view returns (uint256)',
  'function getBoxData(address _contract) external view returns (tuple(uint256 bidInitialTime, uint256 bidEndTime, uint256 totalBid, uint256 basePrice, uint256 lastPrice, address currentWinner, address poolInitiator))',
  'function getBalance(address _contractAdd) external view returns (uint256)',

  'event BoxEvent(address indexed boxAdd, address indexed initiator, uint256 index)',
  'event BidPrice(address bidder, uint256 BidPrice)',

  'function boxes(address) view returns (address[])',
  'function boxData(address) view returns (tuple(uint256 bidInitialTime, uint256 bidEndTime, uint256 totalBid, uint256 basePrice, uint256 lastPrice, address currentWinner, address poolInitiator))',
  'function tokenForObligation() view returns (address)',

  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'bidAmount',
        type: 'uint256',
      },
    ],
    name: 'bid',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'box',
    outputs: [
      {
        internalType: 'contract Box',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'boxData',
    outputs: [
      {
        internalType: 'uint256',
        name: 'bidInitialTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'bidEndTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalBid',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'basePrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastPrice',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'currentWinner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'poolInitiator',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'boxes',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'createYourBox',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_deadline',
        type: 'uint256',
      },
    ],
    name: 'depositToBox',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'getBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'getBoxData',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'bidInitialTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'bidEndTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalBid',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'basePrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'lastPrice',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'currentWinner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'poolInitiator',
            type: 'address',
          },
        ],
        internalType: 'struct SwappyBox.BidTrack',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'getPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'obligate',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'bidAmount',
        type: 'uint256',
      },
    ],
    name: 'bid',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'box',
    outputs: [
      {
        internalType: 'contract Box',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'boxData',
    outputs: [
      {
        internalType: 'uint256',
        name: 'bidInitialTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'bidEndTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalBid',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'basePrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastPrice',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'currentWinner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'poolInitiator',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'boxes',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'createYourBox',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_deadline',
        type: 'uint256',
      },
    ],
    name: 'depositToBox',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'getBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'getBoxData',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'bidInitialTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'bidEndTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalBid',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'basePrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'lastPrice',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'currentWinner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'poolInitiator',
            type: 'address',
          },
        ],
        internalType: 'struct SwappyBox.BidTrack',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'getPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'obligate',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_contract',
        type: 'address',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

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

  const getContract = async () => {
    // Auto-connect if not already connected
    if (!signer) {
      await connectWallet();
      // After connecting, we need to get the fresh signer
      if (!wallets || wallets.length === 0) {
        throw new Error('No wallet available');
      }
      const wallet = wallets[0];
      const privyProvider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(privyProvider);
      const ethersSigner = await ethersProvider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ethersSigner);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  const createBox = async () => {
    setIsSubmitting(true);
    try {
      const contract = await getContract();

      // Get current array length before creating box
      let currentLength = 0;
      try {
        while (true) {
          await contract.boxes(account, currentLength);
          currentLength++;
        }
      } catch {
        // currentLength now contains the actual length
      }

      console.log('Current box count before creation:', currentLength);

      const tx = await contract.createYourBox();
      const receipt = await tx.wait();

      // ✅ Look for the event in the transaction receipt
      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === 'BoxEvent');

      if (event) {
        const { boxAddress, owner, index } = event.args;
        const e = event as EventLog;
        console.log('📦 Event captured from tx:', {
          boxAddress: e.args?.boxAdd,
          creator: e.args?.initiator,
          index: index.toString(),
        });

        // Return the index from event (if you prefer it)
        return { index: parseInt(index.toString()), boxAddress };
      }

      // fallback if no event
      console.log('No BoxEvent emitted — using fallback index:', currentLength);
      return { index: currentLength };
    } catch (error) {
      console.error('Error creating box:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const depositToBox = async (
    index: number,
    deadline: number,
    strikeInUSDC: number,
    valueETH: string
  ) => {
    setIsSubmitting(true);
    try {
      const contract = await getContract();

      console.log('Depositing with params:', {
        index,
        deadline,
        strikeInUSDC,
        value: ethers.parseEther(valueETH.toString()),
      });

      const tx = await contract.depositToBox(index, deadline, strikeInUSDC, {
        value: ethers.parseEther(valueETH.toString()),
      });

      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed');
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Error depositing to box:', error);
      if (error.data) console.error('Error data:', error.data);
      throw error;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const bid = async (boxAddress: string, ethValue: string) => {
    setIsSubmitting(true);
    try {
      const contract = await getContract(); // Added await here

      console.log('biding wid params : ', {
        boxAddress,
        value: ethers.parseEther(ethValue),
      });
      const tx = await contract['bid(address)'](boxAddress, {
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
      const contract = await getContract(); // Added await here
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
      const contract = await getContract(); // Added await here
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
      const contract = await getContract();
      const data = await contract.getBoxData(boxAddress);

      if (
        data.basePrice.toString() === '0' &&
        data.currentWinner === ethers.ZeroAddress
      ) {
        console.warn('Uninitialized or empty box:', boxAddress);
        return null;
      }

      return {
        basePrice: ethers.formatEther(data.basePrice),
        lastBidPrice: ethers.formatEther(data.lastPrice),
        totalBidders: Number(data.totalBid),
        currentHolder: data.currentWinner,
        isExpired: Date.now() / 1000 > Number(data.bidEndTime),
        deadline: new Date(Number(data.bidEndTime) * 1000),
        tokenType: 'ETH',
      };
    } catch (error) {
      console.error(`Error fetching data for box ${boxAddress}:`, error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAllBoxes = async () => {
    try {
      const contract = await getContract();
      const data = await contract.getAllBoxes();

      console.log('Fetched Boxes:', data);
      return data;
    } catch (err) {
      console.error('Error fetching boxes:', err);
      return [];
    }
  };

  // Auto-connect wallet when available
  useEffect(() => {
    if (wallets && wallets.length > 0 && !signer) {
      connectWallet().catch(console.error);
    }
  }, [wallets, signer]);

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
    getAllBoxes,
    isConnected: !!signer, // Added this for easier state checking
  };
};
