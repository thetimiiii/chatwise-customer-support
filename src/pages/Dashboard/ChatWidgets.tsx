import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Settings, MessageCircle } from "lucide-react";
import { EmbedCodeDialog } from "@/components/EmbedCodeDialog";
import { Website, isWebsiteConfig } from "@/integrations/supabase/types/website";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatWidget } from "@/components/ChatWidget";
import { HexColorPicker } from "react-colorful";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function ChatWidgets() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Track color changes per website
  const [websiteColors, setWebsiteColors] = useState<Record<string, string>>({});
  const [websitePreambles, setWebsitePreambles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchWebsites = async () => {
      const { data, error } = await supabase
        .from("websites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching websites:", error);
        toast({
          title: "Error",
          description: "Failed to load websites",
          variant: "destructive",
        });
        return;
      }

      // Transform and validate the data
      const validWebsites = data.map(website => ({
        ...website,
        config: isWebsiteConfig(website.config) 
          ? website.config 
          : {
              primaryColor: "#2563eb",
              preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
            }
      }));

      setWebsites(validWebsites);
      
      // Initialize colors and preambles
      const colors: Record<string, string> = {};
      const preambles: Record<string, string> = {};
      validWebsites.forEach(website => {
        colors[website.id] = website.config.primaryColor;
        preambles[website.id] = website.config.preamble;
      });
      setWebsiteColors(colors);
      setWebsitePreambles(preambles);
    };

    fetchWebsites();

    // Subscribe to changes
    const channel = supabase
      .channel("websites_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "websites",
        },
        (payload) => {
          console.log("Website change received:", payload);
          fetchWebsites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleAddWebsite = async () => {
    if (!newWebsiteUrl) return;

    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("Not authenticated");
      }

      const { data: website, error } = await supabase
        .from("websites")
        .insert({
          url: newWebsiteUrl,
          name: new URL(newWebsiteUrl).hostname,
          user_id: session.session.user.id,
          config: {
            primaryColor: "#2563eb",
            preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
          }
        })
        .select()
        .single();

      if (error) throw error;

      setWebsites(prev => [website, ...prev]);
      setWebsiteColors(prev => ({ ...prev, [website.id]: website.config.primaryColor }));
      setWebsitePreambles(prev => ({ ...prev, [website.id]: website.config.preamble }));
      setNewWebsiteUrl("");
      toast({
        title: "Success",
        description: "Website added successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding website:", error);
      toast({
        title: "Error",
        description: "Failed to add website",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    if (confirm("Are you sure you want to delete this website?")) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from("websites")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setWebsites(prev => prev.filter(website => website.id !== id));
        setWebsiteColors(prev => {
          const newColors = { ...prev };
          delete newColors[id];
          return newColors;
        });
        setWebsitePreambles(prev => {
          const newPreambles = { ...prev };
          delete newPreambles[id];
          return newPreambles;
        });

        toast({
          title: "Success",
          description: "Website deleted successfully",
          variant: "default",
        });
      } catch (error) {
        console.error("Error deleting website:", error);
        toast({
          title: "Error",
          description: "Failed to delete website",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleShowEmbedCode = (website: Website) => {
    setSelectedWebsite(website);
    setIsDialogOpen(true);
  };

  const handleColorChange = async (websiteId: string, color: string) => {
    setWebsiteColors(prev => ({ ...prev, [websiteId]: color }));
    
    try {
      const website = websites.find(w => w.id === websiteId);
      if (!website) return;

      const { error } = await supabase
        .from("websites")
        .update({
          config: {
            ...website.config,
            primaryColor: color,
          }
        })
        .eq("id", websiteId);

      if (error) throw error;

      setWebsites(prev => prev.map(w => 
        w.id === websiteId 
          ? { ...w, config: { ...w.config, primaryColor: color } }
          : w
      ));
    } catch (error) {
      console.error("Error updating color:", error);
      toast({
        title: "Error",
        description: "Failed to update widget color",
        variant: "destructive",
      });
    }
  };

  const handlePreambleChange = async (websiteId: string, preamble: string) => {
    setWebsitePreambles(prev => ({ ...prev, [websiteId]: preamble }));
    
    try {
      const website = websites.find(w => w.id === websiteId);
      if (!website) return;

      const { error } = await supabase
        .from("websites")
        .update({
          config: {
            ...website.config,
            preamble,
          }
        })
        .eq("id", websiteId);

      if (error) throw error;

      setWebsites(prev => prev.map(w => 
        w.id === websiteId 
          ? { ...w, config: { ...w.config, preamble } }
          : w
      ));
    } catch (error) {
      console.error("Error updating preamble:", error);
      toast({
        title: "Error",
        description: "Failed to update widget preamble",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          value={newWebsiteUrl}
          onChange={(e) => setNewWebsiteUrl(e.target.value)}
          placeholder="Enter website URL"
          disabled={isLoading}
        />
        <Button 
          onClick={handleAddWebsite} 
          disabled={isLoading}
        >
          Add Website
        </Button>
      </div>

      <div className="space-y-4">
        {websites.map((website) => (
          <Card key={website.id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: websiteColors[website.id] || website.config.primaryColor }}
                  />
                  <div>
                    <CardTitle className="text-lg">{website.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{website.url}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Customize
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="end">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Widget Color</label>
                          <HexColorPicker 
                            color={websiteColors[website.id] || website.config.primaryColor} 
                            onChange={(color) => handleColorChange(website.id, color)}
                          />
                          <Input
                            value={websiteColors[website.id] || website.config.primaryColor}
                            onChange={(e) => handleColorChange(website.id, e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Chat Bot Preamble</label>
                          <Textarea
                            value={websitePreambles[website.id] || website.config.preamble}
                            onChange={(e) => handlePreambleChange(website.id, e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    onClick={() => handleShowEmbedCode(website)}
                    variant="outline"
                    size="sm"
                  >
                    Get Code
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteWebsite(website.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <ChatWidget
                  websiteId={website.id}
                  config={{
                    primaryColor: websiteColors[website.id] || website.config.primaryColor,
                    preamble: websitePreambles[website.id] || website.config.preamble,
                  }}
                  previewMode={true}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedWebsite && (
        <EmbedCodeDialog
          website={{
            ...selectedWebsite,
            config: {
              primaryColor: websiteColors[selectedWebsite.id] || selectedWebsite.config.primaryColor,
              preamble: websitePreambles[selectedWebsite.id] || selectedWebsite.config.preamble,
            }
          }}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}