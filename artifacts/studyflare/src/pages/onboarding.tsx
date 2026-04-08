import { useState } from "react";
import { useLocation } from "wouter";
import { useUpdateProfile } from "@workspace/api-client-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  "Maths", "Physics", "Chemistry", "Coding", 
  "Biology", "History", "Literature", "Economics",
  "Design", "Psychology"
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [prefSize, setPrefSize] = useState<"one_on_one" | "small_group">("small_group");
  
  const updateProfile = useUpdateProfile();

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleComplete = () => {
    updateProfile.mutate({ 
      data: { 
        interests: selectedSubjects,
        preferredGroupSize: prefSize 
      } 
    }, {
      onSuccess: () => setLocation("/home")
    });
  };

  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col min-h-screen px-6 py-12 bg-background">
        <div className="flex-1 flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-3">What are you studying?</h1>
            <p className="text-muted-foreground">Select subjects to match with the right people.</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            {SUBJECTS.map(sub => (
              <Badge 
                key={sub}
                variant="outline"
                className={cn(
                  "px-4 py-2 text-sm cursor-pointer rounded-full transition-all border-white/10",
                  selectedSubjects.includes(sub) 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card/50 hover:bg-card hover:border-primary/50 text-foreground"
                )}
                onClick={() => toggleSubject(sub)}
              >
                {sub}
              </Badge>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Study Preference</h2>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={cn(
                  "p-4 rounded-xl border cursor-pointer text-center transition-all",
                  prefSize === "one_on_one" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-border bg-card/50 text-muted-foreground"
                )}
                onClick={() => setPrefSize("one_on_one")}
              >
                <div className="font-bold text-lg mb-1">1:1</div>
                <div className="text-xs">Deep focus</div>
              </div>
              <div 
                className={cn(
                  "p-4 rounded-xl border cursor-pointer text-center transition-all",
                  prefSize === "small_group" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-border bg-card/50 text-muted-foreground"
                )}
                onClick={() => setPrefSize("small_group")}
              >
                <div className="font-bold text-lg mb-1">Group</div>
                <div className="text-xs">2-5 people</div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-8">
            <Button 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-full shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
              disabled={selectedSubjects.length === 0 || updateProfile.isPending}
              onClick={handleComplete}
            >
              {updateProfile.isPending ? "Saving..." : "Let's Study!"}
              <ChevronRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
