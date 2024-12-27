import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Website } from "@/integrations/supabase/types/website";

interface EmbedCodeDialogProps {
  website: Website;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmbedCodeDialog = ({ website, open, onOpenChange }: EmbedCodeDialogProps) => {
  const { toast } = useToast();

  const embedCode = `<!-- Lovable Chat Widget -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = "${window.location.origin}/widget.js";
    script.setAttribute('data-website-id', '${website.id}');
    script.setAttribute('data-token', '${website.embed_token}');
    script.async = true;
    document.head.appendChild(script);
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
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