import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EmbedCodeGenerator = ({ websiteId }: { websiteId: string }) => {
  const [embedCode, setEmbedCode] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchEmbedToken = async () => {
      const { data: website, error } = await supabase
        .from('websites')
        .select('embed_token')
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

      const code = `<!-- Lovable Chat Widget -->
<div id="lovable-chat-container"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = "${window.location.origin}/widget.js";
    script.setAttribute('data-website-id', '${websiteId}');
    script.setAttribute('data-token', '${website.embed_token}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;
      
      setEmbedCode(code);
    };

    fetchEmbedToken();
  }, [websiteId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
          <code>{embedCode}</code>
        </pre>
      </div>
      <Button onClick={copyToClipboard}>
        Copy Embed Code
      </Button>
    </div>
  );
};