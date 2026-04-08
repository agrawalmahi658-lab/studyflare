import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useBroadcastAvailability } from "@workspace/api-client-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { SlidersHorizontal, ChevronDown, MapPin, Bluetooth, BluetoothOff, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [filterSize, setFilterSize] = useState("2–5 Members");
  const { toast } = useToast();

  const broadcastMutation = useBroadcastAvailability();

  const [locationWarning, setLocationWarning] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationWarning(true);
    } else {
      navigator.permissions
        ?.query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "denied") setLocationWarning(true);
        })
        .catch(() => {});
    }
  }, []);

  const checkPermissionsAndTap = async () => {
    let lat = 28.6139;
    let lng = 77.209;

    let locationBlocked = false;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      locationBlocked = true;
      toast({
        title: "Location is off",
        description: "Please enable location access to find study partners nearby. Using default location.",
        variant: "destructive",
      });
    }

    const bluetoothAvailable = "bluetooth" in navigator;
    if (!bluetoothAvailable) {
      toast({
        title: "Bluetooth unavailable",
        description: "Bluetooth is not available on this device. Matching via WiFi location only.",
      });
    }

    broadcastMutation.mutate(
      {
        data: {
          subject: "General",
          latitude: lat,
          longitude: lng,
          groupSize: filterSize === "5–10 Members" ? "five_to_ten" : "two_to_five",
          durationMinutes: 60,
        },
      },
      {
        onSuccess: () => {
          setLocation("/matching");
        },
        onError: () => {
          setLocation("/matching");
        },
      }
    );
  };

  return (
    <MobileLayout>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">

        {/* Location warning banner */}
        {locationWarning && (
          <div className="mx-4 mt-4 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl px-4 py-3 text-sm z-10">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Location is disabled. Enable it for accurate nearby matching.</span>
          </div>
        )}

        {/* Top Bar */}
        <header className="flex items-center justify-between p-6 z-10">
          <Button variant="ghost" size="icon" className="rounded-full bg-card/50 border border-white/5">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full bg-card/50 border border-white/5 font-medium text-sm">
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

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 mt-[-40px]">
          <div className="flex items-center gap-2 mb-8 text-primary font-medium px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Nearby Campus</span>
          </div>

          {/* Pulse rings + button */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-72 h-72 rounded-full border border-primary/15 animate-ping" style={{ animationDuration: "2.5s" }} />
            <div className="absolute w-80 h-80 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
            <div className="absolute w-88 h-88 rounded-full border border-primary/5 animate-ping" style={{ animationDuration: "3.5s", animationDelay: "1s" }} />

            <button
              onClick={checkPermissionsAndTap}
              disabled={broadcastMutation.isPending}
              className="relative w-64 h-64 rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_60px_hsl(var(--primary)/0.6)] flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse" />
              <div className="absolute inset-2 rounded-full border border-white/20 bg-black/10 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                {broadcastMutation.isPending ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-3xl font-extrabold text-white tracking-widest drop-shadow-md">TAP TO</span>
                    <span className="text-3xl font-extrabold text-white tracking-widest drop-shadow-md">STUDY</span>
                  </>
                )}
              </div>
            </button>
          </div>

          <p className="mt-12 text-muted-foreground text-center max-w-[260px] text-sm leading-relaxed">
            Match instantly with students having similar interests nearby.
          </p>

          {/* Bluetooth + Location status indicators */}
          <div className="flex gap-3 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card/40 px-3 py-1.5 rounded-full border border-white/5">
              <Bluetooth className="w-3 h-3 text-blue-400" />
              <span>Bluetooth</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card/40 px-3 py-1.5 rounded-full border border-white/5">
              <MapPin className="w-3 h-3 text-green-400" />
              <span>Location</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
