import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="absolute inset-0 z-10 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading...
    </div>
  );
}
