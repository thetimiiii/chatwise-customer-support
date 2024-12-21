import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HexColorPicker } from "react-colorful";
import { ChatWidget } from "@/components/ChatWidget";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function DemoTab() {
  const [url, setUrl] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [preamble, setPreamble] = useState(
    "You are a helpful customer support agent. Be concise and friendly in your responses."
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateDemo = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data: website, error } = await supabase
        .from("websites")
        .insert({
          url,
          name: "Demo Website",
          user_id: session.user.id,
          config: {
            primaryColor,
            preamble,
          },
        })
        .select()
        .single();

      if (error) throw error;

      setWebsiteId(website.id);
      toast({
        title: "Success",
        description: "Demo widget created successfully",
      });
    } catch (error) {
      console.error("Error creating demo:", error);
      toast({
        title: "Error",
        description: "Failed to create demo widget",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Demo Widget</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Website URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
            />
          </div>

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

          <Button 
            onClick={handleCreateDemo} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creating..." : "Create Demo Widget"}
          </Button>
        </Card>

        <Card className="p-6">
          <div className="h-full flex items-center justify-center">
            {websiteId ? (
              <ChatWidget
                websiteId={websiteId}
                primaryColor={primaryColor}
                preamble={preamble}
              />
            ) : (
              <p className="text-muted-foreground text-center">
                Configure and create a demo widget to test it here
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}