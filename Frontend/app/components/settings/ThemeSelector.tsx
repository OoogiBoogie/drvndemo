"use client";

import { useEffect } from "react";
import { Label } from "@/app/components/ui/label";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "auto" | "light" | "dark";

interface ThemeSelectorProps {
    value: Theme;
    onChange: (theme: Theme) => void;
    disabled?: boolean;
}

const THEME_OPTIONS = [
    { id: "auto" as const, label: "Auto", description: "Match system", icon: Monitor },
    { id: "light" as const, label: "Light", description: "Light mode", icon: Sun },
    { id: "dark" as const, label: "Dark", description: "Dark mode", icon: Moon },
];

export function ThemeSelector({ value, onChange, disabled = false }: ThemeSelectorProps) {
    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        
        if (value === "auto") {
            // Remove data-theme to respect prefers-color-scheme
            root.removeAttribute("data-theme");
        } else {
            // Set explicit theme
            root.setAttribute("data-theme", value);
        }
        
        // Save to localStorage for persistence across sessions
        localStorage.setItem("drvn-theme", value);
    }, [value]);

    return (
        <div>
            <Label className="text-white mb-3 block">Theme</Label>
            <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = value === option.id;
                    
                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onChange(option.id)}
                            disabled={disabled}
                            className={`
                                flex flex-col items-center justify-center p-4 rounded-lg border transition-all
                                ${isSelected
                                    ? "bg-[#00daa2]/10 border-[#00daa2] text-[#00daa2]"
                                    : "bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20"
                                }
                                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                            `}
                        >
                            <Icon className="w-6 h-6 mb-2" />
                            <span className="text-sm font-medium">{option.label}</span>
                            <span className="text-xs opacity-70">{option.description}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
