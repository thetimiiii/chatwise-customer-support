import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Settings } from "lucide-react";
import { EmbedCodeDialog } from "@/components/EmbedCodeDialog";
import { Website, isWebsiteConfig } from "@/integrations/supabase/types/website";
import { Card } from "@/components/ui/card";
import { ChatWidget } from "@/components/ChatWidget";
import { HexColorPicker } from "react-colorful";
import { Textarea } from "@/components/ui/textarea";

export default function ChatWidgets() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { toast } = useToast();

  // Add state for customization
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [preamble, setPreamble] = useState(
    "You are a helpful customer support agent. Be concise and friendly in your responses."
  );

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

      if (error) {
        throw error;
      }

      setWebsites(prev => [website, ...prev]);
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

        if (error) {
          throw error;
        }

        // Immediately update the UI
        setWebsites(prev => prev.filter(website => website.id !== id));
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

  const handleCustomize = (website: Website) => {
    setSelectedWebsite(website);
    setPrimaryColor(website.config.primaryColor);
    setPreamble(website.config.preamble);
    setIsCustomizing(true);
  };

  const handleSaveCustomization = async () => {
    if (!selectedWebsite) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("websites")
        .update({
          config: {
            primaryColor,
            preamble
          }
        })
        .eq("id", selectedWebsite.id);

      if (error) throw error;

      // Update local state
      setWebsites(prev => prev.map(website => 
        website.id === selectedWebsite.id 
          ? { ...website, config: { primaryColor, preamble } }
          : website
      ));

      toast({
        title: "Success",
        description: "Widget customization saved successfully",
      });
      setIsCustomizing(false);
      setSelectedWebsite(null);
    } catch (error) {
      console.error("Error saving customization:", error);
      toast({
        title: "Error",
        description: "Failed to save customization",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Website List */}
        <div className="space-y-4">
          {websites.map((website) => (
            <Card key={website.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{website.name}</h3>
                  <p className="text-sm text-gray-500">{website.url}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCustomize(website)}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Customize
                  </Button>
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
              
              {/* Preview Widget */}
              <div className="mt-4 border rounded p-4 bg-gray-50">
                <ChatWidget
                  websiteId={website.id}
                  config={website.config}
                  previewMode={true}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Customization Panel */}
        {isCustomizing && selectedWebsite && (
          <Card className="p-6 space-y-4">
            <h3 className="font-medium">Customize Widget</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Chat Bot Preamble</label>
              <Textarea
                value={preamble}
                onChange={(e) => setPreamble(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveCustomization} disabled={isLoading}>
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCustomizing(false);
                  setSelectedWebsite(null);
                }}
              >
                Cancel
              </Button>
            </div>

            {/* Live Preview */}
            <div className="mt-4 border rounded p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Live Preview</h4>
              <ChatWidget
                websiteId={selectedWebsite.id}
                config={{ primaryColor, preamble }}
                previewMode={true}
              />
            </div>
          </Card>
        )}
      </div>

      {selectedWebsite && (
        <EmbedCodeDialog
          website={selectedWebsite}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}