import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { PlusIcon, Trash2Icon, Settings2Icon, Code2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Website, isWebsiteConfig } from "@/integrations/supabase/types/website";
import { HexColorPicker } from "react-colorful";
import { EmbedCodeDialog } from "@/components/EmbedCodeDialog";

const ChatWidgets = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [newWebsiteName, setNewWebsiteName] = useState("");
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [preamble, setPreamble] = useState(
    "You are a helpful customer support agent. Be concise and friendly in your responses."
  );
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

      // Transform the data to ensure config is properly typed
      const typedWebsites = data.map(website => ({
        ...website,
        config: isWebsiteConfig(website.config) ? website.config : {
          primaryColor: "#2563eb",
          preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
        }
      })) as Website[];

      setWebsites(typedWebsites);
    };

    fetchWebsites();

    // Subscribe to real-time updates
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

  const handleAddWebsite = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('websites')
        .insert({
          user_id: session.user.id,
          url: newWebsiteUrl,
          name: newWebsiteName || newWebsiteUrl,
          config: {
            primaryColor: "#2563eb",
            preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Website added successfully",
        description: "You can now configure your chat widget.",
      });

      setNewWebsiteUrl("");
      setNewWebsiteName("");
      setIsAddingWebsite(false);
    } catch (error) {
      toast({
        title: "Error adding website",
        description: "There was a problem adding your website. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWebsite = async (websiteId: string) => {
    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', websiteId);

      if (error) throw error;

      // Update local state immediately
      setWebsites(prev => prev.filter(website => website.id !== websiteId));

      toast({
        title: "Website deleted successfully",
        description: "The website and its chat widget have been removed.",
      });
    } catch (error) {
      toast({
        title: "Error deleting website",
        description: "There was a problem deleting the website. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateConfig = async () => {
    if (!selectedWebsite) return;

    try {
      const { error } = await supabase
        .from('websites')
        .update({
          config: {
            primaryColor,
            preamble,
          },
        })
        .eq('id', selectedWebsite.id);

      if (error) throw error;

      toast({
        title: "Widget configured successfully",
        description: "Your chat widget settings have been updated.",
      });

      setSelectedWebsite(null);
    } catch (error) {
      toast({
        title: "Error updating configuration",
        description: "There was a problem updating the widget settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chat Widgets</h1>
        <Dialog open={isAddingWebsite} onOpenChange={setIsAddingWebsite}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Website
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Website</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  placeholder="https://example.com"
                  value={newWebsiteUrl}
                  onChange={(e) => setNewWebsiteUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website Name (Optional)</label>
                <Input
                  placeholder="My Website"
                  value={newWebsiteName}
                  onChange={(e) => setNewWebsiteName(e.target.value)}
                />
              </div>
              <Button onClick={handleAddWebsite} className="w-full">
                Add Website
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {websites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You haven't added any websites yet
            </p>
            <Button onClick={() => setIsAddingWebsite(true)}>
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
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {website.url}
                </p>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedWebsite(website);
                          setPrimaryColor(website.config?.primaryColor || "#2563eb");
                          setPreamble(website.config?.preamble || "You are a helpful customer support agent. Be concise and friendly in your responses.");
                        }}
                      >
                        <Settings2Icon className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Configure Chat Widget</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Primary Color</label>
                          <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Chat Bot Preamble</label>
                          <textarea
                            className="w-full p-2 border rounded-md"
                            rows={3}
                            value={preamble}
                            onChange={(e) => setPreamble(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleUpdateConfig} className="w-full">
                          Save Configuration
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedWebsite(website);
                      setShowEmbedCode(true);
                    }}
                  >
                    <Code2Icon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteWebsite(website.id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedWebsite && (
        <EmbedCodeDialog
          website={selectedWebsite}
          open={showEmbedCode}
          onOpenChange={setShowEmbedCode}
        />
      )}
    </div>
  );
};

export default ChatWidgets;
