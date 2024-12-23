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
    // Format URL if needed
    const formattedUrl = !demoUrl.startsWith('http') ? `https://${demoUrl}` : demoUrl;
    console.log('Formatted URL:', formattedUrl);

    console.log('Attempting to sign in as test user...');
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'your-verified-password', // Replace with actual password
    });

    if (signInError) {
      console.error('Auth error details:', {
        message: signInError.message,
        status: signInError.status,
        name: signInError.name,
        details: signInError
      });
      throw signInError;
    }

    console.log('Auth successful:', authData);

    if (!authData.user) {
      console.error('No user data returned after successful auth');
      throw new Error('No user data returned');
    }

    console.log('Creating website entry...');
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .insert({
        url: formattedUrl,
        name: 'Demo Website',
        user_id: authData.user.id,
        config: {
          primaryColor: "#2563eb",
          preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
        }
      })
      .select()
      .single();

    if (websiteError) {
      console.error('Website creation error:', {
        message: websiteError.message,
        details: websiteError
      });
      throw websiteError;
    }

    console.log('Website created successfully:', website);

    setWebsiteId(website.id);
    setShowChat(true);
    
    toast({
      title: "Demo ready!",
      description: "Click the chat button in the bottom right to try it out.",
    });
  } catch (error) {
    console.error("Full error details:", {
      error,
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error)
    });
    
    toast({
      title: "Error setting up demo",
      description: error instanceof Error ? error.message : "Please try again later.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

// Add session debugging in useEffect
useEffect(() => {
  const checkUser = async () => {
    console.log('Checking current session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('Session check results:', {
      session: session,
      error: error
    });

    if (session) {
      console.log('Active session found, redirecting to dashboard');
      navigate("/dashboard");
    }
  };
  checkUser();
}, [navigate]);
