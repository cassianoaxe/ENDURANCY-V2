import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, XCircle } from "lucide-react";

// Tipo para o status de cada etapa
export type TimelineItemStatus = "completed" | "current" | "pending" | "error";

// Propriedades de um item da timeline
export interface TimelineItemProps {
  status: TimelineItemStatus;
  title: string;
  description?: string;
  date?: string;
  isLast?: boolean;
  children?: React.ReactNode;
}

// Componente para cada item da timeline
export const TimelineItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TimelineItemProps
>(
  (
    { status, title, description, date, isLast = false, children, className, ...props },
    ref
  ) => {
    // Configurações do status
    const statusConfig = {
      completed: {
        icon: <Check className="h-4 w-4" />,
        circleClass: "bg-green-500",
        lineClass: "bg-green-500",
        titleClass: "text-green-500",
      },
      current: {
        icon: <Clock className="h-4 w-4 animate-pulse" />,
        circleClass: "bg-blue-500",
        lineClass: "bg-gray-200",
        titleClass: "text-blue-500 font-medium",
      },
      pending: {
        icon: null,
        circleClass: "bg-gray-200",
        lineClass: "bg-gray-200",
        titleClass: "text-gray-500",
      },
      error: {
        icon: <XCircle className="h-4 w-4" />,
        circleClass: "bg-red-500",
        lineClass: "bg-gray-200",
        titleClass: "text-red-500",
      },
    };

    const { circleClass, icon, lineClass, titleClass } = statusConfig[status];

    return (
      <div
        ref={ref}
        className={cn("flex relative", className)}
        {...props}
      >
        {/* Círculo indicador */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "rounded-full w-8 h-8 flex items-center justify-center text-white",
              circleClass
            )}
          >
            {icon}
          </div>
          {/* Linha conectora (exceto no último item) */}
          {!isLast && (
            <div
              className={cn(
                "w-1 flex-grow mt-1 mb-1",
                lineClass
              )}
              style={{ height: "calc(100% - 2rem)" }}
            />
          )}
        </div>

        {/* Conteúdo */}
        <div className="ml-4 pb-6 flex-grow">
          <div className="flex items-start justify-between">
            <h3 className={cn("text-sm font-medium mt-1.5", titleClass)}>
              {title}
            </h3>
            {date && (
              <time className="text-xs text-gray-500 mt-2">{date}</time>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
          {children && <div className="mt-2">{children}</div>}
        </div>
      </div>
    );
  }
);

TimelineItem.displayName = "TimelineItem";

// Componente da Timeline principal
export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Timeline = React.forwardRef<
  HTMLDivElement,
  TimelineProps
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative space-y-0", className)}
      {...props}
    >
      {children}
    </div>
  );
});

Timeline.displayName = "Timeline";