// Add this to your component that contains the Core Box form

import { Sparkles } from "lucide-react";
import { useSimpleCore } from "../lib/core-contract-service";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TabsContent } from "./ui/tabs";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import SimpleBuyRegionButton from "./buy-core";

const CoreBoxForm = () => {
  const {
    transferRegion,
    createSecondaryMarket,
    isSubmitting,
    showSuccess,
    isConnected,
  } = useSimpleCore();

  const [formData, setFormData] = useState({
    regionId: "",
    bidEndTime: "",
    basePricePercentage: "",
  });

  const [currentStep, setCurrentStep] = useState<
    "idle" | "transferring" | "creating" | "completed"
  >("idle");
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const SWAPPY_CORE_ADDRESS = process.env.NEXT_PUBLIC_SWAPPY_CORE_ADDRESS!;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.regionId && formData.bidEndTime && formData.basePricePercentage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!isFormValid) {
      alert("Please fill in all required fields");
      return;
    }

    setCurrentStep("transferring");
    setStepErrors([]);

    try {
      // Step 1: Transfer the region to SwappyCore contract
      console.log("🔄 Step 1: Transferring region to SwappyCore contract...");

      await transferRegion(parseInt(formData.regionId), SWAPPY_CORE_ADDRESS);

      console.log("✅ Step 1 completed: Region transferred successfully");

      // Step 2: Create secondary market
      setCurrentStep("creating");
      console.log("🔄 Step 2: Creating secondary market...");

      await createSecondaryMarket(
        parseInt(formData.regionId),
        parseInt(formData.bidEndTime),
        parseInt(formData.basePricePercentage)
      );

      console.log("✅ Step 2 completed: Secondary market created successfully");

      setCurrentStep("completed");

      // Reset form after successful creation
      setTimeout(() => {
        setFormData({
          regionId: "",
          bidEndTime: "",
          basePricePercentage: "",
        });
        setCurrentStep("idle");
      }, 3000);
    } catch (error: any) {
      console.error("❌ CoreBox creation failed:", error);

      let errorMessage = "Unknown error occurred";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.reason) {
        errorMessage = error.reason;
      }

      if (currentStep === "transferring") {
        setStepErrors(["Failed to transfer region: " + errorMessage]);
      } else if (currentStep === "creating") {
        setStepErrors([
          "Region transferred but failed to create secondary market: " +
            errorMessage,
        ]);
      }

      setCurrentStep("idle");
    }
  };

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet to Create";

    switch (currentStep) {
      case "transferring":
        return "Transferring Region...";
      case "creating":
        return "Creating Secondary Market...";
      case "completed":
        return "CoreBox Created Successfully!";
      default:
        return "Create CoreBox";
    }
  };

  const getButtonIcon = () => {
    switch (currentStep) {
      case "transferring":
      case "creating":
        return "⚡";
      case "completed":
        return "✅";
      default:
        return "🚀";
    }
  };
  // components/SuccessMessage.tsx

  const SuccessMessage = ({ message = "CoreBox created successfully!" }) => {
    return (
      <div className="bg-green-900/20 border border-green-500 text-green-300 rounded-lg p-6 flex items-center gap-3 justify-center animate-pulse">
        <CheckCircle className="h-6 w-6 text-green-400" />
        <span className="font-semibold text-lg">{message}</span>
      </div>
    );
  };

  return (
    <TabsContent value="coreBox">
      {currentStep === "completed" && (
        <SuccessMessage message="🎉 CoreBox created and listed for bidding!" />
      )}

      <Card className="bg-[#222222] border-[#222222] hover:border-primary transition-all duration-300 glow-primary">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Core Box Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progress Indicator */}
            {currentStep !== "idle" && (
              <div className="bg-black/50 rounded-lg p-4 border border-[#333]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-primary font-semibold">Progress:</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div
                    className={`flex items-center gap-2 ${
                      currentStep === "transferring"
                        ? "text-yellow-400"
                        : ["creating", "completed"].includes(currentStep)
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {["creating", "completed"].includes(currentStep)
                      ? "✅"
                      : currentStep === "transferring"
                      ? "⚡"
                      : "⏳"}
                    Step 1: Transfer Region to Contract
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      currentStep === "creating"
                        ? "text-yellow-400"
                        : currentStep === "completed"
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {currentStep === "completed"
                      ? "✅"
                      : currentStep === "creating"
                      ? "⚡"
                      : "⏳"}
                    Step 2: Create Secondary Market
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {stepErrors.length > 0 && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <div className="text-red-400 font-semibold mb-2">Errors:</div>
                {stepErrors.map((error, index) => (
                  <div key={index} className="text-red-300 text-sm">
                    {error}
                  </div>
                ))}
              </div>
            )}

            {/* Region ID */}
            <div className="space-y-2">
              <Label htmlFor="regionId" className="text-white">
                Region ID *
              </Label>
              <Input
                id="regionId"
                type="number"
                placeholder="Enter Region ID"
                value={formData.regionId}
                onChange={(e) => handleInputChange("regionId", e.target.value)}
                required
                disabled={!isConnected || currentStep !== "idle"}
                className="bg-black border-[#222222] text-white focus:border-primary"
              />
            </div>

            {/* Bid End Time (in seconds) */}
            <div className="space-y-2">
              <Label htmlFor="bidEndTime" className="text-white">
                Bid End Time (in seconds) *
              </Label>
              <Input
                id="bidEndTime"
                type="number"
                placeholder="e.g., 3600 for 1 hour"
                value={formData.bidEndTime}
                onChange={(e) =>
                  handleInputChange("bidEndTime", e.target.value)
                }
                required
                disabled={!isConnected || currentStep !== "idle"}
                className="bg-black border-[#222222] text-white focus:border-primary"
              />
              <p className="text-xs text-gray-400">
                Duration in seconds (3600 = 1 hour, 86400 = 1 day)
              </p>
            </div>

            {/* Base Price Percentage */}
            <div className="space-y-2">
              <Label htmlFor="basePricePercentage" className="text-white">
                Base Price Percentage *
              </Label>
              <Input
                id="basePricePercentage"
                type="number"
                placeholder="e.g., 80 for 80%"
                value={formData.basePricePercentage}
                onChange={(e) =>
                  handleInputChange("basePricePercentage", e.target.value)
                }
                required
                disabled={!isConnected || currentStep !== "idle"}
                className="bg-black border-[#222222] text-white focus:border-primary"
              />
              <p className="text-xs text-gray-400">
                Percentage of original region price (1-100)
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={`w-full font-bold text-lg py-6 transition-all duration-300 ${
                currentStep === "completed"
                  ? "bg-green-600 hover:bg-green-700 text-white glow-green"
                  : "bg-primary hover:bg-[#169976] text-black glow-primary-strong"
              }`}
              size="lg"
              disabled={!isFormValid || currentStep !== "idle" || !isConnected}
            >
              <motion.span
                animate={
                  ["transferring", "creating"].includes(currentStep)
                    ? { rotate: 360 }
                    : {}
                }
                transition={{
                  duration: 1,
                  repeat: ["transferring", "creating"].includes(currentStep)
                    ? Number.POSITIVE_INFINITY
                    : 0,
                  ease: "linear",
                }}
              >
                {getButtonIcon()}
              </motion.span>
              <span className="ml-2">{getButtonText()}</span>
            </Button>

            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <div className="text-blue-400 font-semibold mb-2">
                How it works:
              </div>
              <div className="text-blue-300 text-sm space-y-1">
                <div>
                  1. Your region will be transferred to the SwappyCore contract
                </div>
                <div>2. A secondary market will be created for bidding</div>
                <div>3. Others can bid on your region until the deadline</div>
                <div>4. Winner can claim the region after bidding ends</div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <SimpleBuyRegionButton />
    </TabsContent>
  );
};

export default CoreBoxForm;
