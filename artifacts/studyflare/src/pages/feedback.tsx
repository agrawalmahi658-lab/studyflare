import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useSubmitFeedback } from "@workspace/api-client-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Feedback() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = useSubmitFeedback();

  const handleSubmit = () => {
    if (rating === 0) return;
    submitFeedback.mutate({
      id: Number(sessionId),
      data: { rating, comment, reviewedUserId: 2 } // Mocking partner ID
    }, {
      onSuccess: () => {
        setSubmitted(true);
        setTimeout(() => setLocation("/home"), 2000);
      }
    });
  };

  if (submitted) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col h-screen bg-background items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="text-muted-foreground">Your feedback helps improve the matching experience.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col min-h-screen px-6 py-12 bg-background">
        <h1 className="text-3xl font-bold mb-2 text-center">How was your session?</h1>
        <p className="text-muted-foreground text-center mb-12">Rate your study partner</p>

        <div className="flex-1 flex flex-col items-center max-w-sm w-full mx-auto">
          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
              >
                <Star
                  className={cn(
                    "w-12 h-12 transition-colors",
                    (hovered ? star <= hovered : star <= rating)
                      ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="w-full space-y-4 mb-8">
            <label className="text-sm font-medium text-foreground">Add a comment (optional)</label>
            <Textarea 
              placeholder="What went well? Any areas for improvement?" 
              className="resize-none h-32 bg-card/50 border-white/10 focus:border-primary/50"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          <div className="w-full mt-auto pt-8 space-y-3">
            <Button 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
              disabled={rating === 0 || submitFeedback.isPending}
              onClick={handleSubmit}
            >
              {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-14 text-muted-foreground hover:text-foreground"
              onClick={() => setLocation("/home")}
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
