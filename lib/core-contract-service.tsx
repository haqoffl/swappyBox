"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import type { EventLog } from "ethers";

const CORETIME_MARKET_ADDRESS =
  process.env.NEXT_PUBLIC_CORETIME_MARKET_ADDRESS!;
const SWAPPY_CORE_ADDRESS = process.env.NEXT_PUBLIC_SWAPPY_CORE_ADDRESS!;

// CoretimeMarketMock ABI
const CORETIME_MARKET_ABI = [
  "function getCurrentPrice() view returns (uint256)",
  "function buyRegion() external payable  returns (uint256)",
  "function renewRegion(uint256 regionId) payable",
  "function transferRegion(uint256 regionId, address newOwner)",
  "function isRegionActive(uint256 regionId) view returns (bool)",
  "function expireRegion(uint256 regionId)",
  "function getRegion(uint256 regionId) view returns (address owner, uint256 startTime, uint256 endTime, uint256 price, bool active)",
  "function withdraw()",
  "function basePrice() view returns (uint256)",
  "function priceStep() view returns (uint256)",
  "function regionDuration() view returns (uint256)",
  "function regionsSold() view returns (uint256)",
  "function maxRegion() view returns (uint8)",
  "function regionCounter() view returns (uint256)",
  "function regions(uint256) view returns (address owner, uint256 startTime, uint256 endTime, uint256 pricePaid, bool active)",

  "event Purchased(address indexed who, uint256 regionId, uint256 price, uint256 duration)",
  "event Renewable(uint256 regionId, uint256 price, uint256 begin)",
  "event Renewed(address indexed who, uint256 oldRegionId, uint256 newRegionId, uint256 price, uint256 duration)",
  "event Transferred(uint256 regionId, address from, address to)",
];

// SwappyCore ABI
const SWAPPY_CORE_ABI = [
  "function createSecondaryMarket(uint256 regionId, uint256 bidEndTime, uint256 basePricePercentage)",
  "function bid(uint256 _coreId) payable",
  "function obligate(uint256 coreId)",
  "function getPrice(uint256 coreId) view returns (uint256)",
  "function market() view returns (address)",
  "function secondaryData(uint256) view returns (uint256 bidInitialTime, uint256 bidEndTime, uint256 totalBid, uint256 basePrice, uint256 lastPrice, address currentWinner, address poolInitiator, uint256 coreStartTime, uint256 coreEndTime, bool isObligated)",
  "function isObligated(uint256) view returns (bool)",

  "event BoxEvent(address indexed boxAdd, address indexed initiator, uint256 index)",
  "event BidPrice(address bidder, uint256 BidPrice)",
  "event Transferred(uint256 coreId, address from, address to)",
  "event BidPlaced(address indexed bidder, uint256 time, uint256 amount, string poolName)",
];

