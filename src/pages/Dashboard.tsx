import { Button } from "@/components/ui/button";
import { PlusIcon, LogOutIcon, SunIcon, MoonIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [credits, setCredits] = useState(100);
  const [usedCredits, setUsedCredits] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch user profile and credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setCredits(profile.credits_remaining || 0);
      }

      // Fetch used credits from chat sessions
      const { count } = await supabase
        .from('chat_sessions')
        .select('id', { count: 'exact' })
        .eq('website_id', session.user.id);

      setUsedCredits(count || 0);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex gap-4 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="rounded-full"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
              <Button onClick={() => navigate("/demo")} variant="outline">
                Try Demo
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOutIcon className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Credits Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{credits}</div>
                  <Progress 
                    value={(credits / (credits + usedCredits)) * 100} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Chat Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usedCredits}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total conversations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Websites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate("/demo")}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Website
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demo">
            <Card>
              <CardHeader>
                <CardTitle>Try the Chat Widget</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/demo")}>
                  Open Demo Page
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="websites">
            <Card>
              <CardHeader>
                <CardTitle>Your Websites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You haven't added any websites yet
                  </p>
                  <Button onClick={() => navigate("/demo")}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Website
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    You are on the Free plan
                  </p>
                  <Button>
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Credits Used
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold">
                        {usedCredits}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Credits Remaining
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold">
                        {credits}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;