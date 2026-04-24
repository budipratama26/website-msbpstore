"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
}

export function FloatingInput({ label, icon, className, value, type, placeholder, ...props }: FloatingInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isFloating = isFocused || (value && value.toString().length > 0);
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="relative w-full group">
            <div className={cn(
                "relative bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden",
                isFocused ? "border-emerald-500 bg-white ring-4 ring-emerald-500/5 shadow-sm" : "hover:border-gray-300 hover:bg-white",
                className
            )}>
                {/* Icon */}
                {icon && (
                    <div className={cn(
                        "absolute left-4 sm:left-6 z-20",
                        isFloating ? "top-3 sm:top-4 scale-90" : "top-1/2 -translate-y-1/2 scale-100",
                        isFocused ? "text-emerald-600" : "text-gray-400"
                    )}>
                        <div className="scale-90 sm:scale-100">{icon}</div>
                    </div>
                )}

                {/* Floating Label */}
                <label className={cn(
                    "absolute pointer-events-none z-10",
                    icon ? (isFloating ? "left-12 sm:left-14" : "left-12 sm:left-16") : (isFloating ? "left-4 sm:left-5" : "left-4 sm:left-6"),
                    isFloating
                        ? "top-2.5 sm:top-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600"
                        : "top-1/2 -translate-y-1/2 text-[11px] sm:text-[13px] font-semibold uppercase tracking-widest text-gray-400 opacity-80",
                    !isFocused && isFloating && "text-gray-500"
                )}>
                    {label}
                </label>

                {/* Input */}
                <input
                    {...props}
                    type={currentType}
                    value={value}
                    placeholder={isFocused ? (placeholder || "") : ""}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={cn(
                        "w-full bg-transparent px-4 sm:px-6 focus:outline-none text-gray-900 text-sm sm:text-base font-bold relative z-0",
                        "placeholder:text-gray-300 placeholder:font-medium placeholder:text-xs",
                        icon ? "pl-12 sm:pl-16" : "pl-4 sm:pl-6",
                        isPassword ? "pr-12 sm:pr-14" : "pr-4 sm:pr-6",
                        isFloating ? "pb-3 pt-7 sm:pb-4 sm:pt-9" : "py-4 sm:py-6"
                    )}
                />

                {/* Password Toggle */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                            "absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl active:bg-gray-100 z-20",
                            showPassword ? "text-emerald-600" : "text-gray-400 hover:text-gray-600",
                            !(value && value.toString().length > 0) && "opacity-0 pointer-events-none"
                        )}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                )}
            </div>
        </div>
    );
}