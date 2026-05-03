import type { ComponentType } from "react";
import { Heart, Shield, Sword, Wind, type LucideProps } from "lucide-react";
import type { StatKey } from "../lib/hero-style";

const ICONS: Record<StatKey, ComponentType<LucideProps>> = {
  hp: Heart,
  attack: Sword,
  defense: Shield,
  speed: Wind,
};

export function StatIcon({
  stat,
  size = 14,
  className,
}: {
  stat: StatKey;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[stat];
  return <Icon size={size} className={className} aria-hidden />;
}
