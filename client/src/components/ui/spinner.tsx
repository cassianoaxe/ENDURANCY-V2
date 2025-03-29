import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        default: "h-4 w-4",
        sm: "h-3 w-3",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
      },
      variant: {
        default: "text-primary",
        destructive: "text-destructive",
        muted: "text-muted-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ className, size, variant, ...props }: SpinnerProps) {
  return (
    <span
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label="Loading"
      {...props}
    ></span>
  );
}