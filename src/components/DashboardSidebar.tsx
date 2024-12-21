import { MessageSquare, BarChart3, CreditCard, Share2, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: MessageSquare, label: "Chat Widgets", path: "/dashboard/widgets" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: Share2, label: "Export", path: "/dashboard/export" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <div className="w-64 min-h-screen bg-background border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">SimpleSupport</h1>
      </div>
      
      <nav className="px-3 py-2">
        <Link 
          to="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
            location.pathname === "/dashboard" 
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <div className="w-4 h-4" />
          Overview
        </Link>

        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mt-1",
              location.pathname === item.path
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 w-full px-3">
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Link>
      </div>
    </div>
  );
}