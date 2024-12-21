import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ChatWidgets = () => {
  const [websites, setWebsites] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWebsites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', session.user.id);

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

    const channel = supabase
      .channel('websites_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'websites'
        },
        () => {
          fetchWebsites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chat Widgets</h1>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Website
        </Button>
      </div>

      {websites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You haven't added any websites yet
            </p>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Website
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {websites.map((website) => (
            <Card key={website.id}>
              <CardHeader>
                <CardTitle className="text-lg">{website.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {website.url}
                </p>
                <Button variant="outline" className="w-full">
                  Configure Widget
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatWidgets;