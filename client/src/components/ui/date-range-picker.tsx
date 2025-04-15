import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Importando o tipo Locale da biblioteca date-fns
import type { Locale } from 'date-fns';

interface DateRangePickerProps {
  className?: string;
  dateRange: DateRange | undefined;
  onDateRangeChange(dateRange: DateRange | undefined): void;
  align?: "start" | "center" | "end";
  locale?: Locale;
  showCompactText?: boolean;
}

export function DateRangePicker({
  className,
  dateRange,
  onDateRangeChange,
  align = "start",
  locale = ptBR,
  showCompactText = false
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const buttonText = React.useMemo(() => {
    if (!dateRange?.from) {
      return "Selecione um período";
    }

    if (!dateRange.to) {
      return format(dateRange.from, "dd/MM/yyyy", { locale });
    }

    if (showCompactText) {
      return `${format(dateRange.from, "dd/MM/yyyy", { locale })} - ${format(
        dateRange.to,
        "dd/MM/yyyy",
        { locale }
      )}`;
    }

    return `De ${format(dateRange.from, "dd/MM/yyyy", { locale })} até ${format(
      dateRange.to,
      "dd/MM/yyyy",
      { locale }
    )}`;
  }, [dateRange, locale, showCompactText]);

  // Predefined ranges for quick selection
  const predefinedRanges = React.useMemo(() => [
    {
      label: "Últimos 7 dias",
      dateRange: {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Últimos 30 dias",
      dateRange: {
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Este mês",
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Mês passado",
      dateRange: {
        from: new Date(
          new Date().getFullYear(),
          new Date().getMonth() - 1,
          1
        ),
        to: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          0
        ),
      } as DateRange,
    },
    {
      label: "Este ano",
      dateRange: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      } as DateRange,
    },
  ], []);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex flex-col space-y-2 p-2">
            {predefinedRanges.map((range) => (
              <Button
                key={range.label}
                variant="ghost"
                className="justify-start font-normal"
                onClick={() => {
                  onDateRangeChange(range.dateRange);
                  setIsOpen(false);
                }}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <hr className="my-2" />
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}