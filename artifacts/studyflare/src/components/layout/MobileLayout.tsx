import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileLayout({ children, showNav = true }: { children: ReactNode, showNav?: boolean }) {
  return (
    <div className="min-h-[100dvh] w-full bg-black/90 md:bg-black/40 flex justify-center items-start">
      <div className="relative w-full max-w-[420px] min-h-[100dvh] bg-background shadow-2xl flex flex-col overflow-hidden">
        <main className={cn("flex-1 flex flex-col", showNav && "pb-20")}>
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}

function BottomNav() {
  const [location] = useLocation();

  const links = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/future", icon: GraduationCap, label: "Future" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-around px-4 z-50">
      {links.map((link) => {
        const isActive = location.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href} className="flex-1">
            <div className="flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer py-2">
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive ? "bg-primary/10 text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {link.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
