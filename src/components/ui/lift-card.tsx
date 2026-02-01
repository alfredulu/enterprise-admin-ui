import type { ReactNode } from "react";

type LiftCardProps = {
  children: ReactNode;
  className?: string;
};

export function LiftCard({ children, className = "" }: LiftCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-border bg-background",
        "shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-px hover:shadow-[0_14px_35px_rgba(0,0,0,0.10)] hover:ring-1 hover:ring-border/40",
        "dark:shadow-none dark:hover:translate-y-0 dark:hover:ring-1 dark:hover:ring-white/15 dark:hover:bg-muted/20",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
