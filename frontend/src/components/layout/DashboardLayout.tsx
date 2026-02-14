import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/useSidebarState";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { collapsed } = useSidebarState();
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Top bar with notifications */}
      <div className={cn(
        "fixed top-0 right-0 z-30 h-16 flex items-center justify-end px-6 bg-background/80 backdrop-blur-sm border-b transition-all duration-300",
        collapsed ? "left-16" : "left-64"
      )}>
        <NotificationCenter />
      </div>
      <main className={cn(
        "min-h-screen pt-24 px-8 pb-8 transition-all duration-300",
        collapsed ? "ml-16" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}
