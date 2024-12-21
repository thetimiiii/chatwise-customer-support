import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "@/components/ChatWidget";
import { Website } from "@/integrations/supabase/types";
import { Plus, X } from "lucide-react";

export const ChatWidgets = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chat Widgets</h2>
        {!selectedWebsite && (
          <Button onClick={() => setSelectedWebsite("")}>
            <Plus className="w-4 h-4 mr-2" />
            New Widget
          </Button>
        )}
      </div>

      {selectedWebsite !== null ? (
        <div className="relative">
          <Button 
            variant="ghost" 
            className="absolute right-2 top-2"
            onClick={() => setSelectedWebsite(null)}
          >
            <X className="w-4 h-4" />
          </Button>
          <ChatWidget 
            websiteId={selectedWebsite} 
            onClose={() => setSelectedWebsite(null)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <Card key={website.id} className="p-6">
              <h3 className="font-semibold mb-2">{website.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{website.url}</p>
              <Button onClick={() => setSelectedWebsite(website.id)}>
                Configure Widget
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};