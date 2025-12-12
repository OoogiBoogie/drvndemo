"use client";

import { useState, useEffect } from "react";

interface ETHPriceDisplayProps {
  ethAmount: string;
  className?: string;
}

export default function ETHPriceDisplay({ ethAmount, className = "" }: ETHPriceDisplayProps) {
  const [usdPrice, setUsdPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch("/api/eth-price");

        if (!response.ok) {
          // Silently fail - don't log errors for rate limits or network issues
          return;
        }

        const data = await response.json();

        if (data.price) {
          setUsdPrice(data.price * parseFloat(ethAmount));
        }
        // Silently handle missing price data
      } catch (error) {
        // Silently fail - network errors are expected and shouldn't spam console
      }
    };

    fetchEthPrice();
    // Refresh price every 60 seconds
    const interval = setInterval(fetchEthPrice, 60000);
    return () => clearInterval(interval);
  }, [ethAmount]);

  return (
    <span className={className}>
      {usdPrice
        ? `(≈ $${usdPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)`
        : "Loading..."}
    </span>
  );
}
