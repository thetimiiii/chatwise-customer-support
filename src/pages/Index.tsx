import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Zap, Shield } from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";

const AnimatedArrow = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="animate-bounce"
  >
    <defs>
      <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L12 18M12 18L8 14M12 18L16 14"
      stroke="url(#animatedGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demoUrl, setDemoUrl] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [websiteId, setWebsiteId] = useState("");

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

    try {
      const { data: website, error } = await supabase
        .from("websites")
        .insert({
          user_id: "00000000-0000-0000-0000-000000000000",
          url: demoUrl,
          name: "Demo Website",
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
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Enhanced Navigation */}
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

      <main className="pt-10">
        {/* Hero Section */}
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-16 sm:py-24 lg:py-28 text-center">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
              <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
            </div>

            <div className="mb-20">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
                <span className="block mb-4">We don't talk much,</span>
                <span className="block bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                  but our bot does
                </span>
              </h1>
            </div>

            <form onSubmit={handleTryDemo} className="max-w-xl mx-auto relative">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <AnimatedArrow />
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
          </div>
        </div>
      </main>

      {showChat && websiteId && (
        <ChatWidget
          websiteId={websiteId}
          primaryColor="#2563eb"
          preamble="You are a helpful customer support agent. Be concise and friendly in your responses."
        />
      )}
    </div>
  );
};

export default Index;
