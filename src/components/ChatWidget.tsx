import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HexColorPicker } from "react-colorful";
import { WebsiteConfig } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export interface ChatWidgetProps {
  websiteId: string;
  primaryColor?: string;
  preamble?: string;
  onClose?: () => void;
}

export const ChatWidget = ({ 
  websiteId, 
  primaryColor = "#2563eb",
  preamble = "You are a helpful customer support agent. Be concise and friendly in your responses.",
  onClose 
}: ChatWidgetProps) => {
  const [color, setColor] = useState(primaryColor);
  const [prompt, setPrompt] = useState(preamble);
  const { toast } = useToast();

  const generateEmbedCode = () => {
    return `<!-- Lovable Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = "${window.location.origin}/widget.js";
    script.setAttribute('data-website-id', '${websiteId}');
    script.setAttribute('data-token', '${websiteId}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    toast({
      title: "Code copied!",
      description: "The embed code has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6 p-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Chat Widget</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <HexColorPicker color={color} onChange={setColor} />
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Chat Bot Preamble</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>

          <Button 
            onClick={handleCopyCode}
            className="w-full"
          >
            Copy Embed Code
          </Button>
        </div>
      </Card>
    </div>
  );
};