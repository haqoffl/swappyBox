import React, { useEffect, useState } from "react";
import { Loader2, ShoppingCart, CheckCircle, AlertCircle } from "lucide-react";
import { ethers } from "ethers";
import { useSimpleCore } from "../lib/core-contract-service"; // your hook

const SimpleBuyRegionButton = () => {
  const { buyRegion, isSubmitting, showSuccess, isConnected, getCurrentPrice } =
    useSimpleCore();
  const [error, setError] = useState("");
  const [price, setPrice] = useState<number>();

  const fetchPrice = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setError("");
      const result = await getCurrentPrice();
      setPrice(Number(ethers.formatEther(result)));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch price";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, [isConnected]);

  const handleBuyRegion = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setError("");
      const result = await buyRegion();
      console.log("Region purchased successfully with ID:", result.regionId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to buy region";
      setError(errorMessage);
    }
  };

  return (
    <div className="flex max-w-md w-full my-12 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 mx-auto text-white space-y-4 transition-all">
      <div className="w-96">
        <h2 className="text-xl font-semibold text-center">Buy Your Core</h2>

        {/* Price Display */}
        <div className="text-center text-4xl font-bold tracking-tight text-blue-400">
          {price !== undefined ? `${price.toFixed(4)} WND` : "Fetching..."}
        </div>
      </div>
      {/* Title */}

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-lg border border-red-400 text-red-300 bg-red-400/10">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-lg border border-green-400 text-green-300 bg-green-400/10">
          <CheckCircle className="w-4 h-4" />
          Region purchased successfully!
        </div>
      )}

      {/* Buy Button */}
      <button
        onClick={handleBuyRegion}
        disabled={isSubmitting || !isConnected}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white text-base font-medium rounded-xl transition disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Buy 1 Core
          </>
        )}
      </button>

      {/* Wallet Not Connected Info */}
      {!isConnected && (
        <p className="text-center text-sm text-gray-400">
          Connect your wallet to proceed.
        </p>
      )}
    </div>
  );
};

export default SimpleBuyRegionButton;
