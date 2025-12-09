"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { MarketplaceCard, marketplaceItems } from "./ui/marketplace-card";
import { TopStoriesSection } from "./ui/top-stories-section";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  UserPlus,
  // TrendingUp,
  Settings as SettingsIcon,
  Coins,
  Car,
  Tag,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { BsSpeedometer2 } from "react-icons/bs";
import { RxDiscordLogo } from "react-icons/rx";
import { RiNewsFill } from "react-icons/ri";
import { AuthChoiceModal } from "./modals/auth-choice-modal";
import { AutoSignupModal } from "./modals/auto-signup-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useAccount } from "wagmi";
import { DRVNPortfolio } from "./DRVNPortfolio";
import { Settings } from "./Settings";
import { Buster } from "./Buster";
import { Garage } from "./Garage";
import { useFarcasterSDK } from "../../hooks/useFarcasterSDK";
import { useAutoWalletAuth } from "../../hooks/useAutoWalletAuth";
import { useMiniKitNavigation } from "../../hooks/useMiniKitNavigation";
import { useOptimizedOnboarding } from "../../hooks/useOptimizedOnboarding";
import { useMiniAppContext } from "../../hooks/useMiniAppContext";
// import { ImmediateValueDisplay } from "./ImmediateValueDisplay";
import { ProgressiveActionButton } from "./ProgressiveActionButton";
import { ConnectButton } from "./web3/ConnectButton";
import TotalKeysMinted from "./web3/TotalKeysMinted";
import { HeroHeader } from "./ui/hero-header";

