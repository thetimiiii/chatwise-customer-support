"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Website } from "@/types/website"

interface EmbedChatWidgetProps {
  website: Website;
}

function generateEmbedCode(website: Website) {
  return `<!-- Chatwise Support Widget -->
<script>
  (function() {
    // Initialize widget configuration
    window.ChatwiseWidget = {
      websiteId: '${website.id}',
      token: '${website.embed_token}',
      config: ${JSON.stringify(website.config)},
      host: 'https://simplesupportbot.com'
    };

    // Load widget script
    var script = document.createElement('script');
    script.src = 'https://simplesupportbot.com/widget.js';
    script.async = true;
    document.head.appendChild(script);

    // Load widget styles
    var link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  })();
</script>`;
}

export function EmbedChatWidget({ website }: EmbedChatWidgetProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode(website))
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: "Error",
        description: "Failed to copy embed code",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Get Embed Code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Embed Chat Widget</DialogTitle>
          <DialogDescription>
            Copy this code and paste it into your website where you want the chat widget to appear.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Embed Code</Label>
            <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-[300px] text-sm">
              <code>{generateEmbedCode(website)}</code>
            </pre>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={copyToClipboard}>
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
