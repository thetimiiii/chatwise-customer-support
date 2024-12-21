import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { EmbedCodeDialog } from "@/components/EmbedCodeDialog";
import { Website, isWebsiteConfig } from "@/integrations/supabase/types/website";

export default function ChatWidgets() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      const { error } = await supabase
        .from("websites")
        .insert([{ url: newWebsiteUrl }]);

      if (error) {
        console.error("Error adding website:", error);
        toast({
          title: "Error",
          description: "Failed to add website",
          variant: "destructive",
        });
      } else {
        setNewWebsiteUrl("");
        toast({
          title: "Success",
          description: "Website added successfully",
          variant: "success",
        });
      }
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
          console.error("Error deleting website:", error);
          toast({
            title: "Error",
            description: "Failed to delete website",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Website deleted successfully",
            variant: "success",
          });
        }
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

  return (
    <div>
      <h1 className="text-2xl font-bold">Chat Widgets</h1>
      <div className="flex gap-2">
        <Input
          value={newWebsiteUrl}
          onChange={(e) => setNewWebsiteUrl(e.target.value)}
          placeholder="Enter website URL"
        />
        <Button onClick={handleAddWebsite} isLoading={isLoading}>
          Add Website
        </Button>
      </div>
      <ul className="mt-4">
        {websites.map((website) => (
          <li key={website.id} className="flex justify-between items-center">
            <span>{website.url}</span>
            <Button
              variant="destructive"
              onClick={() => handleDeleteWebsite(website.id)}
              isLoading={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <EmbedCodeDialog websites={websites} />
    </div>
  );
}
