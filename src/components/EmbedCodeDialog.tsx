import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Website } from "@/integrations/supabase/types/website";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://simplesupportbot.com";

interface EmbedCodeDialogProps {
  website: Website;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmbedCodeDialog = ({ website, open, onOpenChange }: EmbedCodeDialogProps) => {
  const { toast } = useToast();

  const embedCode = `<!-- Chatwise Support Widget -->
<script>
  window.ChatwiseWidget = {
    websiteId: '${website.id}',
    token: '${website.embed_token}',
    config: ${JSON.stringify(website.config || {
      primaryColor: '#2563eb',
      preamble: "How can I help you today?"
    })},
    host: '${APP_URL}'
  };
</script>
<script async src="${APP_URL}/widget.js"></script>`;

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