export function DRVNDashboard() {
  const { address } = useAccount();
  const [showNotification, setShowNotification] = useState(true);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [activePage, setActivePage] = useState("dashboard");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Initialize Farcaster SDK (using @farcaster/miniapp-sdk - calls ready() to dismiss splash screen)
  useFarcasterSDK();

  // Auto wallet authentication
  const {
    currentUser,
    isAuthenticated,
    shouldShowSignup,
    handleSignupSuccess,
    handleSigninSuccess,
  } = useAutoWalletAuth();

  // Base App detection and navigation
  const { handleExternalLink, handleShare } = useMiniKitNavigation();

  // Mini App context detection (Farcaster/Base)
  const { user: miniAppUser, isInMiniApp } = useMiniAppContext();

  // Optimized onboarding
  const { canAccessProtectedFeature, isLoading: isContextLoading } = useOptimizedOnboarding();

  // Determine which profile image to use: prioritize mini app profile, then database profile
  const getProfileImage = () => {
    // If in mini app and has profile photo, use it
    if (isInMiniApp && miniAppUser?.pfpUrl) {
      return miniAppUser.pfpUrl;
    }
    // Otherwise use database profile image
    return currentUser?.profileImage || "/Cars/UserImage.png";
  };

  // Determine which username to display: prioritize mini app username, then database username
  const getDisplayUsername = () => {
    // If in mini app and has username, use it
    if (isInMiniApp && miniAppUser?.username) {
      return miniAppUser.username;
    }
    // Otherwise use database username
    return currentUser?.username || "username";
  };

  // Determine which display name to show: prioritize mini app display name, then database name
  const getDisplayName = () => {
    // If in mini app and has display name, use it
    if (isInMiniApp && miniAppUser?.displayName) {
      return miniAppUser.displayName;
    }
    // Otherwise use database first + last name
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return null;
  };

  // Auto-show signup modal if user doesn't exist
  useEffect(() => {
    if (shouldShowSignup && !showAuthModal) {
      setShowAuthModal(true);
    }
  }, [shouldShowSignup, showAuthModal]);

  // Trigger notification slide-in animation on mount (mobile only)
  useEffect(() => {
    if (showNotification) {
      // Small delay to trigger animation
      const timer = setTimeout(() => {
        setNotificationVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Listen for custom events from ProgressiveActionButton
  useEffect(() => {
    const handleShowAuthModal = () => {
      setShowAuthModal(true);
    };

    const handleConnectWallet = () => {
      // This will be handled by the ConnectButton component
      console.log("Wallet connection requested");
    };

    window.addEventListener("showAuthModal", handleShowAuthModal);
    window.addEventListener("connectWallet", handleConnectWallet);

    return () => {
      window.removeEventListener("showAuthModal", handleShowAuthModal);
      window.removeEventListener("connectWallet", handleConnectWallet);
    };
  }, []);

  // Disable pull-to-refresh prevention temporarily to test scrolling
  // useEffect(() => {
  //   // Pull-to-refresh prevention disabled for testing
  // }, []);

  // Handle mobile bottom sheet swipe to close (swipe down)
  useEffect(() => {
    if (!mobileMenuOpen) return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      startY = touchEvent.touches[0].clientY;
    };

    const handleTouchMove = (e: Event) => {
      const touchEvent = e as TouchEvent;
      currentY = touchEvent.touches[0].clientY;
      const deltaY = currentY - startY;

      // If user swipes down (closing gesture)
      if (deltaY > 50) {
        setMobileMenuOpen(false);
      }
    };

    // Add touch event listeners to the mobile bottom sheet
    const mobileSidebar = document.querySelector("[data-mobile-sidebar]");
    if (mobileSidebar) {
      mobileSidebar.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      mobileSidebar.addEventListener("touchmove", handleTouchMove, {
        passive: true,
      });
    }

    return () => {
      if (mobileSidebar) {
        mobileSidebar.removeEventListener("touchstart", handleTouchStart);
        mobileSidebar.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [mobileMenuOpen]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const nextCar = () => {
    setCurrentCarIndex((prev) => (prev + 1) % marketplaceItems.length);
  };

  const prevCar = () => {
    setCurrentCarIndex((prev) => (prev - 1 + marketplaceItems.length) % marketplaceItems.length);
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextCar();
    }
    if (isRightSwipe) {
      prevCar();
    }
  };

  const handleAuthClick = () => {
    setShowAuthModal(true);
    setMobileMenuOpen(false); // Close mobile menu when opening auth modal
  };

  const navigationItems = [
    {
      icon: BsSpeedometer2,
      label: "Dashboard",
      id: "dashboard",
      isGreen: true,
    },
    { icon: RiNewsFill, label: "DRVN Culture", id: "culture", isGreen: true },
    {
      icon: Tag,
      label: "Marketplace",
      id: "marketplace",
      isGreen: true,
    },
    {
      icon: Car,
      label: "Garage",
      id: "garage",
      isGreen: true,
      requiresAuth: true,
    },
    {
      icon: Coins,
      label: "Buster Club",
      id: "buster-club",
      isGreen: true,
      requiresAuth: true,
    },
    {
      icon: SettingsIcon,
      label: "Settings",
      id: "settings",
      isGreen: true,
      requiresAuth: true,
    },
    {
      icon: FaXTwitter,
      label: "X/Twitter",
      id: "twitter",
      isGreen: false,
      externalUrl: "https://x.com/DRVNlabo",
    },
    {
      icon: RxDiscordLogo,
      label: "Discord",
      id: "discord",
      isGreen: false,
      externalUrl: "https://discord.com/invite/GBru58gZmj",
    },
  ];

  const renderPageContent = () => {
    // Show loading state if context is still loading
    if (isContextLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00daa2] mx-auto mb-4"></div>
            <p className="text-gray-300 text-sm font-sans">Loading DRVN VHCLS...</p>
          </div>
        </div>
      );
    }

    // Use progressive disclosure instead of blocking access
    const canAccessPage = (page: string) => {
      switch (page) {
        case "garage":
        case "settings":
          return canAccessProtectedFeature("garage");
        case "buster-club":
          return canAccessProtectedFeature("trading");
        default:
          return true;
      }
    };

    // Show progressive disclosure for protected pages
    if (!canAccessPage(activePage)) {
      const pageInfo = {
        garage: {
          title: "Your Garage",
          description: "View and manage your car collection",
        },
        settings: {
          title: "Settings",
          description: "Customize your DRVN VHCLS experience",
        },
        "buster-club": {
          title: "Buster Club",
          description: "Trade BSTR tokens and access exclusive features",
        },
      };

      const info = pageInfo[activePage as keyof typeof pageInfo];

      return (
        <div className="space-y-6">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-[#00daa2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{info?.title}</h2>
            <p className="text-gray-400 mb-6 font-sans">{info?.description}</p>
            <ProgressiveActionButton
              actionType="personalize"
              feature={activePage === "buster-club" ? "trading" : "garage"}
              onClick={() => {
                if (activePage === "buster-club") {
                  // Handle trading action
                } else {
                  // Handle personalization action
                }
              }}
              className="bg-[#00daa2] hover:bg-[#00b894] text-black font-mono font-semibold"
            >
              Get Started
            </ProgressiveActionButton>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case "dashboard":
        return (
          <div className="space-y-6 md:space-y-8">
            {/* Page Header */}
            <header className="flex items-center justify-between border-b border-white/5 pb-4">
              <h1 className="text-base/7 font-semibold text-white font-mono">
                {isAuthenticated && currentUser
                  ? `Welcome back, ${currentUser.username || `${currentUser.firstName} ${currentUser.lastName}`}!`
                  : "Welcome to DRVN VHCLS!"}
              </h1>
            </header>

            {/* Hero Section with Notification Banner */}
            <div
              className="relative rounded-2xl overflow-hidden bg-cover bg-center min-h-[200px] sm:min-h-[300px] md:min-h-[400px] flex flex-col justify-center p-3 sm:p-4 md:p-8"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/Cars/GtrHero1.jpg')",
              }}
            >
              {/* Content */}
              <div className="relative z-10 text-white space-y-2 sm:space-y-4 max-w-2xl mb-12 sm:mb-16 md:mb-20">
                <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold font-mono leading-tight sm:leading-normal">
                  Explore exclusive car collections and trade on Base.
                </h2>
                <p className="text-xs sm:text-sm md:text-lg text-gray-300 font-sans leading-relaxed">
                  Discover rare automotive NFTs and join the DRVN community.
                </p>
              </div>

              {/* Mobile Notification - Slide in from right, below text */}
              {showNotification && (
                <div className="md:hidden relative z-20 mt-4">
                  <div
                    className={`bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 border border-red-500 rounded-lg p-3 shadow-lg max-w-sm ml-auto transition-all duration-300 ease-out ${
                      notificationVisible
                        ? "translate-x-0 opacity-100"
                        : "translate-x-full opacity-0"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-400 text-xs mb-1 font-sans">08/27/2025</div>
                        <div className="text-red-500 font-semibold mb-1 text-xs font-mono">
                          DRVN/VHCLS V0.1.1 is here!
                        </div>
                        <div className="text-gray-300 text-xs font-sans leading-snug">
                          You&apos;re looking at a fresh build with improved onboarding,
                          Founder&apos;s Club Key minting, and easier $BSTR trading. Plus,
                          DRVN/VHCLS is now available as a mini-app right inside Farcaster & the
                          Base app. LFG
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowNotification(false)}
                        className="text-red-500 hover:text-red-300 shrink-0 border border-red-500 rounded-full size-5 h-5 w-5"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Notification Banner - Positioned inside hero at bottom */}
              {showNotification && (
                <div className="hidden md:block absolute bottom-2 md:bottom-4 left-4 md:left-8 right-4 md:right-8 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 border border-red-500 rounded-lg p-3 md:p-4 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-400 text-xs md:text-sm mb-1 font-sans">
                        12/5/2025
                      </div>
                      <div className="text-red-500 font-semibold mb-1 text-xs md:text-sm font-mono">
                        DRVN/VHCLS V0.1.2 is here!
                      </div>
                      <div className="text-gray-300 text-xs md:text-sm font-sans leading-snug sm:leading-normal">
                        You&apos;re looking at a fresh build with improved onboarding,
                        Founder&apos;s Club Key minting, and easier $BSTR trading. Plus, DRVN/VHCLS
                        is now available as a mini-app right inside Farcaster & the Base app. LFG
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotification(false)}
                      className="text-red-500 hover:text-red-300 shrink-0 border border-red-500 rounded-full size-5"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Immediate Value Display */}
            {/* <ImmediateValueDisplay 
              onNavigateToMarketplace={() => setActivePage("marketplace")}
              onNavigateToGarage={() => setActivePage("garage")}
            /> */}

            {/* DRVN Portfolio - Only show if authenticated */}
            {isAuthenticated && currentUser && (
              <DRVNPortfolio
                currentUser={currentUser}
                isAuthenticated={isAuthenticated}
                onNavigate={setActivePage}
                isInMiniApp={isInMiniApp ?? undefined}
                getProfileImage={getProfileImage}
                getDisplayUsername={getDisplayUsername}
                getDisplayName={getDisplayName}
              />
            )}

            <TotalKeysMinted />

            {/* Marketplace Section */}
            <section className="space-y-4 md:space-y-6 font-mono">
              <header className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-base/7 font-semibold text-white font-mono">Marketplace</h2>
                <ProgressiveActionButton
                  actionType="explore"
                  feature="marketplace"
                  onClick={() => setActivePage("marketplace")}
                  variant="link"
                  className="text-sm/6 font-semibold text-[#00daa2] hover:text-green-300 font-mono"
                >
                  View all
                </ProgressiveActionButton>
              </header>

              {/* Desktop Marketplace */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 z-10 w-full px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#00daa2] w-12 h-12 -ml-8 cursor-pointer"
                    >
                      <ChevronLeft className="h-7 w-7 stroke-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#00daa2] w-12 h-12 -mr-5 cursor-pointer"
                    >
                      <ChevronRight className="h-7 w-7 stroke-3" />
                    </Button>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 px-8">
                    {marketplaceItems.map((item) => (
                      <MarketplaceCard
                        key={item.id}
                        id={item.id}
                        year={item.year}
                        brand={item.brand}
                        model={item.model}
                        collection={item.collection}
                        mv={item.mv}
                        av={item.av}
                        status={item.status}
                        price={item.price}
                        image={item.image}
                        description={item.description}
                        moreInfo={item.moreInfo}
                        specs={item.specs}
                        detailedSpecs={item.detailedSpecs}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Marketplace */}
              <div className="md:hidden">
                <div className="relative">
                  <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 z-10 w-full px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#00daa2] w-12 h-12 -ml-4 cursor-pointer"
                      onClick={prevCar}
                    >
                      <ChevronLeft className="h-7 w-7 stroke-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#00daa2] w-12 h-12 -mr-4 cursor-pointer"
                      onClick={nextCar}
                    >
                      <ChevronRight className="h-7 w-7 stroke-3" />
                    </Button>
                  </div>

                  <div
                    className="flex justify-center transition-transform duration-300 ease-in-out"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <MarketplaceCard
                      id={marketplaceItems[currentCarIndex].id}
                      year={marketplaceItems[currentCarIndex].year}
                      brand={marketplaceItems[currentCarIndex].brand}
                      model={marketplaceItems[currentCarIndex].model}
                      collection={marketplaceItems[currentCarIndex].collection}
                      mv={marketplaceItems[currentCarIndex].mv}
                      av={marketplaceItems[currentCarIndex].av}
                      status={marketplaceItems[currentCarIndex].status}
                      price={marketplaceItems[currentCarIndex].price}
                      image={marketplaceItems[currentCarIndex].image}
                      description={marketplaceItems[currentCarIndex].description}
                      moreInfo={marketplaceItems[currentCarIndex].moreInfo}
                      specs={marketplaceItems[currentCarIndex].specs}
                      detailedSpecs={marketplaceItems[currentCarIndex].detailedSpecs}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Top Stories Section */}
            <TopStoriesSection onNavigate={setActivePage} />
          </div>
        );

      case "culture":
        return (
          <div className="space-y-6 md:space-y-8">
            <header className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h1 className="text-base/7 font-semibold text-white font-mono">DRVN Culture</h1>
                <p className="mt-1 text-sm text-gray-400 font-mono">
                  Stay updated with the latest automotive culture and news
                </p>
              </div>
            </header>
            <HeroHeader
              title="DRVN Culture"
              subtitle="Stay updated with the latest automotive culture and news"
              backgroundImage="/Cars/CultureHero1.jpg"
            />
            <div className="bg-gray-900 rounded-lg p-6 border border-white/10">
              <h3 className="text-[#00daa2] text-lg font-mono font-bold mb-3">
                Stay up-to-date on the latest news and content from across the automotive spectrum,
                IRL, online, and onchain. Original content coming soon.
              </h3>
            </div>
          </div>
        );

      case "marketplace":
        return (
          <div className="space-y-6 md:space-y-8">
            <header className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h1 className="text-base/7 font-semibold text-white font-mono">Marketplace</h1>
                <p className="mt-1 text-sm text-gray-400 font-mono">
                  Discover and trade exclusive automotive collections
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="link"
                  className="text-sm/6 font-semibold text-[#00daa2] hover:text-green-300 font-mono"
                  onClick={() =>
                    handleShare("Check out the DRVN VHCLS marketplace!", window.location.href)
                  }
                >
                  Share
                </Button>
                <Button
                  variant="link"
                  className="text-sm/6 font-semibold text-[#00daa2] hover:text-green-300 font-mono"
                >
                  View all
                </Button>
              </div>
            </header>
            <HeroHeader
              title="Marketplace"
              subtitle="Discover and trade exclusive automotive collections"
              backgroundImage="/Cars/SupraHero1.jpg"
            />

            {/* Desktop Marketplace */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 z-10 w-full px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#00daa2] w-12 h-12 -ml-8 cursor-pointer"
                  >
                    <ChevronLeft className="h-7 w-7 stroke-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#00daa2] w-12 h-12 -mr-5 cursor-pointer"
                  >
                    <ChevronRight className="h-7 w-7 stroke-3" />
                  </Button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 px-8">
                  {marketplaceItems.map((item) => (
                    <MarketplaceCard
                      key={item.id}
                      id={item.id}
                      year={item.year}
                      brand={item.brand}
                      model={item.model}
                      collection={item.collection}
                      mv={item.mv}
                      av={item.av}
                      status={item.status}
                      price={item.price}
                      image={item.image}
                      description={item.description}
                      moreInfo={item.moreInfo}
                      specs={item.specs}
                      detailedSpecs={item.detailedSpecs}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Marketplace */}
            <div className="md:hidden">
              <div className="relative">
                <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 z-10 w-full px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#00daa2] w-12 h-12 -ml-4 cursor-pointer"
                    onClick={prevCar}
                  >
                    <ChevronLeft className="h-7 w-7 stroke-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#00daa2] w-12 h-12 -mr-4 cursor-pointer"
                    onClick={nextCar}
                  >
                    <ChevronRight className="h-7 w-7 stroke-3" />
                  </Button>
                </div>

                <div
                  className="flex justify-center transition-transform duration-300 ease-in-out"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <MarketplaceCard
                    id={marketplaceItems[currentCarIndex].id}
                    year={marketplaceItems[currentCarIndex].year}
                    brand={marketplaceItems[currentCarIndex].brand}
                    model={marketplaceItems[currentCarIndex].model}
                    collection={marketplaceItems[currentCarIndex].collection}
                    mv={marketplaceItems[currentCarIndex].mv}
                    av={marketplaceItems[currentCarIndex].av}
                    status={marketplaceItems[currentCarIndex].status}
                    price={marketplaceItems[currentCarIndex].price}
                    image={marketplaceItems[currentCarIndex].image}
                    description={marketplaceItems[currentCarIndex].description}
                    moreInfo={marketplaceItems[currentCarIndex].moreInfo}
                    specs={marketplaceItems[currentCarIndex].specs}
                    detailedSpecs={marketplaceItems[currentCarIndex].detailedSpecs}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "garage":
        return (
          <div className="space-y-6 md:space-y-8">
            <header className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h1 className="text-base/7 font-semibold text-white font-mono">Garage</h1>
                <p className="mt-1 text-sm text-gray-400 font-mono">
                  View and manage your car collection
                </p>
              </div>
            </header>
            <Garage currentUser={currentUser} isAuthenticated={isAuthenticated} />
          </div>
        );

      case "buster-club":
        return (
          <div className="space-y-6 md:space-y-8">
            <header className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h1 className="text-base/7 font-semibold text-white font-mono">Buster Club</h1>
                <p className="mt-1 text-sm text-gray-400 font-mono">
                  Trade BSTR tokens and access exclusive features
                </p>
              </div>
            </header>
            <Buster currentUser={currentUser} isAuthenticated={isAuthenticated} />
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6 md:space-y-8">
            <header className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h1 className="text-base/7 font-semibold text-white font-mono">Settings</h1>
                <p className="mt-1 text-sm text-gray-400 font-mono">
                  Customize your DRVN VHCLS experience
                </p>
              </div>
            </header>
            <HeroHeader
              title="Settings"
              subtitle="Customize your DRVN VHCLS experience"
              backgroundImage="/Cars/shop-hero-1.jpg"
            />
            <Settings currentUser={currentUser} isAuthenticated={isAuthenticated} />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white font-mono">Page Not Found</h1>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 grid-background overflow-x-hidden mobile-optimized">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div
          className={`relative hidden md:flex flex-col gap-y-5 overflow-y-auto border-r border-[#8351a1] bg-gray-950 px-4 pb-0 transition-all duration-300 shrink-0 h-full ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Collapse Arrow */}
          <button
            onClick={toggleSidebar}
            className="sidebar-collapse-arrow"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ChevronLeft
              className={`transition-transform duration-300 ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Logo Section */}
          <div
            className={`relative flex h-16 shrink-0 items-center ${sidebarCollapsed ? "mt-20" : ""}`}
          >
            {sidebarCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer">
                      <Image
                        src="/Cars/DRVNWHITE.png"
                        alt="DRVN VHCLS"
                        width={32}
                        height={32}
                        className="h-8 w-auto dark:hidden"
                      />
                      <Image
                        src="/Cars/DRVNWHITE.png"
                        alt="DRVN VHCLS"
                        width={32}
                        height={32}
                        className="hidden h-8 w-auto dark:block"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-black border-gray-700 text-[#00daa2] font-mono"
                  >
                    DRVN VHCLS
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <>
                <Image
                  src="/Cars/DRVNWHITE.png"
                  alt="DRVN VHCLS"
                  width={120}
                  height={60}
                  className="h-8 w-auto dark:hidden"
                />
                <Image
                  src="/Cars/DRVNWHITE.png"
                  alt="DRVN VHCLS"
                  width={120}
                  height={60}
                  className="hidden h-8 w-auto dark:block"
                />
              </>
            )}
          </div>

          {/* Sidebar Content */}
          <TooltipProvider>
            <nav className="relative flex flex-1 flex-col min-h-0">
              <ul role="list" className="flex flex-1 flex-col gap-y-7 min-h-0 pb-0">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {/* Main Navigation Items (Green) */}
                    {navigationItems
                      .filter((item) => item.isGreen)
                      .map((item) => {
                        const isActive = activePage === item.id;
                        const baseClasses = `group relative flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold overflow-hidden ${
                          isActive
                            ? "bg-gray-50 text-[#00daa2] dark:bg-white/5 dark:text-[#00daa2]"
                            : "text-gray-700 hover:bg-gray-50 hover:text-[#00daa2] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-[#00daa2]"
                        }`;

                        if (sidebarCollapsed) {
                          return (
                            <li key={item.label}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      if (item.requiresAuth) {
                                        let featureType:
                                          | "marketplace"
                                          | "garage"
                                          | "trading"
                                          | "social" = "garage";
                                        if (item.id === "buster-club") {
                                          featureType = "trading";
                                        } else if (item.id === "settings" || item.id === "garage") {
                                          featureType = "garage";
                                        }

                                        if (!canAccessProtectedFeature(featureType)) {
                                          return;
                                        }
                                      }
                                      setActivePage(item.id);
                                    }}
                                    className={baseClasses + " justify-center w-full"}
                                  >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                                    <item.icon
                                      aria-hidden="true"
                                      className={`relative z-10 ${
                                        isActive
                                          ? "text-[#00daa2] dark:text-[#00daa2]"
                                          : "text-gray-400 group-hover:text-[#00daa2] dark:group-hover:text-[#00daa2]"
                                      } size-6 shrink-0`}
                                    />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="bg-black border-gray-700 text-[#00daa2] font-mono"
                                >
                                  {item.label}
                                </TooltipContent>
                              </Tooltip>
                            </li>
                          );
                        }

                        return (
                          <li key={item.label}>
                            <button
                              onClick={() => {
                                if (item.requiresAuth) {
                                  let featureType: "marketplace" | "garage" | "trading" | "social" =
                                    "garage";
                                  if (item.id === "buster-club") {
                                    featureType = "trading";
                                  } else if (item.id === "settings" || item.id === "garage") {
                                    featureType = "garage";
                                  }

                                  if (!canAccessProtectedFeature(featureType)) {
                                    return;
                                  }
                                }
                                setActivePage(item.id);
                              }}
                              className={baseClasses + " w-full text-left"}
                            >
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                              <item.icon
                                aria-hidden="true"
                                className={`relative z-10 ${
                                  isActive
                                    ? "text-[#00daa2] dark:text-[#00daa2]"
                                    : "text-gray-400 group-hover:text-[#00daa2] dark:group-hover:text-[#00daa2]"
                                } size-6 shrink-0`}
                              />
                              <span className="relative z-10">{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </li>

                {/* Social Navigation Items */}
                <li>
                  <div className="text-xs/6 font-semibold text-gray-400 dark:text-gray-500">
                    {!sidebarCollapsed && "Social"}
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {navigationItems
                      .filter((item) => !item.isGreen)
                      .map((item) => {
                        const isActive = activePage === item.id;
                        const baseClasses = `group relative flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold overflow-hidden ${
                          isActive
                            ? "bg-gray-50 text-[#00daa2] dark:bg-white/5 dark:text-[#00daa2]"
                            : "text-gray-700 hover:bg-gray-50 hover:text-[#00daa2] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-[#00daa2]"
                        }`;

                        if (sidebarCollapsed) {
                          return (
                            <li key={item.label}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      if (item.externalUrl) {
                                        handleExternalLink(item.externalUrl);
                                      } else {
                                        setActivePage(item.id);
                                      }
                                    }}
                                    className={baseClasses + " justify-center w-full"}
                                  >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                                    <item.icon
                                      aria-hidden="true"
                                      className={`relative z-10 ${
                                        isActive
                                          ? "text-[#00daa2] dark:text-[#00daa2]"
                                          : "text-gray-400 group-hover:text-[#00daa2] dark:group-hover:text-[#00daa2]"
                                      } size-6 shrink-0`}
                                    />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="bg-black border-gray-700 text-[#00daa2] font-mono"
                                >
                                  {item.label}
                                </TooltipContent>
                              </Tooltip>
                            </li>
                          );
                        }

                        return (
                          <li key={item.label}>
                            <button
                              onClick={() => {
                                if (item.externalUrl) {
                                  handleExternalLink(item.externalUrl);
                                } else {
                                  setActivePage(item.id);
                                }
                              }}
                              className={baseClasses + " w-full text-left"}
                            >
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                              <item.icon
                                aria-hidden="true"
                                className={`relative z-10 ${
                                  isActive
                                    ? "text-[#00daa2] dark:text-[#00daa2]"
                                    : "text-gray-400 group-hover:text-[#00daa2] dark:group-hover:text-[#00daa2]"
                                } size-6 shrink-0`}
                              />
                              <span className="relative z-10 truncate">{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </li>

                {/* User Profile / Auth Section */}
                <li className="-mx-6 mt-auto pb-0 mb-0">
                  {address && isAuthenticated && currentUser ? (
                    // User Profile - Show when signed in and authenticated
                    <div className="px-6 pt-3 pb-4">
                      {sidebarCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-center">
                              <div className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10 overflow-hidden">
                                <Image
                                  src={getProfileImage()}
                                  alt="Profile"
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-black border-gray-700 text-[#00daa2] font-mono"
                          >
                            @{getDisplayUsername()}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-x-4">
                            <div className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10 overflow-hidden">
                              <Image
                                src={getProfileImage()}
                                alt="Profile"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm/6 font-semibold text-gray-900 dark:text-white truncate">
                                @{getDisplayUsername()}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 bg-[#00daa2] rounded-full"></div>
                                <span className="text-[#00daa2] text-xs font-mono">Connected</span>
                              </div>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-200 dark:border-white/10">
                            <ConnectButton variant="sidebar" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Sign Up/Login Button - Show when not signed in or not authenticated
                    <div className="px-6 pt-3 pb-4">
                      {sidebarCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="border-[#00daa2] text-[#00daa2] hover:bg-[#00daa2] hover:text-black bg-transparent w-full cursor-pointer"
                              onClick={handleAuthClick}
                            >
                              <UserPlus className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-black border-gray-700 text-[#00daa2] font-mono"
                          >
                            Sign Up/Login
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button
                          onClick={handleAuthClick}
                          className="sidebar-auth-btn w-full relative flex items-center justify-center gap-2 py-2.5 px-4 border border-white/20 text-[#00daa2] font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent"
                        >
                          {/* Shimmer Effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                          {/* Button Content */}
                          <div className="relative flex items-center gap-2 z-10">
                            <UserPlus className="text-sm group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-mono">Sign Up / Login</span>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </li>
              </ul>
            </nav>
          </TooltipProvider>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 md:hidden z-50" onClick={toggleMobileMenu} />
        )}

        {/* Mobile Bottom Sheet - Rises from bottom */}
        <div
          data-mobile-sidebar
          className={`fixed bottom-0 left-0 right-0 z-60 flex flex-col gap-y-5 overflow-y-auto border-t border-[#8351a1] bg-gray-950 px-4 transform transition-transform duration-300 ease-out md:hidden rounded-t-3xl max-h-[85vh] ${
            mobileMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Drag Handle / Close Button */}
          <div className="flex items-center justify-center pt-4 pb-2 sticky top-0 bg-gray-950 z-10">
            <button onClick={toggleMobileMenu} className="flex flex-col items-center gap-1 w-full">
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
              <X className="h-5 w-5 text-gray-400 mt-1" />
            </button>
          </div>

          {/* Logo Section */}
          <div className="relative flex h-16 shrink-0 items-center">
            <Image
              src="/Cars/DRVNWHITE.png"
              alt="DRVN VHCLS"
              width={120}
              height={60}
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src="/Cars/DRVNWHITE.png"
              alt="DRVN VHCLS"
              width={120}
              height={60}
              className="hidden h-8 w-auto dark:block"
            />
          </div>

          {/* Navigation */}
          <nav className="relative flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {/* Main Navigation Items (Green) */}
                  {navigationItems
                    .filter((item) => item.isGreen)
                    .map((item) => {
                      const isActive = activePage === item.id;
                      return (
                        <li key={item.label}>
                          <button
                            onClick={() => {
                              if (item.externalUrl) {
                                handleExternalLink(item.externalUrl);
                              } else {
                                if (item.requiresAuth) {
                                  let featureType: "marketplace" | "garage" | "trading" | "social" =
                                    "garage";
                                  if (item.id === "buster-club") {
                                    featureType = "trading";
                                  } else if (item.id === "settings" || item.id === "garage") {
                                    featureType = "garage";
                                  }

                                  if (!canAccessProtectedFeature(featureType)) {
                                    return;
                                  }
                                }
                                setActivePage(item.id);
                              }
                              toggleMobileMenu();
                            }}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold w-full text-left ${
                              isActive
                                ? "bg-gray-50 text-[#00daa2] dark:bg-white/5 dark:text-[#00daa2]"
                                : "text-gray-700 hover:bg-gray-50 hover:text-[#00daa2] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-[#00daa2]"
                            }`}
                          >
                            <item.icon
                              aria-hidden="true"
                              className={`${
                                isActive
                                  ? "text-[#00daa2] dark:text-[#00daa2]"
                                  : "text-gray-400 group-hover:text-[#00daa2] dark:group-hover:text-[#00daa2]"
                              } size-6 shrink-0`}
                            />
                            {item.label}
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </li>

              {/* Social Navigation Items */}
              <li>
                <div className="text-xs/6 font-semibold text-gray-400 dark:text-gray-500">
                  Social
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {navigationItems
                    .filter((item) => !item.isGreen)
                    .map((item) => {
                      const isActive = activePage === item.id;
                      return (
                        <li key={item.label}>
                          <button
                            onClick={() => {
                              if (item.externalUrl) {
                                handleExternalLink(item.externalUrl);
                              } else {
                                setActivePage(item.id);
                              }
                              toggleMobileMenu();
                            }}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold w-full text-left ${
                              isActive
                                ? "bg-gray-50 text-[#00daa2] dark:bg-white/5 dark:text-[#00daa2]"
                                : "text-gray-700 hover:bg-gray-50 hover:text-[#00daa2] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-[#00daa2]"
                            }`}
                          >
                            <item.icon
                              aria-hidden="true"
                              className={`${
                                isActive
                                  ? "text-[#00daa2] dark:text-[#00daa2]"
                                  : "text-gray-400 group-hover:text-[#00daa2] dark:group-hover:text-[#00daa2]"
                              } size-6 shrink-0`}
                            />
                            <span className="truncate">{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </li>

              {/* User Profile / Auth Section */}
              <li className="-mx-6 mt-auto">
                {address && isAuthenticated && currentUser ? (
                  // User Profile - Show when signed in and authenticated
                  <div className="px-6 py-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-x-4">
                        <div className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10 overflow-hidden">
                          <Image
                            src={getProfileImage()}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm/6 font-semibold text-gray-900 dark:text-white truncate">
                            @{getDisplayUsername()}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-[#00daa2] rounded-full"></div>
                            <span className="text-[#00daa2] text-xs font-mono">Connected</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-white/10">
                        <ConnectButton variant="sidebar" />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Sign Up/Login Button - Show when not signed in or not authenticated
                  <div className="px-6 py-3">
                    <button
                      onClick={handleAuthClick}
                      className="sidebar-auth-btn w-full relative flex items-center justify-center gap-2 py-2.5 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent"
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                      {/* Button Content */}
                      <div className="relative flex items-center gap-2 z-10">
                        <UserPlus className="text-sm group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-mono">Sign Up / Login</span>
                      </div>
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky Header */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-6 border-b border-[#8351a1] bg-gray-950 px-4 shadow-sm sm:px-6 lg:px-8">
            {/* Mobile Logo - Left side (hamburger removed, using bottom nav) */}
            <div className="flex items-center md:hidden">
              <Image
                src="/Cars/DRVNWHITE.png"
                alt="DRVN VHCLS"
                width={60}
                height={40}
                className="h-6 w-auto"
              />
            </div>

            {/* Mobile XP indicator or empty space */}
            <div className="flex items-center md:hidden">
              <div className="text-[#8351a1] text-xs font-mono">XP / coming soon</div>
            </div>

            {/* Desktop XP indicator - positioned to far right */}
            <div className="hidden md:flex items-center ml-auto">
              <div className="text-[#8351a1] text-xs md:text-sm font-mono">XP / coming soon</div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 mb-12 md:mb-16 lg:mb-24 pb-20 md:pb-0">
              {renderPageContent()}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gray-950/40 backdrop-blur-sm px-2 py-1.5 safe-area-inset-bottom">
          <div className="flex items-center justify-center">
            <button
              onClick={toggleMobileMenu}
              className="flex flex-col items-center justify-center gap-0.5 px-6 py-1.5 rounded-full bg-transparent hover:bg-[#00daa2]/10 transition-all duration-200"
            >
              <ChevronUp
                className={`h-6 w-6 text-[#00daa2] transition-transform duration-300 ${
                  mobileMenuOpen ? "rotate-180" : "animate-pulse"
                }`}
                style={
                  !mobileMenuOpen
                    ? {
                        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      }
                    : undefined
                }
              />
              <span className="text-[10px] text-[#00daa2] font-mono font-semibold">Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Auto Signup Modal - Shows when wallet connects but user doesn't exist (Mini App only) */}
      {isInMiniApp && (
        <AutoSignupModal
          isOpen={shouldShowSignup && showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleSignupSuccess}
        />
      )}

      {/* Auth Choice Modal - Shows choice buttons, then wallet connection, then signup/signin */}
      <AuthChoiceModal
        isOpen={showAuthModal && !shouldShowSignup}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleSigninSuccess}
      />
    </div>
  );
}
