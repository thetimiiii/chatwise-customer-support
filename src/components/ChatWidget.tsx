import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HexColorPicker } from "react-colorful";
import { WebsiteConfig } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

interface ChatWidgetProps {
  websiteId: string;
  onClose?: () => void;
}

export const ChatWidget = ({ websiteId }: ChatWidgetProps) => {
  const [color, setColor] = useState("#2563eb");
  const [url, setUrl] = useState("");
  const [showExportCode, setShowExportCode] = useState(false);
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
            <label className="block text-sm font-medium mb-2">Website URL</label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full"
            />
          </div>

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

          <Button 
            onClick={() => setShowExportCode(true)}
            className="w-full"
          >
            Generate Export Code
          </Button>
        </div>
      </Card>

      {showExportCode && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Export Code</h3>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{generateEmbedCode()}</code>
          </pre>
          <Button 
            onClick={handleCopyCode}
            className="mt-4"
          >
            Copy to Clipboard
          </Button>
        </Card>
      )}
    </div>
  );
};