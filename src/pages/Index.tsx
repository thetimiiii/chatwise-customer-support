import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, MessageSquare, Zap, Shield } from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <nav className="fixed w-full top-0 bg-white/80 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 font-bold text-xl">
              Lovable
            </div>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/demo")}
              >
                Try Demo
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-8">
              We don't talk much,
              <br />
              but our bot does
            </h1>
            
            <form onSubmit={handleTryDemo} className="max-w-md mx-auto relative">
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                <ArrowDown className="h-12 w-12 text-primary animate-bounce" />
              </div>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="Enter your website URL"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  Try it out
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">
                Instant Support
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need for 24/7 customer support
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col items-center text-center">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      {feature.icon}
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
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
    icon: <MessageSquare className="h-5 w-5 text-primary" />,
    description: "Provide instant support to your customers around the clock with our AI-powered chatbot.",
  },
  {
    name: "Lightning Fast",
    icon: <Zap className="h-5 w-5 text-primary" />,
    description: "Get immediate responses to customer queries without any delay.",
  },
  {
    name: "Secure & Reliable",
    icon: <Shield className="h-5 w-5 text-primary" />,
    description: "Enterprise-grade security with 99.9% uptime guarantee.",
  },
];

export default Index;