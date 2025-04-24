import React from 'react';
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;
          
          return (
            <li 
              key={index}
              className={cn(
                "relative flex flex-col items-start pb-8 md:pb-0",
                index !== steps.length - 1 && "after:absolute after:left-0 after:top-7 after:h-0.5 after:w-full md:after:left-1/2 md:after:top-5 md:after:w-full",
                isCompleted ? "after:bg-blue-600" : "after:bg-gray-200 dark:after:bg-gray-700"
              )}
            >
              <div className="group relative flex flex-col items-start">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
                    isActive && "border-blue-600 bg-blue-50 text-blue-700",
                    isCompleted && "border-blue-600 bg-blue-600 text-white",
                    !isActive && !isCompleted && "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <div className="mt-2">
                  <span 
                    className={cn(
                      "text-sm font-medium",
                      isActive && "text-blue-700 dark:text-blue-400",
                      isCompleted && "text-blue-600 dark:text-blue-500",
                      !isActive && !isCompleted && "text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <p 
                      className={cn(
                        "text-xs",
                        isActive && "text-blue-700 dark:text-blue-400",
                        isCompleted && "text-blue-600 dark:text-blue-500",
                        !isActive && !isCompleted && "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}