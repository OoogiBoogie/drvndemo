"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        ref={ref}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "peer h-5 w-5 shrink-0 rounded border border-white/30 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked && "bg-yellow-500 border-yellow-500",
          className
        )}
        data-state={checked ? "checked" : "unchecked"}
        {...props}
      >
        {checked && (
          <span className="flex items-center justify-center text-black">
            <Check className="h-4 w-4" />
          </span>
        )}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
