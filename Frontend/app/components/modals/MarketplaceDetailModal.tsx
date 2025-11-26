"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Scale,
  Share2,
  Hash,
  Gauge,
  Car,
  Zap,
  Settings,
  Palette,
  FileText,
  History,
  ShoppingCart,
  Info,
  Wrench
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface DetailedSpec {
  icon: string;
  label: string;
  value: string;
}

interface MarketplaceItem {
  id: number;
  year: string;
  brand: string;
  model: string;
  collection: string;
  mv: string;
  av: string;
  status: "Coming Soon" | "Demo";
  price: string;
  image: string;
  description: string;
  moreInfo: string;
  specs: {
    engine: string;
    power: string;
    topSpeed: string;
    acceleration: string;
  };
  detailedSpecs: DetailedSpec[];
}

interface MarketplaceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MarketplaceItem | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Hash,
  Gauge,
  Car,
  Zap,
  Settings,
  Palette,
};

function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[$,]/g, '')) || 0;
}

function calculateSpread(av: string, mv: string): { spread: number; spreadPercent: number } {
  const avNum = parsePrice(av);
  const mvNum = parsePrice(mv);
  const spread = mvNum - avNum;
  const spreadPercent = avNum > 0 ? (spread / avNum) * 100 : 0;
  return { spread, spreadPercent };
}

