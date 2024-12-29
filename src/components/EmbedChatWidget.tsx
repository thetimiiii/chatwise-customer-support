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
import { useToast } from "@/hooks/use-toast"
import type { WebsiteConfig } from "@/types/website"

interface EmbedChatWidgetProps {
  websiteId: string
  token: string
}

function generateEmbedCode(websiteId: string, token: string, config: WebsiteConfig) {
  return `<!-- Chatwise Support Widget -->
<div id="chatwise-container"></div>
<script>
  // First define the config
  var ChatwiseConfig = {
    websiteId: '${websiteId}',
    token: '${token}',
    primaryColor: '${config.primaryColor}',
    preamble: '${config.preamble}',
    host: 'https://simplesupportbot.com'
  };
  
  // Then set it globally
  Object.defineProperty(window, 'ChatwiseConfig', {
    value: ChatwiseConfig,
    writable: false,
    configurable: false
  });
</script>

<!-- Load widget after config is definitely set -->
<script defer>
  // Double check config exists
  if (!window.ChatwiseConfig) {
    throw new Error('Config not set!');
  }
  
  // Then load widget
  var script = document.createElement('script');
  script.src = 'https://simplesupportbot.com/widget.js';
  document.head.appendChild(script);
</script>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  #chatwise-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }
  #chatwise-container .chat-widget {
    font-family: 'Inter', sans-serif;
  }
  #chatwise-container .chat-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  #chatwise-container .chat-window {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }
  #chatwise-container .chat-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  #chatwise-container .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
  #chatwise-container .chat-input {
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;
  }
  #chatwise-container .input-field {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    outline: none;
  }
  #chatwise-container .send-button {
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  #chatwise-container .message {
    margin: 8px 0;
    padding: 8px 12px;
    border-radius: 8px;
    max-width: 80%;
  }
  #chatwise-container .bot-message {
    background: #f3f4f6;
    margin-right: auto;
  }
  #chatwise-container .user-message {
    color: white;
    margin-left: auto;
  }
  #chatwise-container .hidden {
    display: none;
  }
</style>`;
}

export function EmbedChatWidget({ websiteId, token }: EmbedChatWidgetProps) {
  const { toast } = useToast()
  const [primaryColor, setPrimaryColor] = useState("#2563eb")
  const [copied, setCopied] = useState(false)

  const config: WebsiteConfig = {
    primaryColor,
    preamble: 'You are a helpful customer support agent. Be concise and friendly in your responses.',
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode(websiteId, token, config))
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
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
              <code>{generateEmbedCode(websiteId, token, config)}</code>
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
