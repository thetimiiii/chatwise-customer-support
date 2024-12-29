import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Your application's base URL (replace with your actual URL in production)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chatwise-customer-support.vercel.app';

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
  window.ChatwiseWidget = {
    websiteId: '${websiteId}',
    token: '${website.embed_token}',
    config: ${JSON.stringify(website.config || {})},
    host: '${APP_URL}'
  };
</script>
<script async src="${APP_URL}/widget.js"></script>`;
      
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