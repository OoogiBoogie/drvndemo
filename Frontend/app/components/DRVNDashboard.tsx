"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MarketplaceCard, marketplaceItems } from "./ui/marketplace-card";
import { TopStoriesSection } from "./ui/top-stories-section";
import {
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Menu,
  TrendingUp,
  Settings as SettingsIcon,
  Coins,
  Car,
  Tag,
  MessageSquare,
  Play,
  Clock,
  Bell,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { BsSpeedometer2 } from "react-icons/bs";
import { RxDiscordLogo } from "react-icons/rx";
import { RiNewsFill } from "react-icons/ri";
import { AuthChoiceModal } from "./modals/auth-choice-modal";
import { AutoSignupModal } from "./modals/auto-signup-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAccount } from "wagmi";
import { DRVNPortfolio } from "./DRVNPortfolio";
import { Settings } from "./Settings";
import { Buster } from "./Buster";
import { Garage } from "./Garage";
import { useFarcasterSDK } from "../../hooks/useFarcasterSDK";
import { useAutoWalletAuth } from "../../hooks/useAutoWalletAuth";
import { useMiniKitNavigation } from "../../hooks/useMiniKitNavigation";
import { useOptimizedOnboarding } from "../../hooks/useOptimizedOnboarding";
// import { ImmediateValueDisplay } from "./ImmediateValueDisplay";
import { ProgressiveActionButton } from "./ProgressiveActionButton";
import { ConnectButton } from "./web3/ConnectButton";
import TotalKeysMinted from "./web3/TotalKeysMinted";
import { HeroHeader } from "./ui/hero-header";
import { ContentFeed } from "./social/ContentFeed";
import { CreatePostButton } from "./social/CreatePostButton";
import { CreatePostModal } from "./modals/CreatePostModal";
import { SocialPost, PlatformConnection, CrossPostSettings } from "./social/types";
import { MOCK_SOCIAL_POSTS } from "./social/mockPosts";
import { Globe, Check, Plus, Zap, Users, Shield, ExternalLink, Sparkles, Trophy } from "lucide-react";
import { VehicleDetailModal } from "./modals/VehicleDetailModal";
import { MarketplaceDetailModal } from "./modals/MarketplaceDetailModal";
import { vehicles, type Vehicle } from "@/app/data/vehicleData";

export function DRVNDashboard() {
  const { address } = useAccount();
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [activePage, setActivePage] = useState("dashboard");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Social Hub state
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [feedPosts, setFeedPosts] = useState<SocialPost[]>(() => [...MOCK_SOCIAL_POSTS]);
  
  // Marketplace Modal state - uses marketplace item type for buyer-focused info
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<typeof marketplaceItems[0] | null>(null);
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [platformConnections, setPlatformConnections] = useState<PlatformConnection[]>([
    { platform: "farcaster", connected: false },
    { platform: "base", connected: true, username: "0x1234...5678" },
    { platform: "x", connected: false },
  ]);
  const [crossPostSettings, setCrossPostSettings] = useState<CrossPostSettings>({
    farcaster: false,
    base: true,
    x: false,
  });

  // Initialize Farcaster SDK
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

  // Optimized onboarding
  const { canAccessProtectedFeature, isLoading: isContextLoading } =
    useOptimizedOnboarding();

  // Social Hub handlers
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };

  const handlePostCreated = (post: SocialPost, settings: CrossPostSettings) => {
    setCrossPostSettings(settings);
    setFeedPosts((prev) => [post, ...prev]);
  };

  const handleConnectPlatform = (platform: "farcaster" | "base" | "x") => {
    setPlatformConnections(prev => 
      prev.map(p => 
        p.platform === platform 
          ? { ...p, connected: true, username: platform === "farcaster" ? "@drvn_user" : platform === "x" ? "@drvn_vhcls" : "0xABC...123" }
          : p
      )
    );
    setCrossPostSettings(prev => ({ ...prev, [platform]: true }));
  };

  const connectedPlatformsCount = platformConnections.filter(p => p.connected).length;

  // Marketplace click handler - opens buyer-focused modal with full specs
  const handleMarketplaceVehicleClick = (marketplaceId: number) => {
    const item = marketplaceItems.find(item => item.id === marketplaceId);
    if (item) {
      setSelectedMarketplaceItem(item);
      setShowMarketplaceModal(true);
    }
  };

  const mockSocialUser = {
    id: currentUser?._id || "demo-user-id",
    name: currentUser?.username || "Ava Accelerator",
    username: currentUser?.username || "ava_drvn",
    avatar: currentUser?.profileImage || "https://i.pravatar.cc/150?img=11",
  };

  const mockRegisteredVehicles = [
    {
      id: "1",
      nickname: "Black Widow",
      make: "Porsche",
      model: "911 GT3 RS",
    },
  ];

  const availableSponsors = [
    {
      id: "rb-1",
      name: "Red Bull Racing",
      logo: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
      url: "/sponsors/1",
    },
    {
      id: "base-cameras",
      name: "Base Cameras",
      logo: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
      url: "https://base.org",
    },
  ];

  // Auto-show signup modal if user doesn't exist
  useEffect(() => {
    if (shouldShowSignup && !showAuthModal) {
      setShowAuthModal(true);
    }
  }, [shouldShowSignup, showAuthModal]);

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

  // Handle mobile menu swipe to close
  useEffect(() => {
    if (!mobileMenuOpen) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      startX = touchEvent.touches[0].clientX;
      startY = touchEvent.touches[0].clientY;
    };

    const handleTouchMove = (e: Event) => {
      const touchEvent = e as TouchEvent;
      const currentX = touchEvent.touches[0].clientX;
      const currentY = touchEvent.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      // If user swipes left (closing gesture) and it's a horizontal swipe
      if (deltaX < -50 && Math.abs(deltaY) < Math.abs(deltaX)) {
        setMobileMenuOpen(false);
      }
    };

    // Add touch event listeners to the mobile sidebar
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
    setCurrentCarIndex(
      (prev) => (prev - 1 + marketplaceItems.length) % marketplaceItems.length,
    );
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
    },
    {
      icon: Coins,
      label: "Buster Club",
      id: "buster-club",
      isGreen: true,
    },
    {
      icon: MessageSquare,
      label: "Social",
      id: "social",
      isGreen: true,
    },
    {
      icon: SettingsIcon,
      label: "Settings",
      id: "settings",
      isGreen: true,
    },
    {
      icon: FaXTwitter,
      label: "X/Twitter",
      id: "twitter",
      isGreen: false,
      externalUrl: "https://x.com/drvnlabo",
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
            <p className="text-gray-300 text-sm font-sans">
              Loading DRVN VHCLS...
            </p>
          </div>
        </div>
      );
    }

    // Use progressive disclosure instead of blocking access
    const canAccessPage = (page: string) => {
      // All pages are accessible - settings will show appropriate UI based on auth state
      return true;
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
          <div className="space-y-6">
            {/* Hero Section with Notification Banner */}
            <div
              className="relative rounded-2xl overflow-hidden bg-cover bg-center min-h-[300px] md:min-h-[400px] flex flex-col justify-center p-4 md:p-8"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/Cars/GtrHero1.jpg')",
              }}
            >
              {/* Content */}
              <div className="relative z-10 text-white space-y-4 max-w-2xl -mt-8 mb-20 md:mb-24">
                <h1 className="text-xl md:text-4xl font-bold font-mono">
                  {isAuthenticated && currentUser
                    ? `Welcome back, ${currentUser.username || `${currentUser.firstName} ${currentUser.lastName}`}!`
                    : "Welcome to DRVN VHCLS!"}
                </h1>
                <p className="text-sm md:text-xl text-gray-300 font-sans">
                  Explore exclusive car collections and trade on Base.
                </p>
              </div>

              {/* Notification Banner - Positioned inside hero */}
              {showNotification && (
                <div className="absolute bottom-1 md:bottom-4 left-4 md:left-8 right-4 md:right-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-red-500 rounded-lg p-3 md:p-4 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-400 text-xs md:text-sm mb-1 font-sans">
                        08/27/2025
                      </div>
                      <div className="text-red-500 font-semibold mb-1 text-xs md:text-sm font-mono">
                        DRVN/VHCLS V0.1.1 is here!
                      </div>
                      <div className="text-gray-300 text-xs md:text-sm font-sans">
                        You&apos;re looking at a fresh build with improved
                        onboarding, Founder&apos;s Club Key minting, and easier
                        $BSTR trading. Plus, DRVN/VHCLS is now available as a
                        mini-app right inside Farcaster & the Base app. LFG
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotification(false)}
                      className="text-red-500 hover:text-red-300 shrink-0 border border-red-500 rounded-full size-5"
                    >
                      <X />
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
              />
            )}

            <TotalKeysMinted />

            {/* Marketplace Section */}
            <section className="space-y-4 md:space-y-6 font-mono">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-lg md:text-2xl font-bold font-mono">
                  Marketplace
                </h2>
                <ProgressiveActionButton
                  actionType="explore"
                  feature="marketplace"
                  onClick={() => setActivePage("marketplace")}
                  variant="link"
                  className="text-[#00daa2] hover:text-green-300 text-sm md:text-base font-mono"
                >
                  View all
                </ProgressiveActionButton>
              </div>

              {/* Desktop Marketplace */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 z-10 w-full px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/80 text-[#00daa2] w-10 h-10 rounded-full border border-[#00daa2] -ml-8"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/80 text-[#00daa2] w-10 h-10 rounded-full border border-[#00daa2] -mr-5"
                    >
                      <ChevronRight className="h-5 w-5" />
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
                        onCardClick={() => handleMarketplaceVehicleClick(item.id)}
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
                      className="bg-black/80 text-[#00daa2] w-10 h-10 rounded-full border border-[#00daa2] -ml-4"
                      onClick={prevCar}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/80 text-[#00daa2] w-10 h-10 rounded-full border border-[#00daa2] -mr-4"
                      onClick={nextCar}
                    >
                      <ChevronRight className="h-5 w-5" />
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
                      description={
                        marketplaceItems[currentCarIndex].description
                      }
                      moreInfo={marketplaceItems[currentCarIndex].moreInfo}
                      specs={marketplaceItems[currentCarIndex].specs}
                      detailedSpecs={
                        marketplaceItems[currentCarIndex].detailedSpecs
                      }
                      onCardClick={() => handleMarketplaceVehicleClick(marketplaceItems[currentCarIndex].id)}
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
          <div className="space-y-8">
            {/* Hero Header */}
            <HeroHeader
              title="DRVN Culture"
              subtitle="Your gateway to automotive culture, IRL and onchain"
              backgroundImage="/Cars/CultureHero1.jpg"
            />

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 md:gap-3">
              {[
                { id: "all", label: "All Content", icon: "🔥" },
                { id: "trending", label: "Trending", icon: "📈" },
                { id: "podcasts", label: "Podcasts", icon: "🎙️" },
                { id: "videos", label: "Videos", icon: "🎬" },
                { id: "motorsport", label: "Motorsport", icon: "🏎️" },
                { id: "jdm", label: "JDM", icon: "🇯🇵" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                    tab.id === "all"
                      ? "bg-[#00daa2] text-black font-bold"
                      : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-[#00daa2] hover:text-[#00daa2]"
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Featured Content - Main Carousel */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-xl md:text-2xl font-bold font-mono flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#00daa2]" />
                  Featured Content
                </h2>
                <span className="text-gray-400 text-sm font-mono">Updated daily</span>
              </div>
              
              <TopStoriesSection onNavigate={setActivePage} />
            </section>

            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-bold text-[#00daa2] font-mono">24</div>
                  <div className="text-xs text-gray-400 font-mono uppercase">Episodes</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-bold text-white font-mono">156K</div>
                  <div className="text-xs text-gray-400 font-mono uppercase">Total Views</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-bold text-white font-mono">12</div>
                  <div className="text-xs text-gray-400 font-mono uppercase">Creators</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-bold text-purple-400 font-mono">3</div>
                  <div className="text-xs text-gray-400 font-mono uppercase">Premium Series</div>
                </div>
              </div>
            </div>

            {/* Latest Episodes Section */}
            <section className="space-y-4">
              <h2 className="text-white text-xl md:text-2xl font-bold font-mono flex items-center gap-2">
                <Play className="h-5 w-5 text-[#00daa2]" />
                Latest Episodes
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "MONEY SHIFT PODCAST / EP.11 - The Collector's Mindset",
                    host: "DRVN VHCLS",
                    duration: "45:22",
                    date: "Yesterday",
                    thumbnail: "/Articles/MSP10.jpg",
                    isNew: true,
                  },
                  {
                    title: "Building Your First JDM Collection",
                    host: "RHD Guys",
                    duration: "32:15",
                    date: "3 days ago",
                    thumbnail: "/Articles/rhd-guys-wagons.jpg",
                    isNew: false,
                  },
                  {
                    title: "F1 2025: What to Expect from the New Regulations",
                    host: "Motorsport Weekly",
                    duration: "28:45",
                    date: "1 week ago",
                    thumbnail: "/Articles/f1-cover-1.jpg",
                    isNew: false,
                  },
                  {
                    title: "Onchain Ownership: The Future of Car Collecting",
                    host: "DRVN VHCLS",
                    duration: "38:10",
                    date: "1 week ago",
                    thumbnail: "/Cars/CultureHero1.jpg",
                    isNew: false,
                  },
                ].map((episode, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden hover:border-[#00daa2] transition-all cursor-pointer group"
                  >
                    <div className="flex">
                      <div className="relative w-32 h-24 md:w-40 md:h-28 flex-shrink-0">
                        <Image
                          src={episode.thumbnail}
                          alt={episode.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="bg-black/80 p-2 rounded-full">
                            <Play className="h-4 w-4 text-white fill-white" />
                          </div>
                        </div>
                        {episode.isNew && (
                          <div className="absolute top-2 left-2 bg-[#00daa2] text-black text-xs px-2 py-0.5 rounded font-bold">
                            NEW
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col justify-between flex-1">
                        <div>
                          <h4 className="text-white font-mono text-sm font-bold line-clamp-2 group-hover:text-[#00daa2] transition-colors">
                            {episode.title}
                          </h4>
                          <p className="text-gray-400 text-xs mt-1">{episode.host}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {episode.duration}
                          </span>
                          <span>{episode.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Content Categories Grid */}
            <section className="space-y-4">
              <h2 className="text-white text-xl md:text-2xl font-bold font-mono">
                Browse by Category
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Podcasts", count: 24, icon: "🎙️", color: "from-purple-500/20 to-purple-900/20" },
                  { name: "Videos", count: 48, icon: "🎬", color: "from-blue-500/20 to-blue-900/20" },
                  { name: "Motorsport", count: 16, icon: "🏎️", color: "from-red-500/20 to-red-900/20" },
                  { name: "JDM Culture", count: 32, icon: "🇯🇵", color: "from-[#00daa2]/20 to-green-900/20" },
                  { name: "Euro Scene", count: 28, icon: "🇩🇪", color: "from-yellow-500/20 to-yellow-900/20" },
                  { name: "American Muscle", count: 20, icon: "🇺🇸", color: "from-pink-500/20 to-pink-900/20" },
                  { name: "Onchain", count: 12, icon: "⛓️", color: "from-cyan-500/20 to-cyan-900/20" },
                  { name: "IRL Events", count: 8, icon: "📍", color: "from-orange-500/20 to-orange-900/20" },
                ].map((category, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${category.color} rounded-xl p-4 border border-gray-700 hover:border-[#00daa2] transition-all cursor-pointer group`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h4 className="text-white font-mono font-bold text-sm group-hover:text-[#00daa2]">
                      {category.name}
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">{category.count} items</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Coming Soon / Subscribe Section */}
            <section className="bg-gradient-to-r from-[#00daa2]/10 via-gray-900 to-purple-500/10 rounded-2xl p-6 md:p-8 border border-[#00daa2]/30">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-[#00daa2]/20 px-3 py-1 rounded-full text-[#00daa2] text-sm font-mono mb-3">
                    <Sparkles className="h-4 w-4" />
                    Coming Soon
                  </div>
                  <h3 className="text-white text-xl md:text-2xl font-bold font-mono mb-2">
                    DRVN Originals
                  </h3>
                  <p className="text-gray-400 text-sm font-mono mb-4">
                    Exclusive original content from the DRVN VHCLS team. Documentaries, 
                    behind-the-scenes, and deep dives into automotive culture.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Button className="bg-[#00daa2] text-black font-mono font-bold hover:bg-[#00c891]">
                      <Bell className="h-4 w-4 mr-2" />
                      Get Notified
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-300 font-mono hover:border-[#00daa2] hover:text-[#00daa2]">
                      Learn More
                    </Button>
                  </div>
                </div>
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-[#00daa2] to-purple-500 flex items-center justify-center">
                  <div className="text-6xl">🎬</div>
                </div>
              </div>
            </section>

            {/* Creators Spotlight */}
            <section className="space-y-4">
              <h2 className="text-white text-xl md:text-2xl font-bold font-mono flex items-center gap-2">
                <Users className="h-5 w-5 text-[#00daa2]" />
                Featured Creators
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Money Shift Pod", handle: "@moneyshiftpod", avatar: "https://i.pravatar.cc/150?img=1", followers: "12.4K" },
                  { name: "RHD Guys", handle: "@rhdguys", avatar: "https://i.pravatar.cc/150?img=2", followers: "8.2K" },
                  { name: "DRVN VHCLS", handle: "@drvnvhcls", avatar: "https://i.pravatar.cc/150?img=3", followers: "24.1K" },
                  { name: "Track Day Tales", handle: "@trackdaytales", avatar: "https://i.pravatar.cc/150?img=4", followers: "6.8K" },
                ].map((creator, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 rounded-xl p-4 border border-gray-700 hover:border-[#00daa2] transition-all cursor-pointer text-center group"
                  >
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src={creator.avatar}
                        alt={creator.name}
                        fill
                        className="rounded-full object-cover border-2 border-gray-700 group-hover:border-[#00daa2] transition-colors"
                      />
                    </div>
                    <h4 className="text-white font-mono font-bold text-sm group-hover:text-[#00daa2]">
                      {creator.name}
                    </h4>
                    <p className="text-gray-500 text-xs">{creator.handle}</p>
                    <p className="text-[#00daa2] text-xs mt-1 font-mono">{creator.followers} followers</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case "marketplace":
        return (
          <div className="space-y-6">
            <HeroHeader
              title="Marketplace"
              subtitle="Discover and trade exclusive automotive collections"
              backgroundImage="/Cars/SupraHero1.jpg"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="link"
                className="text-[#00daa2] hover:text-green-300 text-sm md:text-base font-mono"
                onClick={() =>
                  handleShare(
                    "Check out the DRVN VHCLS marketplace!",
                    window.location.href,
                  )
                }
              >
                Share
              </Button>
              <Button
                variant="link"
                className="text-[#00daa2] hover:text-green-300 text-sm md:text-base font-mono"
              >
                View all
              </Button>
            </div>

            {/* Desktop Marketplace */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 z-10 w-full px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/80 text-[#00daa2] w-10 h-10 rounded-full border border-[#00daa2] -ml-8"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/80 text-[#00daa2] w-10 h-10 rounded-full border border-[#00daa2] -mr-5"
                  >
                    <ChevronRight className="h-5 w-5" />
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
                      onCardClick={() => handleMarketplaceVehicleClick(item.id)}
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
                    className="bg-black/80 text-[#00daa2] w-10 h-10 rounded-full border border-[#00daa2] -ml-4"
                    onClick={prevCar}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/80 text-[#00daa2] w-10 h-10 rounded-full border border-[#00daa2] -mr-4"
                    onClick={nextCar}
                  >
                    <ChevronRight className="h-5 w-5" />
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
                    detailedSpecs={
                      marketplaceItems[currentCarIndex].detailedSpecs
                    }
                    onCardClick={() => handleMarketplaceVehicleClick(marketplaceItems[currentCarIndex].id)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "garage":
        return (
          <div className="space-y-6">
            <Garage
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
              onNavigate={setActivePage}
            />
          </div>
        );

      case "buster-club":
        return (
          <div className="space-y-6">
            <Buster
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
            />
          </div>
        );

      case "social":
        const platformInfo: Record<string, { name: string; icon: string; description: string; benefits: string[] }> = {
          farcaster: {
            name: "Farcaster",
            icon: "🟣",
            description: "Cast to the decentralized social network",
            benefits: ["Reach Farcaster community", "Earn channel rewards", "Build reputation"],
          },
          base: {
            name: "Base",
            icon: "🔵",
            description: "Native onchain social on Base",
            benefits: ["Onchain attestations", "Mini app integration", "Base ecosystem"],
          },
          x: {
            name: "X (Twitter)",
            icon: "✕",
            description: "Cross-post to your X audience",
            benefits: ["Wider reach", "Build following", "Drive traffic"],
          },
        };
        return (
          <div className="space-y-6">
            <HeroHeader
              title="Social Hub"
              subtitle="Share builds across Farcaster, Base & X from one place"
              backgroundImage="/Cars/GarageV12.jpg"
            />

            {/* Platform Connections */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#00daa2]/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#00daa2]" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Connected Platforms</h3>
                  <p className="text-xs text-zinc-400">Link your accounts to cross-post everywhere</p>
                </div>
              </div>
              <div className="grid gap-3">
                {platformConnections.map((conn) => {
                  const info = platformInfo[conn.platform];
                  return (
                    <div 
                      key={conn.platform}
                      className={`rounded-xl border p-4 transition-all ${
                        conn.connected 
                          ? "border-[#00daa2]/30 bg-[#00daa2]/5" 
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{info.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">{info.name}</span>
                              {conn.connected && (
                                <span className="flex items-center gap-1 text-xs text-[#00daa2] bg-[#00daa2]/20 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Connected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400">
                              {conn.connected ? conn.username : info.description}
                            </p>
                          </div>
                        </div>
                        {conn.connected ? (
                          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnectPlatform(conn.platform)}
                            className="bg-white/10 hover:bg-white/20 text-white border-0"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                      {!conn.connected && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {info.benefits.map((benefit, i) => (
                            <span key={i} className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Composer */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <button
                onClick={handleCreatePost}
                className="w-full flex items-center gap-4 text-left hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-[#00daa2]/10 text-[#00daa2] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Create a Post</p>
                  <p className="text-sm text-zinc-400">Tag vehicles, mention sponsors, share everywhere</p>
                </div>
                <Zap className="w-5 h-5 text-[#00daa2]" />
              </button>
              {platformConnections.filter(p => p.connected).length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-zinc-500 mb-2">Cross-post to:</p>
                  <div className="flex flex-wrap gap-2">
                    {platformConnections.filter(p => p.connected).map((platform) => (
                      <button
                        key={platform.platform}
                        onClick={() => setCrossPostSettings(prev => ({ ...prev, [platform.platform]: !prev[platform.platform] }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          crossPostSettings[platform.platform]
                            ? "bg-[#00daa2]/20 text-[#00daa2] border border-[#00daa2]/40"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <span>{platformInfo[platform.platform]?.icon}</span>
                        <span className="capitalize">{platform.platform}</span>
                        {crossPostSettings[platform.platform] && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4 text-center">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{connectedPlatformsCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Platforms</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-4 text-center">
                <Zap className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{feedPosts.length}</p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Posts</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#00daa2]/10 to-[#00daa2]/5 border border-[#00daa2]/20 p-4 text-center">
                <Shield className="w-5 h-5 text-[#00daa2] mx-auto mb-2" />
                <p className="text-xl font-bold text-white">100%</p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">On-chain</p>
              </div>
            </div>

            {/* Sponsor Spotlight */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-black via-[#0b0b0b] to-[#050505] p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Image
                  src="https://avatars.githubusercontent.com/u/108554348?s=200&v=4"
                  alt="Sponsor"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Sponsor Spotlight</p>
                <p className="text-white font-semibold truncate">Red Bull Racing × Black Widow</p>
                <p className="text-sm text-zinc-400 truncate">Slot #03 minted. Claim perks and upload content.</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2">
                  <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Titanium</span>
                  <span className="flex items-center gap-1"><Car className="w-3 h-3" /> GT3 RS</span>
                </div>
              </div>
            </div>

            {/* Content Feed */}
            <ContentFeed posts={feedPosts} showAllFilters={true} />

            {/* Create Post Modal */}
            <CreatePostModal
              isOpen={showCreatePostModal}
              onClose={() => setShowCreatePostModal(false)}
              userId={mockSocialUser.id}
              registeredVehicles={mockRegisteredVehicles}
              currentUser={{
                name: mockSocialUser.name,
                username: mockSocialUser.username,
                avatar: mockSocialUser.avatar,
              }}
              sponsors={availableSponsors}
              onPostCreated={handlePostCreated}
              connectedPlatforms={platformConnections.filter(p => p.connected).map(p => p.platform)}
              initialCrossPostSettings={crossPostSettings}
            />
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <HeroHeader
              title="Settings"
              subtitle="Customize your DRVN VHCLS experience"
              backgroundImage="/Cars/shop-hero-1.jpg"
            />
            <Settings
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white font-mono">
              Page Not Found
            </h1>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 grid-background overflow-x-hidden mobile-optimized">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div
          className={`relative bg-gray-950 border-r border-[#8351a1] transition-all duration-300 hidden md:block ${sidebarCollapsed ? "w-16" : "w-64"
            }`}
        >
          {/* Collapse Arrow */}
          <button
            onClick={toggleSidebar}
            className="sidebar-collapse-arrow"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ChevronLeft
              className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Sidebar Content */}
          <TooltipProvider>
            <div className={`${sidebarCollapsed ? "p-2" : "p-6"}`}>
              {/* Logo Section */}
              <div
                className={`transition-all duration-300 ${sidebarCollapsed ? "flex justify-center mt-20" : "mb-6"
                  }`}
              >
                {sidebarCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Image
                          src="/Cars/DRVNWHITE.png"
                          alt="DRVN VHCLS"
                          width={120}
                          height={60}
                          className="transition-all duration-300 w-auto h-auto"
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
                ) : (
                  <Image
                    src="/Cars/DRVNWHITE.png"
                    alt="DRVN VHCLS"
                    width={120}
                    height={60}
                    className="transition-all duration-300 w-auto h-auto"
                  />
                )}
              </div>

              {/* Sign Up/Login Button or User Profile */}
              <div
                className={`mb-6 transition-all duration-300 ${sidebarCollapsed ? "flex justify-center mt-6" : ""
                  }`}
              >
                {address && isAuthenticated && currentUser ? (
                  // User Profile - Show when signed in and authenticated
                  sidebarCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#00daa2]">
                            <Image
                              src={
                                currentUser?.profileImage ||
                                "/Cars/UserImage.png"
                              }
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
                        @{currentUser?.username || "username"}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="p-4 rounded-lg bg-gray-950 border border-gray-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00daa2] flex-shrink-0">
                          <Image
                            src={
                              currentUser?.profileImage || "/Cars/UserImage.png"
                            }
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-mono font-semibold text-sm truncate">
                            @{currentUser?.username || "username"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-[#00daa2] rounded-full"></div>
                            <span className="text-[#00daa2] text-xs font-mono">
                              Connected
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-700">
                        <ConnectButton />
                      </div>
                    </div>
                  )
                ) : // Sign Up/Login Button - Show when not signed in or not authenticated
                  sidebarCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-[#00daa2] text-[#00daa2] hover:bg-[#00daa2] hover:text-black bg-transparent"
                          onClick={handleAuthClick}
                          title="Sign Up/Login"
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
                    <Button
                      variant="outline"
                      className="border-[#00daa2] text-white hover:bg-[#00daa2] hover:text-black bg-transparent w-full font-mono font-semibold"
                      onClick={handleAuthClick}
                    >
                      SIGN UP/LOGIN
                    </Button>
                  )}
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                {/* Main Navigation Items (Green) */}
                {navigationItems
                  .filter((item) => {
                    // Always show navigation items, but handle access in click handlers
                    return item.isGreen;
                  })
                  .map((item) =>
                    sidebarCollapsed ? (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-mono font-semibold justify-center ${activePage === item.id
                              ? "text-[#00daa2] bg-gray-800"
                              : "text-[#00daa2] hover:bg-gray-800"
                              }`}
                            onClick={() => setActivePage(item.id)}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-black border-gray-700 text-[#00daa2] font-mono"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-mono font-semibold w-full text-left justify-start ${activePage === item.id
                          ? "text-[#00daa2] bg-gray-800"
                          : "text-[#00daa2] hover:bg-gray-800"
                          }`}
                        onClick={() => setActivePage(item.id)}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="ml-0">{item.label}</span>
                      </Button>
                    ),
                  )}

                {/* Separator */}
                {!sidebarCollapsed && (
                  <div className="border-t border-gray-700 my-2"></div>
                )}

                {/* Social Navigation Items (White) */}
                {navigationItems
                  .filter((item) => !item.isGreen)
                  .map((item) =>
                    sidebarCollapsed ? (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-mono font-semibold justify-center text-gray-300 hover:text-[#00daa2] hover:bg-gray-800"
                            onClick={() => setActivePage(item.id)}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-black border-gray-700 text-[#00daa2] font-mono"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className="flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-mono font-semibold w-full text-left justify-start text-gray-300 hover:text-[#00daa2] hover:bg-gray-800"
                        onClick={() => {
                          if (item.externalUrl) {
                            handleExternalLink(item.externalUrl);
                          } else {
                            setActivePage(item.id);
                          }
                        }}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="ml-0">{item.label}</span>
                      </Button>
                    ),
                  )}
              </div>
            </div>
          </TooltipProvider>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          data-mobile-sidebar
          className={`fixed inset-y-0 left-0 z-[50] w-64 bg-gray-950 border-r border-[#8351a1] transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Mobile Sidebar Content */}
          <div className="p-6">
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 rounded-md border border-gray-700"
                onClick={toggleMobileMenu}
                title="Close Menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Logo Section */}
            <div className="mb-6">
              <Image
                src="/Cars/DRVNWHITE.png"
                alt="DRVN VHCLS"
                width={120}
                height={60}
                className="transition-all duration-300 w-auto h-auto"
              />
            </div>

            {/* Sign Up/Login Button or User Profile */}
            <div className="mb-6">
              {address && isAuthenticated && currentUser ? (
                // User Profile - Show when signed in and authenticated
                <div className="pt-3 border-t border-gray-700">
                  <ConnectButton />
                </div>
              ) : (
                // Sign Up/Login Button - Show when not signed in or not authenticated
                <Button
                  variant="outline"
                  className="border-[#00daa2] text-white hover:bg-[#00daa2] hover:text-black bg-transparent w-full font-mono font-semibold"
                  onClick={handleAuthClick}
                >
                  SIGN UP/LOGIN
                </Button>
              )}
            </div>

            {/* Navigation Items */}
            <div className="space-y-2">
              {/* Main Navigation Items (Green) */}
              {navigationItems
                .filter(
                  (item) => item.isGreen, // Always show, handle access in click
                )
                .map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-mono font-semibold w-full text-left justify-start ${activePage === item.id
                      ? "text-[#00daa2] bg-gray-800"
                      : "text-[#00daa2] hover:bg-gray-800"
                      }`}
                    onClick={() => {
                      if (item.externalUrl) {
                        handleExternalLink(item.externalUrl);
                      } else {
                        setActivePage(item.id);
                      }
                      toggleMobileMenu();
                    }}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-0">{item.label}</span>
                  </Button>
                ))}

              {/* Separator */}
              <div className="border-t border-gray-700 my-2"></div>

              {/* Social Navigation Items (White) */}
              {navigationItems
                .filter((item) => !item.isGreen)
                .map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-mono font-semibold w-full text-left justify-start text-gray-300 hover:text-[#00daa2] hover:bg-gray-800"
                    onClick={() => {
                      if (item.externalUrl) {
                        handleExternalLink(item.externalUrl);
                      } else {
                        setActivePage(item.id);
                      }
                      toggleMobileMenu();
                    }}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-0">{item.label}</span>
                  </Button>
                ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-5 border-b border-[#8351a1] bg-gray-950">
            <div className="flex items-center gap-4">
              {/* Mobile Logo */}
              <div className="md:hidden">
                <Image
                  src="/Cars/DRVNWHITE.png"
                  alt="DRVN VHCLS"
                  width={60}
                  height={40}
                  className="transition-all duration-300 w-auto h-auto"
                />
              </div>
            </div>

            <div className="flex bg-none items-center gap-2 md:gap-4 px-2 py-1 rounded-md">
              <div className="hidden md:flex text-[#8351a1] text-xs md:text-sm font-mono">
                XP / coming soon
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white border border-[#8351a1] md:hidden"
                onClick={toggleMobileMenu}
              >
                <Menu className="h-5 w-7" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-4 md:p-6 space-y-6 md:space-y-8 flex-1 overflow-y-auto mobile-scroll">
            {renderPageContent()}
          </main>
        </div>
      </div>

      {/* Modals */}
      {/* Auto Signup Modal - Shows when wallet connects but user doesn't exist */}
      <AutoSignupModal
        isOpen={shouldShowSignup && showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleSignupSuccess}
      />

      {/* Manual Auth Choice Modal - Shows when user manually clicks auth */}
      <AuthChoiceModal
        isOpen={showAuthModal && !shouldShowSignup}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleSigninSuccess}
      />

      {/* Marketplace Detail Modal - Buyer-focused with specs */}
      <MarketplaceDetailModal
        isOpen={showMarketplaceModal}
        onClose={() => {
          setShowMarketplaceModal(false);
          setSelectedMarketplaceItem(null);
        }}
        item={selectedMarketplaceItem}
      />
    </div>
  );
}
