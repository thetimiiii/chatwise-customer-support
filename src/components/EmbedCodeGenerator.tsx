import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        toast({
          title: "Error",
          description: "Failed to generate embed code",
          variant: "destructive",
        });
        return;
      }

      const code = `<script>
  (function(w,d,s,id,t) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "${window.location.origin}/widget.js";
    js.setAttribute('data-website-id', '${websiteId}');
    js.setAttribute('data-token', '${website.embed_token}');
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'cs-chat-widget'));
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
        <pre className="text-sm overflow-x-auto">
          <code>{embedCode}</code>
        </pre>
      </div>
      <Button onClick={copyToClipboard}>
        Copy Embed Code
      </Button>
    </div>
  );
};