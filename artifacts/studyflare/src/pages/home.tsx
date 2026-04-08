import { useState } from "react";
import { useLocation } from "wouter";
import { useBroadcastAvailability } from "@workspace/api-client-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { SlidersHorizontal, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [, setLocation] = useLocation();
  const [filterSize, setFilterSize] = useState("2–5 Members");
  
  const broadcastMutation = useBroadcastAvailability();

  const handleTapToStudy = () => {
    broadcastMutation.mutate({
      data: {
        subject: "General", // in a real app, maybe picked from last studied
        latitude: 50.0,
        longitude: 8.0,
        groupSize: "two_to_five",
        durationMinutes: 60
      }
    }, {
      onSuccess: () => {
        setLocation("/matching");
      }
    });
  };

  return (
    <MobileLayout>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-6 z-10">
          <Button variant="ghost" size="icon" className="rounded-full bg-card/50 border border-white/5">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full bg-card/50 border border-white/5 font-medium">
                Sort by: {filterSize} <ChevronDown className="ml-2 w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-white/10">
              <DropdownMenuItem onClick={() => setFilterSize("1:1 Only")}>1:1 Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterSize("2–5 Members")}>2–5 Members</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterSize("5–10 Members")}>5–10 Members</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Ambient background styling */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 mt-[-40px]">
          <div className="flex items-center gap-2 mb-8 text-primary font-medium px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">University Library</span>
          </div>

          <div className="relative">
            {/* The Pulse Rings */}
            <div className="absolute inset-0 rounded-full animate-pulse-glow" />
            
            {/* The Button */}
            <button 
              onClick={handleTapToStudy}
              disabled={broadcastMutation.isPending}
              className="relative w-64 h-64 rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_50px_hsl(var(--primary)/0.5)] flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-80"
            >
              <div className="absolute inset-2 rounded-full border border-white/20 bg-black/10 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                <span className="text-3xl font-extrabold text-white tracking-widest drop-shadow-md">TAP TO</span>
                <span className="text-3xl font-extrabold text-white tracking-widest drop-shadow-md">STUDY</span>
              </div>
            </button>
          </div>

          <p className="mt-12 text-muted-foreground text-center max-w-[260px]">
            Match instantly with students having similar interests nearby.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
