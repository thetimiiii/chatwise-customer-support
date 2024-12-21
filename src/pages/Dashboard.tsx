import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MessageSquare, Users, CreditCard, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credits, setCredits] = useState(0);
  const [usedCredits, setUsedCredits] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch user profile and credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setCredits(profile.credits_remaining || 0);
      }

      // Fetch used credits from chat sessions
      const { count } = await supabase
        .from('chat_sessions')
        .select('id', { count: 'exact' })
        .eq('website_id', session.user.id);

      setUsedCredits(count || 0);
    };

    checkUser();
  }, [navigate]);

  const stats = [
    {
      title: "Chat Credits Used",
      value: usedCredits,
      icon: MessageSquare,
      color: "bg-blue-100",
      iconColor: "text-blue-500"
    },
    {
      title: "Total Users",
      value: "1,234",
      icon: Users,
      color: "bg-green-100",
      iconColor: "text-green-500"
    },
    {
      title: "Revenue",
      value: "$2.4k",
      icon: CreditCard,
      color: "bg-purple-100",
      iconColor: "text-purple-500"
    },
    {
      title: "Conversion Rate",
      value: "12%",
      icon: TrendingUp,
      color: "bg-orange-100",
      iconColor: "text-orange-500"
    }
  ];

  const recentActivity = [
    {
      title: "New chat started",
      time: "2 minutes ago",
      icon: MessageSquare,
      color: "bg-blue-100",
      iconColor: "text-blue-500"
    },
    {
      title: "New user registered",
      time: "1 hour ago",
      icon: Users,
      color: "bg-green-100",
      iconColor: "text-green-500"
    }
  ];

  const quickActions = [
    {
      title: "Add Chat Widget",
      description: "Deploy a new chat widget to your website",
      icon: MessageSquare,
      color: "bg-blue-100",
      iconColor: "text-blue-500"
    },
    {
      title: "View Analytics",
      description: "Check your chat performance metrics",
      icon: TrendingUp,
      color: "bg-green-100",
      iconColor: "text-green-500"
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="flex-1 p-8 bg-background">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-lg", stat.color)}>
                  <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-background">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.title} className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", activity.color)}>
                    <activity.icon className={cn("w-4 h-4", activity.iconColor)} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-background">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  className="flex items-center gap-4 w-full p-4 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className={cn("p-2 rounded-lg", action.color)}>
                    <action.icon className={cn("w-4 h-4", action.iconColor)} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;