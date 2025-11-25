"use client";

import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

interface SocialLinks {
    farcaster?: string;
    base?: string;
    x?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
}

interface SocialLinksEditorProps {
    socialLinks: SocialLinks;
    onChange: (platform: string, value: string) => void;
    disabled?: boolean;
}

const SOCIAL_PLATFORMS = [
    { id: "farcaster", label: "Farcaster", placeholder: "@username" },
    { id: "base", label: "Base Profile", placeholder: "base.org/username" },
    { id: "x", label: "X (Twitter)", placeholder: "@username" },
    { id: "instagram", label: "Instagram", placeholder: "@username" },
    { id: "facebook", label: "Facebook", placeholder: "facebook.com/username" },
    { id: "youtube", label: "YouTube", placeholder: "youtube.com/@username" },
    { id: "tiktok", label: "TikTok", placeholder: "@username" },
    { id: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/username" },
];

export function SocialLinksEditor({ socialLinks, onChange, disabled = false }: SocialLinksEditorProps) {
    return (
        <div>
            <Label className="text-white mb-3 block">Social Links</Label>
            <div className="space-y-3">
                {SOCIAL_PLATFORMS.map((platform) => (
                    <div key={platform.id}>
                        <Label 
                            htmlFor={platform.id} 
                            className="text-zinc-400 text-xs mb-1 block"
                        >
                            {platform.label}
                        </Label>
                        <Input
                            id={platform.id}
                            value={socialLinks[platform.id as keyof SocialLinks] || ""}
                            onChange={(e) => onChange(platform.id, e.target.value)}
                            placeholder={platform.placeholder}
                            className="bg-zinc-800 border-white/10 text-white"
                            disabled={disabled}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
