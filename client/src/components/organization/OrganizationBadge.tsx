import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PlanTier = "free" | "seed" | "grow" | "pro";

interface OrganizationBadgeProps {
  name: string;
  tier: PlanTier | null;
  compact?: boolean;
  className?: string;
}

// Mapeamento de cores por tier
const tierColors: Record<PlanTier, { bg: string; text: string }> = {
  free: { bg: "bg-gray-100", text: "text-gray-600" },
  seed: { bg: "bg-green-100", text: "text-green-700" },
  grow: { bg: "bg-blue-100", text: "text-blue-700" },
  pro: { bg: "bg-purple-100", text: "text-purple-700" }
};

export function OrganizationBadge({ 
  name, 
  tier = "free", 
  compact = false,
  className 
}: OrganizationBadgeProps) {
  // Obter cores baseadas no tier
  const colors = tier ? tierColors[tier] : tierColors.free;
  
  // Se não tivermos o nome, usar a primeira letra
  const initials = name ? name.charAt(0).toUpperCase() : "O";
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-md",
        colors.bg,
        colors.text,
        compact ? "w-8 h-8" : "w-10 h-10",
        className
      )}
    >
      {initials}
    </div>
  );
}