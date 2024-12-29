"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface EmbedChatWidgetProps {
  websiteId: string
  token: string
}

export function EmbedChatWidget({ websiteId, token }: EmbedChatWidgetProps) {
  const [primaryColor, setPrimaryColor] = useState("#2563eb")
  const [copied, setCopied] = useState(false)

  const generateEmbedCode = () => {
    return `<!-- Add this container div -->
<div id="chatwise-container"></div>

<!-- Updated Chatwise Support Widget -->
<script>
    // Set up configuration before loading any scripts
    window.ChatwiseConfig = {
        websiteId: '${websiteId}',
        token: '${token}',
        primaryColor: '${primaryColor}',
        preamble: 'You are a helpful customer support agent. Be concise and friendly in your responses.',
        host: 'https://simplesupportbot.com'
    };

    // Function to load the widget
    function loadChatwiseWidget() {
        // Load widget script
        const script = document.createElement('script');
        script.src = 'https://simplesupportbot.com/widget.js';
        script.async = true;
        script.onerror = () => console.error('Failed to load widget script');
        script.onload = () => console.log('Widget script loaded successfully');
        document.head.appendChild(script);

        // Load styles
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    // Load widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadChatwiseWidget);
    } else {
        loadChatwiseWidget();
    }
</script>

<!-- Debug logging -->
<script>
    // Debug logging
    console.log('Before initialization:', window.ChatwiseConfig);
    
    // Monitor ChatwiseConfig
    let configValue = window.ChatwiseConfig;
    Object.defineProperty(window, 'ChatwiseConfig', {
        get: function() {
            console.log('Reading ChatwiseConfig:', configValue);
            return configValue;
        },
        set: function(newValue) {
            console.log('Setting ChatwiseConfig:', newValue);
            configValue = newValue;
        }
    });
</script>`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

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
              <code>{generateEmbedCode()}</code>
            </pre>
          </div>
        </div>
        <Button onClick={copyToClipboard}>
          {copied ? "Copied!" : "Copy Code"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
