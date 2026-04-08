import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetNearbyStudents } from "@workspace/api-client-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, UserPlus, X } from "lucide-react";

export default function Matching() {
  const [, setLocation] = useLocation();
  const [scanned, setScanned] = useState(false);
  
  const { data: students, isLoading } = useGetNearbyStudents({ subject: "General" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setScanned(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleConnect = (id: number) => {
    // In real app, might create a session here
    setLocation(`/session/${id}`);
  };

  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col h-screen bg-background relative overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-gradient-to-b from-background to-transparent">
          <h2 className="font-bold text-lg">Scanning Area</h2>
          <Button variant="ghost" size="icon" className="rounded-full bg-card/50 backdrop-blur-md" onClick={() => setLocation("/home")}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Radar Map Area */}
        <div className="flex-1 relative flex items-center justify-center">
          
          {/* Radar Rings */}
          <div className="absolute w-[600px] h-[600px] flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full border border-primary/20 animate-radar-ping" />
            <div className="absolute w-[70%] h-[70%] rounded-full border border-primary/30 animate-radar-ping animation-delay-1000" />
            <div className="absolute w-[40%] h-[40%] rounded-full border border-primary/40 animate-radar-ping animation-delay-2000" />
          </div>

          {/* Center User Dot */}
          <div className="relative w-12 h-12 bg-primary rounded-full shadow-[0_0_20px_hsl(var(--primary)/1)] z-10 flex items-center justify-center border-2 border-white">
             <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          </div>

          {/* Matched Dots (appear after some scanning) */}
          {scanned && students?.map((student, i) => {
            // distribute dots around a circle randomly for visual effect
            const angle = (i * (360 / (students.length || 1))) * (Math.PI / 180);
            const radius = 100 + Math.random() * 80;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div 
                key={student.id}
                className="absolute w-10 h-10 rounded-full border-2 border-accent bg-background p-0.5 shadow-[0_0_15px_hsl(var(--accent)/0.8)] z-10 transition-all duration-1000 animate-in fade-in zoom-in"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={student.avatar || ""} />
                  <AvatarFallback className="bg-accent/20 text-accent text-xs font-bold">{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            );
          })}
        </div>

        {/* Results Bottom Sheet */}
        <div className={`absolute bottom-0 w-full bg-card/90 backdrop-blur-xl border-t border-border rounded-t-3xl p-6 pt-8 transition-transform duration-500 ease-out z-30 ${scanned ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full" />
          
          <h3 className="font-bold text-xl mb-4">
            {students?.length ? `Found ${students.length} Study Partners` : "No partners found yet"}
          </h3>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-6 px-6 hide-scrollbar">
            {students?.map(student => (
              <Card key={student.id} className="snap-center shrink-0 w-[280px] bg-background/50 border-white/5 p-4 rounded-2xl flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-14 h-14 border border-primary/20">
                    <AvatarImage src={student.avatar || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-bold text-base line-clamp-1">{student.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center"><Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" /> {student.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {student.distanceKm.toFixed(1)}km</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-5">
                  {student.interests.slice(0,2).map(int => (
                    <span key={int} className="text-xs bg-secondary px-2 py-1 rounded-md text-secondary-foreground font-medium">{int}</span>
                  ))}
                  {student.interests.length > 2 && <span className="text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground">+{student.interests.length - 2}</span>}
                </div>

                <Button 
                  className="w-full mt-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  onClick={() => handleConnect(student.id)}
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Connect
                </Button>
              </Card>
            ))}
            
            {!students?.length && !isLoading && (
              <div className="w-full text-center text-muted-foreground py-8">
                Try expanding your search criteria or wait a bit.
              </div>
            )}
          </div>
        </div>
        
      </div>
    </MobileLayout>
  );
}
