import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Analytics = () => {
  const [chatData, setChatData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: websites } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', session.user.id);

      if (websites) {
        const websiteIds = websites.map(w => w.id);
        const { data } = await supabase
          .from('chat_sessions')
          .select('*')
          .in('website_id', websiteIds)
          .order('created_at', { ascending: true });

        // Process data for charts
        const processedData = data?.reduce((acc, session) => {
          const date = new Date(session.created_at).toLocaleDateString();
          const existing = acc.find(item => item.date === date);
          if (existing) {
            existing.chats += 1;
          } else {
            acc.push({ date, chats: 1 });
          }
          return acc;
        }, []) || [];

        setChatData(processedData);
      }
    };

    fetchAnalytics();

    const channel = supabase
      .channel('analytics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions'
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>Chat Sessions Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chatData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="chats" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Daily Chat Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chatData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="chats" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;