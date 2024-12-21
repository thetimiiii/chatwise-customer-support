import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChatWidget } from "@/components/ChatWidget";
import { EmbedCodeGenerator } from "@/components/EmbedCodeGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Demo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First create a demo profile if it doesn't exist
      const { data: profile } = await supabase
        .from('profiles')
        .upsert({
          id: '00000000-0000-0000-0000-000000000000',
          credits_remaining: 999999
        })
        .select()
        .single();

      // Then create the demo website
      const { data: website, error } = await supabase
        .from('websites')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          url: url,
          name: 'Demo Website'
        })
        .select()
        .single();

      if (error) throw error;

      setWebsiteId(website.id);
      toast({
        title: "Success",
        description: "Demo website created successfully",
      });
    } catch (error) {
      console.error('Error creating demo website:', error);
      toast({
        title: "Error",
        description: "Failed to create demo website",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Live Demo</h1>
            <Button onClick={() => navigate("/")} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Setup Demo Website</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  Website URL
                </label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Demo Website"}
              </Button>
            </form>
          </div>

          {websiteId && (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Try our AI Chat Support</h2>
                <p className="text-gray-600 mb-4">
                  Click the chat button in the bottom right corner to test the widget.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Embed on Your Website</h2>
                <p className="text-gray-600 mb-4">
                  Copy and paste this code snippet into your website's HTML to add the chat widget:
                </p>
                <EmbedCodeGenerator websiteId={websiteId} />
              </div>
            </>
          )}
        </div>
      </main>
      {websiteId && <ChatWidget websiteId={websiteId} />}
    </div>
  );
};

export default Demo;