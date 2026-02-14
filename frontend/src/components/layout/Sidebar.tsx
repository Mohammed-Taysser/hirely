import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Building2,
  Mail,
  LayoutDashboard,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  LayoutTemplate,
  PenLine,
  Target,
  Shield,
  Receipt,
  CreditCard,
  Users,
  HelpCircle,
  Coins,
  Gift,
  BarChart3,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resumes", href: "/resumes", icon: FileText },
  { name: "Templates", href: "/templates", icon: LayoutTemplate },
  { name: "Cover Letter", href: "/cover-letter", icon: PenLine },
  { name: "Job Analyzer", href: "/job-analyzer", icon: Target },
  { name: "Interview Prep", href: "/interview-prep", icon: MessageSquare },
  { name: "Salary Helper", href: "/salary-negotiation", icon: DollarSign },
  { name: "Analytics", href: "/resume-analytics", icon: BarChart3 },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Emails", href: "/emails", icon: Mail },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Subscription", href: "/subscription", icon: CreditCard },
  { name: "My Points", href: "/my-points", icon: Coins },
  { name: "Referrals", href: "/referrals", icon: Gift },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Support", href: "/support", icon: HelpCircle },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Manage Users", href: "/admin/users", icon: Shield },
  { name: "Loyalty Points", href: "/admin/loyalty", icon: Coins },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, toggle } = useSidebarState();
  const { user, logout, isSuperAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const tierVariant = user?.role === 'super-admin' ? 'premium' : 'pro';

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <FileText className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Hirely</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
          
          {/* Admin Section - Only show for super-admin */}
          {isSuperAdmin() && (
            <>
              {!collapsed && <div className="pt-4 pb-2 px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase">Admin</div>}
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          {!collapsed && user && (
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <Badge variant={tierVariant} className="mt-1">
                  {user.role.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