export function MarketplaceDetailModal({ isOpen, onClose, item }: MarketplaceDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'history' | 'upgrades'>('specs');

  if (!item) return null;

  const images = [item.image];
  const { spread, spreadPercent } = calculateSpread(item.av, item.mv);
  const isUndervalued = spread < 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4 text-primary/70" /> : <Info className="w-4 h-4 text-primary/70" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50"
        aria-describedby="marketplace-detail-description"
        hideCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>
            {item.year} {item.brand} {item.model} - Marketplace Details
          </DialogTitle>
          <DialogDescription id="marketplace-detail-description">
            View detailed specifications, history, and valuation for {item.year} {item.brand} {item.model}
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Header - Glassmorphic */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-mono">
              {item.year} {item.model}
            </h2>
            <Badge className={cn(
              "border text-xs",
              item.status === "Coming Soon" 
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
                : "bg-primary/20 text-primary border-primary/30"
            )}>
              {item.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(90vh-65px)] p-4 md:p-6 sleek-scrollbar">
          {/* Image Gallery */}
          <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-black/40 mb-6 group border border-white/10 shadow-xl">
            <Image
              src={images[currentImageIndex]}
              alt={`${item.brand} ${item.model}`}
              fill
              className="object-cover"
              priority
            />
            
            {/* Collection Badge */}
            <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {item.collection}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white/90 font-mono border border-white/10">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Vehicle Info & Specs */}
            <div className="space-y-6">
              {/* Vehicle Identity Card */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl overflow-hidden">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start gap-5">
                    {/* Vehicle Thumbnail */}
                    <div className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                      <Image
                        src={item.image}
                        alt={item.model}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex-grow min-w-0 space-y-2">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{item.brand}</h3>
                        <p className="text-lg text-zinc-300">{item.model}</p>
                        <p className="text-sm text-zinc-500 mt-1">{item.year} • {item.collection}</p>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className="bg-white/5 text-white/70 border border-white/10 text-xs">
                          {item.specs.engine}
                        </Badge>
                        <Badge className="bg-white/5 text-white/70 border border-white/10 text-xs">
                          {item.specs.power}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Registry Price */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Registry ID</span>
                      <span className="text-lg font-bold text-primary font-mono">{item.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Valuation Card */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Valuation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AV / MV / Spread Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-xs text-zinc-500 mb-1">Appraised Value</p>
                      <p className="text-lg font-bold text-white font-mono">{item.av}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-xs text-zinc-500 mb-1">Market Value</p>
                      <p className="text-lg font-bold text-white font-mono">{item.mv}</p>
                    </div>
                    <div className={cn(
                      "rounded-xl p-3 text-center border",
                      isUndervalued 
                        ? "bg-emerald-500/10 border-emerald-500/20" 
                        : spread === 0 
                          ? "bg-white/5 border-white/5"
                          : "bg-red-500/10 border-red-500/20"
                    )}>
                      <p className="text-xs text-zinc-500 mb-1">Spread</p>
                      <div className="flex items-center justify-center gap-1">
                        {spread !== 0 && (
                          isUndervalued 
                            ? <TrendingDown className="w-4 h-4 text-emerald-400" />
                            : <TrendingUp className="w-4 h-4 text-red-400" />
                        )}
                        <p className={cn(
                          "text-lg font-bold font-mono",
                          isUndervalued ? "text-emerald-400" : spread === 0 ? "text-zinc-400" : "text-red-400"
                        )}>
                          {spreadPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Spread Explanation */}
                  <div className={cn(
                    "p-3 rounded-xl text-sm",
                    isUndervalued 
                      ? "bg-emerald-500/5 text-emerald-300/80 border border-emerald-500/10" 
                      : spread === 0 
                        ? "bg-white/5 text-zinc-400 border border-white/5"
                        : "bg-red-500/5 text-red-300/80 border border-red-500/10"
                  )}>
                    {isUndervalued 
                      ? "Below appraisal value - potential buying opportunity"
                      : spread === 0 
                        ? "Market value matches appraisal"
                        : "Above appraisal value - premium pricing"
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for Specs/History/Upgrades */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl">
                <div className="flex border-b border-white/5">
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={cn(
                      "flex-1 py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2",
                      activeTab === 'specs' 
                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                        : "text-zinc-500 hover:text-white"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    Specs
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                      "flex-1 py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2",
                      activeTab === 'history' 
                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                        : "text-zinc-500 hover:text-white"
                    )}
                  >
                    <History className="w-4 h-4" />
                    History
                  </button>
                  <button
                    onClick={() => setActiveTab('upgrades')}
                    className={cn(
                      "flex-1 py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2",
                      activeTab === 'upgrades' 
                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                        : "text-zinc-500 hover:text-white"
                    )}
                  >
                    <Wrench className="w-4 h-4" />
                    Upgrades
                  </button>
                </div>

                <CardContent className="p-4">
                  {activeTab === 'specs' && (
                    <div className="grid grid-cols-2 gap-3">
                      {item.detailedSpecs.map((spec, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                        >
                          {getIconComponent(spec.icon)}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-zinc-500">{spec.label}</p>
                            <p className="text-sm font-medium text-white truncate">{spec.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="text-sm font-medium text-white mb-2">Vehicle History</h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="text-sm font-medium text-white mb-2">Provenance & Documentation</h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {item.moreInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'upgrades' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <Wrench className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-medium text-white">Modifications & Upgrades</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-zinc-400">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                            Factory original specifications
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                            Full service history documented
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                            All original components intact
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Performance & Action */}
            <div className="space-y-6">
              {/* Performance Highlights */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-primary" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                      <p className="text-xs text-zinc-500 mb-1">Engine</p>
                      <p className="text-lg font-bold text-white">{item.specs.engine}</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                      <p className="text-xs text-zinc-500 mb-1">Power</p>
                      <p className="text-lg font-bold text-white">{item.specs.power}</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                      <p className="text-xs text-zinc-500 mb-1">Top Speed</p>
                      <p className="text-lg font-bold text-white">{item.specs.topSpeed}</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                      <p className="text-xs text-zinc-500 mb-1">0-100 km/h</p>
                      <p className="text-lg font-bold text-white">{item.specs.acceleration}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Facts */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Key Facts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.detailedSpecs.slice(0, 4).map((spec, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        {getIconComponent(spec.icon)}
                        <span className="text-sm text-zinc-400">{spec.label}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{spec.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Buy Action Card */}
              <Card className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg border-primary/30 rounded-2xl shadow-xl">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Market Value</p>
                      <p className="text-3xl font-bold text-white font-mono">{item.mv}</p>
                    </div>
                    
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-6 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40"
                      disabled={item.status === "Coming Soon"}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {item.status === "Coming Soon" ? "Coming Soon" : "Buy Shares"}
                    </Button>
                    
                    <p className="text-xs text-zinc-500">
                      {item.status === "Coming Soon" 
                        ? "This vehicle will be available for trading soon"
                        : "Purchase fractional ownership in this vehicle"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* About This Vehicle */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    About This Vehicle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
