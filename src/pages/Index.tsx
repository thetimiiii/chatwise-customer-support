const handleTryDemo = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!demoUrl) {
    toast({
      title: "Invalid URL",
      description: "Please enter a website URL to continue",
      variant: "destructive",
    });
    return;
  }

  // Validate URL format
  try {
    new URL(demoUrl);
  } catch {
    toast({
      title: "Invalid URL format",
      description: "Please enter a valid URL (e.g., https://example.com)",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);

  try {
    console.log("Starting demo setup for URL:", demoUrl);

    // Step 1: Sign in as test user
    console.log("Attempting to sign in as test user...");
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'test123',
    });

    if (signInError) {
      console.error("Auth error details:", {
        message: signInError.message,
        status: signInError.status,
        name: signInError.name
      });
      throw new Error(`Authentication failed: ${signInError.message}`);
    }

    if (!authData.user) {
      console.error("No user data received after successful auth");
      throw new Error('Failed to get user data after authentication');
    }

    console.log("Successfully signed in as test user:", authData.user.id);

    // Step 2: Check if website already exists
    console.log("Checking for existing website entry...");
    const { data: existingWebsite, error: existingError } = await supabase
      .from('websites')
      .select('id')
      .eq('url', demoUrl)
      .eq('user_id', authData.user.id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error("Error checking existing website:", existingError);
      throw new Error(`Database query failed: ${existingError.message}`);
    }

    let websiteId;

    if (existingWebsite) {
      console.log("Found existing website entry:", existingWebsite.id);
      websiteId = existingWebsite.id;
    } else {
      // Step 3: Create new website entry
      console.log("Creating new website entry...");
      const { data: website, error: websiteError } = await supabase
        .from('websites')
        .insert({
          url: demoUrl,
          name: 'Demo Website',
          user_id: authData.user.id,
          config: {
            primaryColor: "#2563eb",
            preamble: `You are a helpful customer support agent for the website ${demoUrl}. Be concise and friendly in your responses.`
          }
        })
        .select()
        .single();

      if (websiteError) {
        console.error("Website creation error:", {
          message: websiteError.message,
          code: websiteError.code,
          details: websiteError.details
        });
        throw new Error(`Failed to create website entry: ${websiteError.message}`);
      }

      console.log("Successfully created website entry:", website.id);
      websiteId = website.id;
    }

    // Step 4: Verify credits
    console.log("Checking available credits...");
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error("Error checking credits:", profileError);
      throw new Error(`Failed to check credits: ${profileError.message}`);
    }

    if (!profile || profile.credits_remaining <= 0) {
      console.error("No credits available:", profile);
      throw new Error('No chat credits available for the demo');
    }

    console.log("Credits available:", profile.credits_remaining);

    // Step 5: Setup successful
    setWebsiteId(websiteId);
    setShowChat(true);
    toast({
      title: "Demo Ready!",
      description: "Click the chat button in the bottom right corner to start chatting.",
    });

  } catch (error) {
    console.error("Demo setup failed:", error);
    
    // Provide specific error messages based on the error type
    let errorTitle = "Setup Failed";
    let errorDescription = "An unexpected error occurred.";

    if (error instanceof Error) {
      if (error.message.includes("Authentication failed")) {
        errorTitle = "Authentication Error";
        errorDescription = "The demo system is currently unavailable. Please try again later.";
      } else if (error.message.includes("No chat credits")) {
        errorTitle = "No Credits Available";
        errorDescription = "The demo account has run out of credits. Please try again later.";
      } else if (error.message.includes("Failed to create website")) {
        errorTitle = "Website Registration Failed";
        errorDescription = "Unable to register the website for demo. Please check the URL and try again.";
      }
    }

    toast({
      title: errorTitle,
      description: errorDescription,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
