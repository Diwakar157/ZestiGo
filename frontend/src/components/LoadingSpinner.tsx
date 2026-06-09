import { Loader2 } from "lucide-react";
import { classNames } from "@/utils/format";

export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status">
      <Loader2 className={classNames("size-8 animate-spin text-primary", className)} />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
