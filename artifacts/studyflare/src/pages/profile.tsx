import { useLocation } from "wouter";
import { useGetProfile, useGetStatsSummary } from "@workspace/api-client-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { LogOut, Settings, Star, Clock, Activity, MapPin } from "lucide-react";
import { useTheme } from "next-themes";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();

  const handleLogout = () => {
    auth.logout();
    setLocation("/login");
  };

  return (
    <MobileLayout>
      <div className="flex flex-col h-full bg-background overflow-y-auto pb-24 hide-scrollbar">
        
        {/* Cover & Avatar Header */}
        <div className="relative h-40 bg-gradient-to-r from-primary to-accent mb-12">
          <div className="absolute top-6 right-6 flex gap-2">
            <Button variant="ghost" size="icon" className="text-white bg-black/20 hover:bg-black/40 rounded-full" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="absolute -bottom-10 left-6 flex items-end">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src={profile?.avatar || ""} />
              <AvatarFallback className="bg-card text-2xl font-bold">
                {profile?.name ? profile.name.charAt(0) : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold">{profile?.name || "Student"}</h1>
              <p className="text-muted-foreground">{profile?.occupation || "University Student"}</p>
            </div>
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              <Star className="w-4 h-4 fill-primary" />
              {profile?.rating?.toFixed(1) || "5.0"}
            </div>
          </div>
          
          <p className="text-sm mt-3 leading-relaxed">
            {profile?.about || "I love studying late at night and finding new people to collaborate with. Let's crush these exams together!"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="px-6 grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-card/50 border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Hours</div>
            </div>
            <div className="text-2xl font-bold">{stats?.totalHoursStudied || profile?.totalHours || 0}</div>
          </Card>
          <Card className="p-4 bg-card/50 border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Sessions</div>
            </div>
            <div className="text-2xl font-bold">{stats?.totalSessions || profile?.totalSessions || 0}</div>
          </Card>
        </div>

        {/* Interests */}
        <div className="px-6 mb-8">
          <h3 className="font-bold text-lg mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile?.interests?.map(int => (
              <Badge key={int} variant="secondary" className="px-3 py-1 bg-secondary/50 hover:bg-secondary">
                {int}
              </Badge>
            )) || (
              <span className="text-muted-foreground text-sm">No interests added yet.</span>
            )}
          </div>
        </div>

        {/* Settings / Actions */}
        <div className="px-6 mt-auto">
          <Button 
            variant="destructive" 
            className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>

      </div>
    </MobileLayout>
  );
}
