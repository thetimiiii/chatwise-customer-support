import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { ChatWidget } from "@/components/ChatWidget";
import { Website } from "@/integrations/supabase/types";

export const ChatWidgets = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWebsites = async () => {
      const { data, error } = await supabase
        .from('websites')
        .select('*');
      
      if (error) {
        toast({
          title: "Error fetching websites",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setWebsites(data || []);
    };

    fetchWebsites();
  }, [toast]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Chat Widgets</h2>
      {websites.map((website) => (
        <Card key={website.id} className="bg-background">
          <ChatWidget websiteId={website.id} />
        </Card>
      ))}
    </div>
  );
};