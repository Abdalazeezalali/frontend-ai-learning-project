import * as React from "react";
import { cn } from "../../lib/utils";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-600/20 text-indigo-400",
        secondary: "border-transparent bg-slate-700 text-slate-300",
        destructive: "border-transparent bg-red-600/20 text-red-400",
        success: "border-transparent bg-emerald-600/20 text-emerald-400",
        warning: "border-transparent bg-amber-600/20 text-amber-400",
        outline: "border-slate-600 text-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
