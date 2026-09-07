import type { LucideIcon } from "lucide-react";

// Match the old 14px control glyphs without platform-dependent text symbols.
export function ControlIcon({ icon: Icon, solid = false }: { icon: LucideIcon; solid?: boolean }) {
  return (
    <Icon
      className="control-icon"
      size={14}
      strokeWidth={2.5}
      fill={solid ? "currentColor" : "none"}
      aria-hidden="true"
      focusable="false"
    />
  );
}
