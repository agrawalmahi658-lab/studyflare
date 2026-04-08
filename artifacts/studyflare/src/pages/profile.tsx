import { useState } from "react";
import { useLocation } from "wouter";
import { useGetProfile, useGetStatsSummary, useUpdateProfile } from "@workspace/api-client-react";
import { getGetProfileQueryKey, getGetStatsSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/auth";
import {
  LogOut, Star, Clock, BookOpen, Sun, Moon, Plus, X, Pencil, Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const SUBJECT_OPTIONS = [
  "Maths", "Physics", "Chemistry", "Coding", "Biology",
  "History", "Literature", "Economics", "Geography", "Engineering",
];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: stats } = useGetStatsSummary();
  const updateProfile = useUpdateProfile();

  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState("");

  const [editingSkills, setEditingSkills] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [editingInterests, setEditingInterests] = useState(false);

  const [gender, setGender] = useState<string>("");

  const handleLogout = () => {
    auth.logout();
    setLocation("/login");
  };

  const saveAbout = () => {
    updateProfile.mutate(
      { data: { about: aboutText } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          toast({ title: "About updated!" });
          setEditingAbout(false);
        },
      }
    );
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || profile?.skills?.includes(skill)) return;
    const updated = [...(profile?.skills || []), skill];
    updateProfile.mutate(
      { data: { skills: updated } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          setSkillInput("");
        },
      }
    );
  };

  const removeSkill = (skill: string) => {
    const updated = (profile?.skills || []).filter((s) => s !== skill);
    updateProfile.mutate(
      { data: { skills: updated } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() }) }
    );
  };

  const toggleInterest = (interest: string) => {
    const current = profile?.interests || [];
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    updateProfile.mutate(
      { data: { interests: updated } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() }) }
    );
  };

  if (profileLoading) {
    return (
      <MobileLayout>
        <div className="flex h-full items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex flex-col h-full bg-background overflow-y-auto pb-28 hide-scrollbar">

        {/* Cover & Avatar */}
        <div className="relative h-40 bg-gradient-to-r from-primary to-accent mb-14">
          {/* Theme Toggle */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-sm font-medium hover:bg-black/50 transition"
            >
              {theme === "dark" ? (
                <><Sun className="w-4 h-4" /> Light</>
              ) : (
                <><Moon className="w-4 h-4" /> Dark</>
              )}
            </button>
          </div>

          <div className="absolute -bottom-12 left-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src={profile?.avatar || ""} />
              <AvatarFallback className="bg-card text-2xl font-bold">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Name + Rating */}
        <div className="px-6 mb-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profile?.name || "Student"}</h1>
              <p className="text-sm text-muted-foreground">{profile?.occupation || "University Student"}</p>
            </div>
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-sm">
              <Star className="w-4 h-4 fill-primary" />
              {profile?.rating?.toFixed(1) || "5.0"}
            </div>
          </div>
        </div>

        {/* Gender Dropdown */}
        <div className="px-6 mb-6">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Gender</label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="bg-card/50 border-white/10 rounded-xl">
              <SelectValue placeholder="Select gender..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="no_preference">No Preference</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="px-6 grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 bg-card/50 border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground font-medium">Hours Studied</span>
            </div>
            <div className="text-2xl font-bold">{stats?.totalHoursStudied?.toFixed(1) ?? profile?.totalHours ?? 0}</div>
          </Card>
          <Card className="p-4 bg-card/50 border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground font-medium">Sessions</span>
            </div>
            <div className="text-2xl font-bold">{stats?.totalSessions ?? profile?.totalSessions ?? 0}</div>
          </Card>
        </div>

        {/* About */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base">About</h3>
            {!editingAbout ? (
              <button
                className="text-xs text-primary flex items-center gap-1 hover:opacity-70"
                onClick={() => { setAboutText(profile?.about || ""); setEditingAbout(true); }}
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            ) : (
              <button
                className="text-xs text-emerald-400 flex items-center gap-1 hover:opacity-70"
                onClick={saveAbout}
              >
                <Check className="w-3 h-3" /> Save
              </button>
            )}
          </div>
          {editingAbout ? (
            <Textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Tell study partners about yourself..."
              className="bg-card/50 border-white/10 rounded-xl resize-none text-sm"
              rows={3}
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile?.about || "Tap edit to add something about yourself — your study style, goals, and what makes you a great study partner."}
            </p>
          )}
        </div>

        {/* Interests */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base">Interests</h3>
            <button
              className="text-xs text-primary flex items-center gap-1 hover:opacity-70"
              onClick={() => setEditingInterests(!editingInterests)}
            >
              {editingInterests ? <><Check className="w-3 h-3" /> Done</> : <><Pencil className="w-3 h-3" /> Edit</>}
            </button>
          </div>
          {editingInterests ? (
            <div className="flex flex-wrap gap-2">
              {SUBJECT_OPTIONS.map((subject) => {
                const active = profile?.interests?.includes(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => toggleInterest(subject)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card/50 text-muted-foreground border-white/10 hover:border-primary/50"
                    }`}
                  >
                    {active && <Check className="inline w-3 h-3 mr-1" />}{subject}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.interests?.length ? (
                profile.interests.map((int) => (
                  <Badge key={int} variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 border">
                    {int}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No interests yet. Tap Edit to add some.</span>
              )}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base">Skills</h3>
            <button
              className="text-xs text-primary flex items-center gap-1 hover:opacity-70"
              onClick={() => setEditingSkills(!editingSkills)}
            >
              {editingSkills ? <><Check className="w-3 h-3" /> Done</> : <><Pencil className="w-3 h-3" /> Edit</>}
            </button>
          </div>

          {editingSkills && (
            <div className="flex gap-2 mb-3">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill (e.g. Calculus)"
                className="bg-card/50 border-white/10 rounded-xl text-sm flex-1"
              />
              <Button size="sm" onClick={addSkill} className="rounded-xl px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {profile?.skills?.length ? (
              profile.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 border border-white/10 text-sm font-medium"
                >
                  {skill}
                  {editingSkills && (
                    <button onClick={() => removeSkill(skill)} className="text-muted-foreground hover:text-destructive ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No skills yet. Tap Edit to add some.</span>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="px-6">
          <Button
            variant="destructive"
            className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>

      </div>
    </MobileLayout>
  );
}
