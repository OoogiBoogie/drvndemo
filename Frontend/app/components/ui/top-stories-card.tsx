"use client";

import Image from "next/image";
import { Play, Clock, TrendingUp, Eye, Calendar, Star } from "lucide-react";

interface TopStoriesCardProps {
  title: string;
  description: string;
  image: string;
  tags: Array<{
    label: string;
    type: "irl" | "podcast" | "video" | "motorsport" | "f1";
  }>;
}

export function TopStoriesCard({ title, description, image, tags }: TopStoriesCardProps) {
  const getTagColor = (type: string) => {
    switch (type) {
      case "irl":
        return "bg-green-400/10 text-green-400 ring-green-400/20";
      case "motorsport":
        return "bg-green-400/10 text-green-400 ring-green-400/20";
      case "f1":
        return "bg-purple-400/10 text-purple-400 ring-purple-400/20";
      case "podcast":
        return "bg-purple-400/10 text-purple-400 ring-purple-400/20";
      case "video":
        return "bg-purple-400/10 text-purple-400 ring-purple-400/20";
      default:
        return "bg-gray-400/10 text-gray-400 ring-gray-400/20";
    }
  };

  return (
    <div className="relative bg-gray-950 rounded-lg overflow-hidden border border-white/10 shadow outline -outline-offset-1 outline-black/5 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10 group cursor-pointer transition-all duration-200 hover:border-[#00daa2]/50 hover:shadow-lg hover:shadow-[#00daa2]/10 min-w-[280px] sm:min-w-[300px] max-w-[320px]">
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 bg-gray-800 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full border border-white/20 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Play className="h-6 w-6 text-gray-900 fill-gray-900 ml-1" />
          </div>
        </div>

        {/* Video Duration Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-gray-900/90 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-white/20 ring-1 ring-inset ring-white/10">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-white" />
              <span className="text-white text-xs font-semibold">12:34</span>
            </div>
          </div>
        </div>

        {/* Trending Badge */}
        <div className="absolute top-3 left-3">
          <div className="bg-[#00daa2]/90 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-[#00daa2]/50 ring-2 ring-inset ring-[#00daa2]/30 shadow-lg">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-black" />
              <span className="text-black text-xs font-bold">TRENDING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-lg/7 font-semibold text-white font-mono line-clamp-2">{title}</h3>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm/6 text-gray-400 font-sans line-clamp-3">{description}</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium">2.4K views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">2 days ago</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-[#00daa2]" />
            <span className="text-[#00daa2] font-semibold">Premium</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getTagColor(tag.type)}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
