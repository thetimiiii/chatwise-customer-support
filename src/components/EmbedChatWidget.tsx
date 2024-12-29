"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface EmbedChatWidgetProps {
  websiteId: string;
  token: string;
}

export function EmbedChatWidget({ websiteId, token }: EmbedChatWidgetProps) {
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [copied, setCopied] = useState(false);

  const generateWidgetEmbedCode = () => {
    const config = {
      websiteId,
      token,
      primaryColor,
      preamble: 'You are a helpful customer support agent. Be concise and friendly in your responses.',
      host: 'https://simplesupportbot.com'
    };

    return `<!-- Add the container div -->
<div id="chatwise-container"></div>

<!-- Initialize the widget -->
<script>
    // Initialize configuration
    window.ChatwiseConfig = {
        websiteId: '${config.websiteId}',
        token: '${config.token}',
        primaryColor: '${config.primaryColor}',
        preamble: '${config.preamble}',
        host: '${config.host}'
    };

    // Load widget resources
    (function() {
        // Load styles
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '${config.host}/css/styles.css';
        document.head.appendChild(link);

        // Load widget script
        const script = document.createElement('script');
        script.src = '${config.host}/widget.js';
        script.async = true;
        document.head.appendChild(script);
    })();
</script>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateWidgetEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Embed Chat Widget</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Embed Chat Widget</DialogTitle>
          <DialogDescription>
            Add this code to your website to embed the chat widget. Place it right before the closing &lt;/body&gt; tag.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Input
              id="primaryColor"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Embed Code</Label>
            <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-[300px] text-sm">
              <code>{generateWidgetEmbedCode()}</code>
            </pre>
          </div>
        </div>
        <Button onClick={copyToClipboard}>
          {copied ? "Copied!" : "Copy Code"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
