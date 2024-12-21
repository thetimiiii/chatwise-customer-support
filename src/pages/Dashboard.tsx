import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOut, LayoutDashboard, MessageSquare, BarChart3, CreditCard, Settings, SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Overview from "./Dashboard/Overview";
import ChatWidgets from "./Dashboard/ChatWidgets";
import Analytics from "./Dashboard/Analytics";
import Billing from "./Dashboard/Billing";
import Settings as SettingsPage from "./Dashboard/Settings";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "chatwidgets", label: "Chat Widgets", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex bg-background">
        <Sidebar>
          <SidebarHeader className="p-4">
            <h2 className="text-lg font-semibold">Lovable</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    data-active={activeTab === item.id}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-6">
          {activeTab === "overview" && <Overview />}
          {activeTab === "chatwidgets" && <ChatWidgets />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "billing" && <Billing />}
          {activeTab === "settings" && <SettingsPage />}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;