import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageSquare, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatWidget } from "@/components/ChatWidget";

export const Overview = () => {
  const [credits, setCredits] = useState<number>(0);
  const [totalChats, setTotalChats] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      
      const userId = session.user.id;

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', userId)
        .single();

      if (profile) {
        setCredits(profile.credits_remaining || 0);
      }

      // Fetch total chats through websites
      const { data: websites } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', userId);

      if (websites && websites.length > 0) {
        const websiteIds = websites.map(w => w.id);
        const { count } = await supabase
          .from('chat_sessions')
          .select('*', { count: 'exact' })
          .in('website_id', websiteIds);

        setTotalChats(count || 0);
      }
    };

    fetchData();

    // Subscribe to real-time updates for credits
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user?.id)}`
        },
        (payload) => {
          if (payload.new.credits_remaining !== undefined) {
            setCredits(payload.new.credits_remaining);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = [
    {
      title: "Chat Credits Remaining",
      value: credits.toString(),
      icon: MessageSquare,
      color: "bg-blue-100",
      iconColor: "text-blue-500"
    },
    {
      title: "Total Chats",
      value: totalChats.toString(),
      icon: Users,
      color: "bg-green-100",
      iconColor: "text-green-500"
    },
    {
      title: "Conversion Rate",
      value: "12%",
      icon: TrendingUp,
      color: "bg-orange-100",
      iconColor: "text-orange-500"
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Demo Section */}
      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Try the Demo</h2>
        <p className="text-muted-foreground mb-4">
          Test our chat widget functionality with this live demo. See how it works before implementing it on your website.
        </p>
        <ChatWidget websiteId="demo" />
      </Card>
    </div>
  );
};