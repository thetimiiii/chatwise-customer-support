import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Zap, Shield } from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";

const CurledArrow = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary animate-bounce">
    <path d="M24 36V12M24 36L18 30M24 36L30 30M24 12C20 12 16 16 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
        .from('websites')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          url: demoUrl,
          name: 'Demo Website',
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

      <main className="pt-20">
        {/* Hero Section */}
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56 text-center">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
              <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"/>
            </div>
            
            <div className="mb-16">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
                <span className="block mb-4">We don't talk much,</span>
                <span className="block bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                  but our bot does
                </span>
              </h1>
            </div>
            
            <form onSubmit={handleTryDemo} className="max-w-xl mx-auto relative">
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                <CurledArrow />
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

        {/* Features Section */}
        <div className="py-24 sm:py-32 bg-white/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-lg font-semibold leading-7 text-primary">
                Instant Support
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
                Everything you need for 24/7 customer support
              </p>
              <p className="text-lg text-gray-600">
                Empower your business with AI-driven customer support that never sleeps
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col items-center text-center group hover:transform hover:scale-105 transition-all duration-200">
                    <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-100/5 w-full h-full">
                      <dt className="flex items-center justify-center gap-x-3 text-xl font-semibold leading-7 text-gray-900 mb-4">
                        <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
                          {feature.icon}
                        </div>
                        {feature.name}
                      </dt>
                      <dd className="mt-4 text-base leading-7 text-gray-600">
                        {feature.description}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
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

const features = [
  {
    name: "24/7 Support",
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    description: "Provide instant support to your customers around the clock with our AI-powered chatbot.",
  },
  {
    name: "Lightning Fast",
    icon: <Zap className="h-6 w-6 text-primary" />,
    description: "Get immediate responses to customer queries without any delay.",
  },
  {
    name: "Secure & Reliable",
    icon: <Shield className="h-6 w-6 text-primary" />,
    description: "Enterprise-grade security with 99.9% uptime guarantee.",
  },
];

export default Index;
