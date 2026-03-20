import React from "react";
import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";

const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
    xl: "h-16 w-16",
};

export default function LoadingSpinner({ size = "md", className, text }) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <Loader2 className={cn("animate-spin text-indigo-500", sizes[size])} />
            {text && <p className="text-sm text-slate-400 animate-pulse">{text}</p>}
        </div>
    );
}
