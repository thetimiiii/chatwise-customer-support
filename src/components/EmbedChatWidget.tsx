"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Website } from "@/types/website"
import { ChatWidget } from './chat/ChatWidget';

interface EmbedChatWidgetProps {
  website: Website;
}

export function EmbedChatWidget({ website }: EmbedChatWidgetProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

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
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Widget code copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard.",
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
              <code>{embedCode}</code>
            </pre>
          </div>
          <div className="relative h-[600px] border rounded-lg bg-white p-4">
            <ChatWidget
              websiteId={website.id}
              token={website.embed_token}
              config={website.config}
              host={process.env.NEXT_PUBLIC_APP_URL || 'https://simplesupportbot.com'}
            />
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
