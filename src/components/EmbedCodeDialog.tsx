import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { Website } from "@/integrations/supabase/types/website"

interface EmbedCodeDialogProps {
  website: Website
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EmbedCodeDialog = ({ website, open, onOpenChange }: EmbedCodeDialogProps) => {
  const { toast } = useToast();

  const embedCode = `<!-- Chatwise Widget -->
<script>
  window.ChatwiseWidget = {
    websiteId: "${website.id}",
    token: "${website.embed_token}",
    config: ${JSON.stringify(website.config, null, 2)},
    host: "${process.env.NEXT_PUBLIC_APP_URL || 'https://simplesupportbot.com'}"
  };
</script>
<script async src="${process.env.NEXT_PUBLIC_APP_URL || 'https://simplesupportbot.com'}/widget.js"></script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast({
        title: "Copied!",
        description: "Widget code copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Embed Chat Widget</DialogTitle>
          <DialogDescription>
            Copy this code and paste it into your website where you want the chat widget to appear.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-[300px] text-sm">
            <code>{embedCode}</code>
          </pre>
        </div>
        <DialogFooter>
          <Button onClick={copyToClipboard}>
            Copy Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};