export const useSimpleCore = () => {
  const { wallets } = useWallets();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<string | null>(
    null
  );

  // Find the preferred wallet (Talisman in this case)
  const getPreferredWallet = () => {
    if (!wallets || wallets.length === 0) return null;

    // Look for Talisman wallet first
    const talismanWallet = wallets.find(
      (wallet) =>
        wallet.walletClientType === "talisman" ||
        wallet.connectorType === "talisman"
    );

    if (talismanWallet) {
      return talismanWallet;
    }

    // Fallback to first available wallet
    return wallets[0];
  };

  // Connect to the preferred wallet
  const connectWallet = async () => {
    const preferredWallet = getPreferredWallet();

    if (!preferredWallet) {
      throw new Error("No wallet connected via Privy");
    }

    console.log("Connecting to wallet:", preferredWallet.walletClientType);

    const privyProvider = await preferredWallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(privyProvider);
    const ethersSigner = await ethersProvider.getSigner();
    const address = await ethersSigner.getAddress();

    setProvider(ethersProvider);
    setSigner(ethersSigner);
    setAccount(address);
    setSelectedWalletType(preferredWallet.walletClientType);
  };

  const getCoretimeMarketContract = async () => {
    if (!signer) {
      await connectWallet();
      const preferredWallet = getPreferredWallet();
      if (!preferredWallet) {
        throw new Error("No wallet available");
      }
      const privyProvider = await preferredWallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(privyProvider);
      const ethersSigner = await ethersProvider.getSigner();
      return new ethers.Contract(
        CORETIME_MARKET_ADDRESS,
        CORETIME_MARKET_ABI,
        ethersSigner
      );
      console.log("preffered");
    }

    console.log("preffered-2");

    return new ethers.Contract(
      CORETIME_MARKET_ADDRESS,
      CORETIME_MARKET_ABI,
      signer
    );
  };

  const getSwappyCoreContract = async () => {
    if (!signer) {
      await connectWallet();
      const preferredWallet = getPreferredWallet();
      if (!preferredWallet) {
        throw new Error("No wallet available");
      }
      const privyProvider = await preferredWallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(privyProvider);
      const ethersSigner = await ethersProvider.getSigner();
      return new ethers.Contract(
        SWAPPY_CORE_ADDRESS,
        SWAPPY_CORE_ABI,
        ethersSigner
      );
    }
    return new ethers.Contract(SWAPPY_CORE_ADDRESS, SWAPPY_CORE_ABI, signer);
  };

  // Add a manual wallet switcher function
  const switchWallet = async (walletType: string) => {
    const targetWallet = wallets?.find(
      (wallet) =>
        wallet.walletClientType === walletType ||
        wallet.connectorType === walletType
    );

    if (!targetWallet) {
      throw new Error(`Wallet ${walletType} not found`);
    }

    const privyProvider = await targetWallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(privyProvider);
    const ethersSigner = await ethersProvider.getSigner();
    const address = await ethersSigner.getAddress();

    setProvider(ethersProvider);
    setSigner(ethersSigner);
    setAccount(address);
    setSelectedWalletType(targetWallet.walletClientType);
  };

  // ========== CoretimeMarketMock Functions ==========

  const getCurrentPrice = async () => {
    try {
      const contract = await getCoretimeMarketContract();
      const price = await contract.getCurrentPrice();
      console.log("from contract", price); // moved above return
      return price; // returns a string like "0.025"
    } catch (error) {
      console.error("Error getting current price:", error);
      throw error;
    }
  };

  const buyRegion = async () => {
    setIsSubmitting(true);
    try {
      const contract = await getCoretimeMarketContract();
      console.log("contract: ", contract);
      const price = await getCurrentPrice();

      console.log("Buying region with price:", price);
      // console.log(typeof price);
      const tx = await contract.buyRegion({ value: price.toString() });
      const receipt = await tx.wait();

      // Look for the Purchased event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed: any) => parsed && parsed.name === "Purchased");

      if (event) {
        const regionId = event.args.regionId;
        console.log("🎯 Region purchased:", {
          regionId: regionId.toString(),
          price: ethers.formatEther(event.args.price),
          duration: event.args.duration.toString(),
        });
        setShowSuccess(true);
        return { regionId: parseInt(regionId.toString()) };
      }

      throw new Error("Purchase event not found");
    } catch (error) {
      console.error("Error buying region:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const renewRegion = async (regionId: number) => {
    setIsSubmitting(true);
    try {
      const contract = await getCoretimeMarketContract();
      const price = await contract.getCurrentPrice();

      console.log(
        "Renewing region:",
        regionId,
        "with price:",
        ethers.formatEther(price)
      );

      const tx = await contract.renewRegion(regionId, { value: price });
      await tx.wait();

      setShowSuccess(true);
      console.log("Region renewed successfully");
    } catch (error) {
      console.error("Error renewing region:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const transferRegion = async (regionId: number, newOwner: string) => {
    setIsSubmitting(true);
    try {
      const contract = await getCoretimeMarketContract();

      console.log("Transferring region:", regionId, "to:", newOwner);

      const tx = await contract.transferRegion(regionId, newOwner);
      await tx.wait();

      setShowSuccess(true);
      console.log("Region transferred successfully");
    } catch (error) {
      console.error("Error transferring region:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const getRegion = async (regionId: number) => {
    try {
      const contract = await getCoretimeMarketContract();
      const [owner, startTime, endTime, price, active] =
        await contract.getRegion(regionId);

      return {
        owner,
        startTime: new Date(Number(startTime) * 1000),
        endTime: new Date(Number(endTime) * 1000),
        price: ethers.formatEther(price),
        active,
        isExpired: Date.now() / 1000 > Number(endTime),
      };
    } catch (error) {
      console.error("Error getting region data:", error);
      throw error;
    }
  };

  const isRegionActive = async (regionId: number) => {
    try {
      const contract = await getCoretimeMarketContract();
      return await contract.isRegionActive(regionId);
    } catch (error) {
      console.error("Error checking region activity:", error);
      throw error;
    }
  };

  const expireRegion = async (regionId: number) => {
    setIsSubmitting(true);
    try {
      const contract = await getCoretimeMarketContract();

      const tx = await contract.expireRegion(regionId);
      await tx.wait();

      setShowSuccess(true);
      console.log("Region expired successfully");
    } catch (error) {
      console.error("Error expiring region:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // ========== SwappyCore Functions ==========

  const createSecondaryMarket = async (
    regionId: number,
    bidEndTime: number,
    basePricePercentage: number
  ) => {
    setIsSubmitting(true);
    try {
      const contract = await getSwappyCoreContract();

      console.log("Creating secondary market:", {
        regionId,
        bidEndTime,
        basePricePercentage,
      });

      const tx = await contract.createSecondaryMarket(
        regionId,
        bidEndTime,
        basePricePercentage
      );
      await tx.wait();

      setShowSuccess(true);
      console.log("Secondary market created successfully");
    } catch (error) {
      console.error("Error creating secondary market:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const bidOnCore = async (coreId: number, ethValue: string) => {
    setIsSubmitting(true);
    try {
      const contract = await getSwappyCoreContract();

      console.log("Bidding on core:", {
        coreId,
        value: ethers.parseEther(ethValue),
      });

      const tx = await contract.bid(coreId, {
        value: ethers.parseEther(ethValue),
      });
      await tx.wait();

      setShowSuccess(true);
      console.log("Bid placed successfully");
    } catch (error) {
      console.error("Error bidding on core:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const obligateCore = async (coreId: number) => {
    setIsSubmitting(true);
    try {
      const contract = await getSwappyCoreContract();

      console.log("Obligating core:", coreId);

      const tx = await contract.obligate(coreId);
      await tx.wait();

      setShowSuccess(true);
      console.log("Core obligated successfully");
    } catch (error) {
      console.error("Error obligating core:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const getCorePrice = async (coreId: number) => {
    try {
      const contract = await getSwappyCoreContract();
      const price = await contract.getPrice(coreId);
      return ethers.formatEther(price);
    } catch (error) {
      console.error("Error getting core price:", error);
      throw error;
    }
  };

  const getSecondaryData = async (coreId: number) => {
    try {
      const contract = await getSwappyCoreContract();
      const data = await contract.secondaryData(coreId);

      return {
        bidInitialTime: new Date(Number(data.bidInitialTime) * 1000),
        bidEndTime: new Date(Number(data.bidEndTime) * 1000),
        totalBids: Number(data.totalBid),
        basePrice: ethers.formatEther(data.basePrice),
        lastPrice: ethers.formatEther(data.lastPrice),
        currentWinner: data.currentWinner,
        poolInitiator: data.poolInitiator,
        coreStartTime: new Date(Number(data.coreStartTime) * 1000),
        coreEndTime: new Date(Number(data.coreEndTime) * 1000),
        isObligated: data.isObligated,
        isExpired: Date.now() / 1000 > Number(data.bidEndTime),
      };
    } catch (error) {
      console.error("Error getting secondary data:", error);
      throw error;
    }
  };

  const isCoreObligated = async (coreId: number) => {
    try {
      const contract = await getSwappyCoreContract();
      return await contract.isObligated(coreId);
    } catch (error) {
      console.error("Error checking core obligation:", error);
      throw error;
    }
  };

  // ========== Utility Functions ==========

  const getMarketInfo = async () => {
    try {
      const contract = await getCoretimeMarketContract();

      const [
        basePrice,
        priceStep,
        regionDuration,
        regionsSold,
        maxRegion,
        regionCounter,
      ] = await Promise.all([
        contract.basePrice(),
        contract.priceStep(),
        contract.regionDuration(),
        contract.regionsSold(),
        contract.maxRegion(),
        contract.regionCounter(),
      ]);

      return {
        basePrice: ethers.formatEther(basePrice),
        priceStep: ethers.formatEther(priceStep),
        regionDuration: Number(regionDuration),
        regionsSold: Number(regionsSold),
        maxRegion: Number(maxRegion),
        regionCounter: Number(regionCounter),
        currentPrice: await getCurrentPrice(),
      };
    } catch (error) {
      console.error("Error getting market info:", error);
      throw error;
    }
  };

  const regionCounter = async () => {
    try {
      const contract = await getCoretimeMarketContract();
      const data = await contract.regionCounter();
      console.log("📦 Region Counter Number:", parseInt(data));
      return parseInt(data);
    } catch (err) {
      console.error("❌ Error fetching regionCounter in contract call:", err);
      throw err; // Optional: rethrow to handle higher up
    }
  };

  // Auto-connect wallet when available
  useEffect(() => {
    if (wallets && wallets.length > 0 && !signer) {
      connectWallet().catch(console.error);
    }
  }, [wallets, signer]);

  return {
    // Wallet functions
    connectWallet,
    switchWallet,
    getCoretimeMarketContract,
    account,
    regionCounter,
    isConnected: !!signer,
    selectedWalletType,

    // State
    isSubmitting,
    showSuccess,

    // CoretimeMarketMock functions
    getCurrentPrice,
    buyRegion,
    renewRegion,
    transferRegion,
    getRegion,
    isRegionActive,
    expireRegion,
    getMarketInfo,

    // SwappyCore functions
    createSecondaryMarket,
    bidOnCore,
    obligateCore,
    getCorePrice,
    getSecondaryData,
    isCoreObligated,
  };
};
