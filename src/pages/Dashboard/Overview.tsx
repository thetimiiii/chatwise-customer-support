import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, MessageSquare, Users } from "lucide-react";

const Overview = () => {
  const [credits, setCredits] = useState(0);
  const [usedCredits, setUsedCredits] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('Fetching dashboard data for user:', session.user.id);

      // Fetch user profile and credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        console.log('Credits data:', profile);
        setCredits(profile.credits_remaining || 0);
        // Calculate used credits (assuming starting from 100)
        setUsedCredits(100 - (profile.credits_remaining || 0));
      }

      // Fetch websites for the user
      const { data: websites } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', session.user.id);

      if (websites) {
        // Fetch chat sessions for all user websites
        const websiteIds = websites.map(w => w.id);
        const { count } = await supabase
          .from('chat_sessions')
          .select('id', { count: 'exact' })
          .in('website_id', websiteIds);

        console.log('Chat sessions count:', count);
        setTotalChats(count || 0);
        setActiveUsers(websiteIds.length);
      }
    };

    fetchData();

    // Set up real-time subscription for profile updates
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user.id)}`
        },
        (payload) => {
          console.log('Profile updated:', payload);
          if (payload.new && 'credits_remaining' in payload.new) {
            setCredits(payload.new.credits_remaining || 0);
            setUsedCredits(100 - (payload.new.credits_remaining || 0));
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
      title: "Credits Remaining",
      value: credits,
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
      progress: (credits / (credits + usedCredits)) * 100
    },
    {
      title: "Total Chats",
      value: totalChats,
      icon: <MessageSquare className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Active Websites",
      value: activeUsers,
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.progress && (
                <Progress 
                  value={stat.progress} 
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Overview;