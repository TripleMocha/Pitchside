import { Activity, CircleDot, Disc, Dribbble, Flag, Swords, Target, Trophy, Zap, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  soccer: CircleDot, basketball: Dribbble, hockey: Disc, combat: Swords, baseball: Target,
  football: Trophy, racing: Flag, tennis: Activity, cricket: Zap,
};
export default function SportIcon({ category, className }: { category: string; className?: string }) {
  const Icon = ICONS[category] ?? Trophy;
  return <Icon className={className} aria-hidden />;
}
