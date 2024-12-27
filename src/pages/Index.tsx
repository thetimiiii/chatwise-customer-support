import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatWidget } from "@/components/ChatWidget";

const Index = () => {
  const [demoUrl, setDemoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  const handleTryDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!demoUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a website URL to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sign in as test user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'sagertim02@gmail.com',
        password: 'Toff2002',
      });

      if (signInError || !authData.user) {
        throw new Error('Authentication failed');
      }

      // Create website entry
      const { data: website, error: websiteError } = await supabase
        .from('websites')
        .insert({
          url: demoUrl,
          name: 'Demo Website',
          user_id: authData.user.id,
          config: {
            primaryColor: "#2563eb",
            preamble: `You are a helpful customer support agent for ${demoUrl}. Be concise and friendly in your responses.`
          }
        })
        .select()
        .single();

      if (websiteError || !website) {
        throw new Error('Failed to create website entry');
      }

      setWebsiteId(website.id);
      setShowChat(true);
      
      toast({
        title: "Demo Ready",
        description: "Click the chat button in the bottom right corner to start chatting.",
      });
    } catch (error) {
      console.error("Demo setup failed:", error);
      toast({
        title: "Setup Failed",
        description: "Unable to set up the demo. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-grow pt-16">
        <div className="relative isolate px-6 pt-10 lg:px-8">
          <div className="mx-auto max-w-4xl py-24 sm:py-32 lg:py-40 text-center">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
              <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"/>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl mb-8">
              <span className="block mb-4">We don't talk much,</span>
              <span className="block bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                but our bot does
              </span>
            </h1>

            <div className="mt-12 mb-8 flex justify-center">
              <ArrowDown className="h-12 w-12 text-primary animate-bounce" />
            </div>
            
            <form onSubmit={handleTryDemo} className="max-w-xl mx-auto">
              <div className="flex gap-3">
                <Input
                  type="url"
                  placeholder="Enter your website URL"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="flex-1 h-12 text-lg shadow-lg focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
                <Button 
                  type="submit"
                  className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Setting up..." : "Try it out"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {websiteId && showChat && (
          <ChatWidget
            websiteId={websiteId}
            primaryColor="#2563eb"
            preamble={`You are a helpful customer support agent for ${demoUrl}. Be concise and friendly in your responses.`}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
