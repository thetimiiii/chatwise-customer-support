import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Zap, Shield, ArrowDown } from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";

const NavSection = () => (
  <div className="w-full border-t border-b py-4 bg-white/80">
    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">This is called chatly</div>
      <div className="text-sm text-gray-600">Log in or sign up but not try demo</div>
    </div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demoUrl, setDemoUrl] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [websiteId, setWebsiteId] = useState("");
  const [showSection2, setShowSection2] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleTryDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoUrl) {
      toast({
        title: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    setShowSection2(true);

    try {
      const { data: website, error } = await supabase
        .from('websites')
        .insert({
          user_id: 'test@test.com',
          url: demoUrl,
          name: 'Demo Website',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setWebsiteId(website.id);
      setShowChat(true);
      toast({
        title: "Demo ready!",
        description: "Click the chat button in the bottom right to try it out.",
      });
    } catch (error) {
      toast({
        title: "Error setting up demo",
        description: "Fix this error with the demo. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <nav className="fixed w-full top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 font-bold text-2xl bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              Lovable
            </div>
            <div className="flex gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate("/demo")}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Try Demo
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <NavSection />

      <main className="pt-20">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56 text-center">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
              <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"/>
            </div>
            
            <div className="mb-32">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
                <span className="block mb-4">We don't talk much,</span>
                <span className="block bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                  but our bot does
                </span>
              </h1>
            </div>
            
            <form onSubmit={handleTryDemo} className="max-w-xl mx-auto relative mt-32">
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                <ArrowDown className="h-12 w-12 text-primary animate-bounce" />
              </div>
              <div className="flex gap-3">
                <Input
                  type="url"
                  placeholder="Enter your website URL"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="flex-1 h-12 text-lg shadow-lg focus:ring-2 focus:ring-primary/20"
                />
                <Button 
                  type="submit"
                  className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Try it out
                </Button>
              </div>
            </form>

            {showSection2 && (
              <div className="mt-32 p-8 bg-white rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Section Two</h2>
                <div className="flex gap-3">
                  <Input
                    type="url"
                    placeholder="Move the input bar from section one to two"
                    className="flex-1 h-12 text-lg"
                  />
                  <Button className="h-12 px-8 text-lg bg-primary">
                    Try it out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the code remains the same */}
        
        {showChat && websiteId && (
          <ChatWidget 
            websiteId={websiteId}
            primaryColor="#2563eb"
            preamble="You are a helpful customer support agent. Be concise and friendly in your responses."
          />
        )}
      </main>
    </div>
  );
};

export default Index;
