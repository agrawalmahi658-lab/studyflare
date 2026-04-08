import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useGetSession, useUpdateSession } from "@workspace/api-client-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, ChevronLeft } from "lucide-react";

export default function Session() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isActive, setIsActive] = useState(false);
  
  const sessionId = Number(id);
  const { data: session } = useGetSession(sessionId, { query: { enabled: !!sessionId } });
  const updateSession = useUpdateSession();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const endSession = () => {
    setIsActive(false);
    updateSession.mutate({
      data: { status: "completed", durationMinutes: Math.floor((25 * 60 - timeLeft) / 60) }
    }, {
      onSuccess: () => {
        setLocation(`/feedback/${sessionId}`);
      }
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;
  const strokeDasharray = 2 * Math.PI * 120;
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col h-screen bg-background relative px-6 py-8">
        <header className="flex items-center gap-4 mb-12">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setLocation("/home")}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="font-bold text-xl">{session?.subject || "Study Session"}</h1>
            <p className="text-sm text-primary">with Partner</p>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center mb-16">
            {/* Background Circle */}
            <svg className="w-72 h-72 transform -rotate-90">
              <circle
                cx="144" cy="144" r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-card-border/50"
              />
              {/* Progress Circle */}
              <circle
                cx="144" cy="144" r="120"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-primary transition-all duration-1000 ease-linear"
              />
            </svg>
            
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-6xl font-mono font-bold tracking-tighter text-foreground drop-shadow-md">
                {formatTime(timeLeft)}
              </span>
              <span className="text-sm text-muted-foreground mt-2 uppercase tracking-widest font-semibold">
                Focus Time
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Button 
              size="icon" 
              variant="outline" 
              className="w-16 h-16 rounded-full border-2 border-white/10 hover:bg-card hover:text-foreground text-muted-foreground transition-all"
              onClick={endSession}
              disabled={updateSession.isPending}
            >
              <Square className="w-6 h-6 fill-current" />
            </Button>

            <Button 
              size="icon" 
              className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all hover:scale-105"
              onClick={toggleTimer}
            >
              {isActive ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
