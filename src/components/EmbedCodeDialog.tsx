import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Website } from "@/integrations/supabase/types/website";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://chatwise-customer-support.vercel.app";

interface EmbedCodeDialogProps {
  website: Website;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmbedCodeDialog = ({ website, open, onOpenChange }: EmbedCodeDialogProps) => {
  const { toast } = useToast();

  const embedCode = `<!-- Chatwise Support Widget -->
<script>
  (function() {
    // Initialize widget configuration
    window.ChatwiseWidget = {
      websiteId: '${website.id}',
      token: '${website.embed_token}',
      config: ${JSON.stringify(website.config || {
        primaryColor: '#2563eb',
        preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
      })},
      host: '${APP_URL}'
    };

    // Load widget script
    var script = document.createElement('script');
    script.src = '${APP_URL}/widget.js';
    script.async = true;
    document.head.appendChild(script);

    // Load widget styles
    var link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  })();
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Embed Code for {website.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">
              <code>{embedCode}</code>
            </pre>
          </div>
          <Button onClick={copyToClipboard} className="w-full">
            Copy Embed Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};