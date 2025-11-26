"use client";

import { Plus } from "lucide-react";

interface CreatePostButtonProps {
    onClick: () => void;
}

export function CreatePostButton({ onClick }: CreatePostButtonProps) {
    return (
        <button
            className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 rounded-full bg-[#00daa2] hover:bg-[#00daa2]/80 text-black shadow-2xl z-[9999] flex items-center justify-center transition-all hover:scale-105"
            onClick={onClick}
            aria-label="Create Post"
        >
            <Plus className="w-8 h-8 stroke-[3]" />
        </button>
    );
}
