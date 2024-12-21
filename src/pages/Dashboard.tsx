import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOut, LayoutDashboard, MessageSquare, BarChart3, CreditCard, Settings, SunIcon, MoonIcon, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Overview from "./Dashboard/Overview";
import ChatWidgets from "./Dashboard/ChatWidgets";
import Analytics from "./Dashboard/Analytics";
import Billing from "./Dashboard/Billing";
import SettingsPage from "./Dashboard/Settings";
import DemoTab from "./Dashboard/Demo";

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
    { id: "demo", label: "Demo Widget", icon: PlayCircle },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar className="border-r border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <SidebarHeader className="p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              Lovable
            </h2>
          </SidebarHeader>
          
          <SidebarContent className="px-3">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    data-active={activeTab === item.id}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200
                      ${activeTab === item.id ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-medium' : ''}
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-primary' : ''}`} />
                    <span className="text-sm">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-6 flex flex-col gap-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg ring-1 ring-gray-100/5 dark:ring-gray-800/5 p-6">
              {activeTab === "overview" && <Overview />}
              {activeTab === "chatwidgets" && <ChatWidgets />}
              {activeTab === "demo" && <DemoTab />}
              {activeTab === "analytics" && <Analytics />}
              {activeTab === "billing" && <Billing />}
              {activeTab === "settings" && <SettingsPage />}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
