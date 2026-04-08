import { useState } from "react";
import { useListGroups, useCreateGroup, useJoinGroup } from "@workspace/api-client-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListGroupsQueryKey } from "@workspace/api-client-react";
import { auth } from "@/lib/auth";

export default function Groups() {
  const [tab, setTab] = useState<"discover" | "my">("discover");
  const [search, setSearch] = useState("");
  const { data: groups, isLoading } = useListGroups({ subject: search || undefined });
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();
  const queryClient = useQueryClient();

  const currentUserId = auth.getUserId();

  const [newGroup, setNewGroup] = useState({ name: "", subject: "", maxMembers: 5 });
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    createGroup.mutate({ data: newGroup }, {
      onSuccess: () => {
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
        setTab("my");
      }
    });
  };

  const handleJoin = (id: number) => {
    joinGroup.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
      }
    });
  };

  // Simple mock of 'my groups' vs 'discover' for now since we don't have membership array in Group model directly
  // We'll just show all groups in discover, and groups created by user in 'my'
  const displayGroups = groups?.filter(g => 
    tab === "my" ? g.createdByUserId === currentUserId : g.createdByUserId !== currentUserId
  ) || [];

  return (
    <MobileLayout>
      <div className="flex flex-col h-full bg-background p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
          <p className="text-muted-foreground">Find your academic tribe.</p>
        </header>

        <div className="flex bg-card/50 p-1 rounded-xl mb-6 border border-white/5">
          <button 
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "discover" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("discover")}
          >
            Discover
          </button>
          <button 
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "my" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("my")}
          >
            My Groups
          </button>
        </div>

        {tab === "discover" && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by subject..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-card/50 border-white/10"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pb-24 hide-scrollbar">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading groups...</div>
          ) : displayGroups.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No groups found. {tab === "discover" ? "Try another search." : "Join or create one!"}
            </div>
          ) : (
            displayGroups.map(group => (
              <Card key={group.id} className="p-4 bg-card border-white/5 shadow-sm rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{group.name}</h3>
                    <p className="text-primary text-sm font-medium">{group.subject}</p>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm bg-secondary/50 px-2 py-1 rounded-md">
                    <Users className="w-3 h-3 mr-1" />
                    {group.currentMembers}/{group.maxMembers}
                  </div>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{group.description}</p>
                )}
                
                {tab === "discover" && (
                  <Button 
                    className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleJoin(group.id)}
                    disabled={group.currentMembers >= group.maxMembers || joinGroup.isPending}
                  >
                    {group.currentMembers >= group.maxMembers ? "Full" : "Join Group"}
                  </Button>
                )}
              </Card>
            ))
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="absolute bottom-24 right-6 w-14 h-14 rounded-full shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} placeholder="e.g. Late Night Coders" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input value={newGroup.subject} onChange={e => setNewGroup({...newGroup, subject: e.target.value})} placeholder="e.g. Computer Science" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Members ({newGroup.maxMembers})</label>
                <input 
                  type="range" 
                  min="2" max="20" 
                  value={newGroup.maxMembers} 
                  onChange={e => setNewGroup({...newGroup, maxMembers: parseInt(e.target.value)})}
                  className="w-full accent-primary"
                />
              </div>
              <Button className="w-full mt-4" onClick={handleCreate} disabled={!newGroup.name || !newGroup.subject || createGroup.isPending}>
                {createGroup.isPending ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </MobileLayout>
  );
}
