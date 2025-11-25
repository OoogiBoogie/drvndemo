"use client";

import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";

interface CreatePostButtonProps {
    onClick: () => void;
}

export function CreatePostButton({ onClick }: CreatePostButtonProps) {
    return (
        <Button
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg z-50 flex items-center justify-center"
            onClick={onClick}
        >
            <Plus className="w-8 h-8" />
        </Button>
    );
}
