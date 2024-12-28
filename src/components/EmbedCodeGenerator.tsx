import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EmbedCodeGenerator = ({ websiteId }: { websiteId: string }) => {
  const [embedCode, setEmbedCode] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchEmbedToken = async () => {
      // Fetch both the embed token and website configuration
      const { data: website, error } = await supabase
        .from('websites')
        .select('embed_token, config')
        .eq('id', websiteId)
        .single();
      
      if (error) {
        console.error('Error fetching embed token:', error);
        toast({
          title: "Error",
          description: "Failed to generate embed code",
          variant: "destructive",
        });
        return;
      }

      const code = `<!-- Chatwise Support Widget -->
<script>
  (function() {
    // Initialize widget configuration
    window.ChatwiseWidget = {
      websiteId: '${websiteId}',
      token: '${website.embed_token}',
      config: ${JSON.stringify(website.config || {})},
      host: window.location.protocol + '//' + window.location.host
    };

    // Load widget script
    var script = document.createElement('script');
    script.src = window.ChatwiseWidget.host + "/widget.js";
    script.async = true;
    document.head.appendChild(script);

    // Load widget styles
    var link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  })();
</script>`;
      
      setEmbedCode(code);
    };

    fetchEmbedToken();
  }, [websiteId, toast]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <pre className="whitespace-pre-wrap text-sm">{embedCode}</pre>
      </div>
      <Button onClick={copyToClipboard}>Copy Embed Code</Button>
    </div>
  );
};