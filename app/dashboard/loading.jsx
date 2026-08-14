import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-zinc-100" />
      <p className="text-xs font-medium tracking-wide">Loading workspace...</p>
    </div>
  );
}