import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChatWidget } from "@/components/ChatWidget";
import { EmbedCodeGenerator } from "@/components/EmbedCodeGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HexColorPicker } from "react-colorful";

const Demo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [preamble, setPreamble] = useState(
    "You are a helpful customer support agent. Be concise and friendly in your responses."
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No authenticated session");
      }

      console.log('Creating website for user:', session.user.id);
      const { data: website, error: websiteError } = await supabase
        .from('websites')
        .insert({
          user_id: session.user.id,
          url: url,
          name: 'Demo Website',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (websiteError) {
        console.error('Error creating website:', websiteError);
        throw websiteError;
      }

      setWebsiteId(website.id);
      toast({
        title: "Success",
        description: "Website created successfully",
      });
    } catch (error) {
      console.error('Error in setup:', error);
      toast({
        title: "Error",
        description: "Failed to create website. Please try again.",
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
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Setup Website</h2>
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
                {isLoading ? "Creating..." : "Create Website"}
              </Button>
            </form>
          </div>

          {websiteId && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Customize Chat Widget</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chat Bot Preamble
                    </label>
                    <textarea
                      value={preamble}
                      onChange={(e) => setPreamble(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

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
      {websiteId && (
        <ChatWidget 
          websiteId={websiteId} 
          primaryColor={primaryColor}
          preamble={preamble}
        />
      )}
    </div>
  );
};

export default Demo;
