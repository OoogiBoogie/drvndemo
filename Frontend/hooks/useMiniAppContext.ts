"use client";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export type MiniAppUser = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
  followers?: number;
  following?: number;
};

export function useMiniAppContext() {
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null);
  const [platformType, setPlatformType] = useState<"web" | "mobile" | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [user, setUser] = useState<MiniAppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if device is mobile (using screen width and touch capability)
    const checkMobileDevice = () => {
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768; // md breakpoint
      return isTouchDevice && isSmallScreen;
    };

    const handleResize = () => {
      setIsMobileDevice(checkMobileDevice());
    };

    // Set initial mobile device state
    setIsMobileDevice(checkMobileDevice());

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    const loadContext = async () => {
      try {
        setLoading(true);
        // Check if we're in a Mini App
        const miniAppStatus = await sdk.isInMiniApp();
        setIsInMiniApp(miniAppStatus);

        if (miniAppStatus) {
          // Get context and extract user info
          const context = await sdk.context;
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
          // Get platform type from context
          setPlatformType(context.client?.platformType || null);
        } else {
          // Not in mini app = web/desktop
          setPlatformType("web");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load mini app context"));
        console.error("Error loading mini app context:", err);
        // Default to web if error occurs
        setPlatformType("web");
      } finally {
        setLoading(false);
      }
    };

    loadContext();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Determine if we should show web layout (header) or mobile layout (bottom nav)
  // Show mobile layout if: (1) in mini app with mobile platform, OR (2) on mobile device browser
  const isMobile = (isInMiniApp && platformType === "mobile") || isMobileDevice;
  const isWeb = !isMobile;

  return { isInMiniApp, platformType, isWeb, isMobile, user, loading, error };
}
