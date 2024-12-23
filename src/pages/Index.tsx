import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatWidget } from "@/components/ChatWidget";
import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { features, highlights } from "@/data/landing";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showChat, setShowChat] = useState(false);
  const [websiteId, setWebsiteId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleTryDemo = async (demoUrl: string) => {
    if (!demoUrl) {
      toast({
        title: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, try to sign in as test user
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@test.com',
        password: 'test123',
      });

      if (signInError) throw signInError;
      if (!user) throw new Error('Failed to get user after sign in');

      console.log('Signed in as test user:', user.id);

      // Then create the website entry
      const { data: website, error: websiteError } = await supabase
        .from('websites')
        .insert({
          url: demoUrl,
          name: 'Demo Website',
          user_id: user.id,
          config: {
            primaryColor: "#2563eb",
            preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
          }
        })
        .select()
        .single();

      if (websiteError) throw websiteError;

      setWebsiteId(website.id);
      setShowChat(true);
      toast({
        title: "Demo ready!",
        description: "Click the chat button in the bottom right to try it out.",
      });
    } catch (error) {
      console.error("Error setting up demo:", error);
      toast({
        title: "Error setting up demo",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <Navigation />

      <main className="flex-grow pt-16">
        <Hero onTryDemo={handleTryDemo} isLoading={isLoading} />

        {/* Features Section */}
        <div id="features" className="py-24 sm:py-32 bg-white/80 backdrop-blur-md">
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
                          <feature.icon className="h-6 w-6 text-primary" />
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

        {/* Highlights Section */}
        <div id="highlights" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
              <h2 className="text-lg font-semibold leading-7 text-primary">
                Why Choose Us
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Trusted by Leading Companies
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-lg">{highlight.title}</h3>
                  </div>
                  <p className="text-gray-600">{highlight.description}</p>
                </div>
              ))}
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

export default Index;
