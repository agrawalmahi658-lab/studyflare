import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card } from "@/components/ui/card";
import { BrainCircuit, CalendarClock, BarChart3, Rocket } from "lucide-react";

export default function Future() {
  const features = [
    {
      icon: BrainCircuit,
      title: "AI Study Assistant",
      desc: "Get personalized summaries, quiz generation, and concept breakdowns based on your study materials.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: CalendarClock,
      title: "Smart Scheduling",
      desc: "Auto-sync with your university calendar to find the perfect study times with your favorite partners.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      desc: "Track your focus metrics, most productive times, and subject mastery over the semester.",
      color: "from-orange-500 to-rose-500"
    }
  ];

  return (
    <MobileLayout>
      <div className="flex flex-col h-full bg-background p-6">
        <header className="mb-8 mt-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Coming Soon</h1>
          <p className="text-muted-foreground px-4">We're building the future of collaborative learning. Here's what's next.</p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto pb-24 hide-scrollbar">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={i} className="p-5 bg-card/50 border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${feature.color}`} />
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} bg-opacity-10 text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg">{feature.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2 py-0.5 rounded text-muted-foreground">In Dev</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
