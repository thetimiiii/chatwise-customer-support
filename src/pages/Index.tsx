import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, MessageSquare, Zap, Shield, CheckCircle } from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demoUrl, setDemoUrl] = useState("");
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

  const handleSignUp = async () => {
    navigate("/signup");
  };

  const handleTryDemo = async (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 font-bold text-2xl bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              <a href="/" className="hover:opacity-80 transition-opacity">
                Chatly
              </a>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#highlights" className="text-gray-600 hover:text-gray-900">Highlights</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            </div>
            <div className="flex gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Login
              </Button>
              <Button
                onClick={handleSignUp}
                className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
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

const highlights = [
  {
    title: "Smart AI Integration",
    description: "Our advanced AI understands context and provides relevant responses to your customers' queries.",
  },
  {
    title: "Easy Setup",
    description: "Get started in minutes with our simple integration process. No coding required.",
  },
  {
    title: "Customizable",
    description: "Tailor the chat interface to match your brand's look and feel.",
  },
  {
    title: "Analytics Dashboard",
    description: "Track customer interactions and gain valuable insights into their needs.",
  },
  {
    title: "Multi-language Support",
    description: "Connect with customers globally with support for over 50 languages.",
  },
  {
    title: "Cost-effective",
    description: "Reduce support costs while maintaining high-quality customer service.",
  },
];

export default Index;