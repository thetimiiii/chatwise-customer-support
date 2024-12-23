import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, X } from "lucide-react";
import { getChatResponse } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteConfig } from "@/integrations/supabase/types/website";

interface Message {
  content: string;
  isUser: boolean;
}

interface ChatWidgetProps {
  websiteId: string;
  onClose?: () => void;
  primaryColor?: string;
  preamble?: string;
}

export const ChatWidget = ({
  websiteId,
  onClose,
  primaryColor = "#2563eb",
  preamble = "You are a helpful customer support agent. Be concise and friendly in your responses.",
}: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const broadcastConfig = () => {
      console.log("Broadcasting config update:", { primaryColor, preamble });
      window.postMessage(
        {
          type: "lovable-chat-config-update",
          config: {
            primaryColor,
            preamble,
          } satisfies WebsiteConfig,
        },
        "*"
      );
    };

    broadcastConfig();

    const updateConfig = async () => {
      try {
        const { error } = await supabase
          .from("websites")
          .update({
            config: { primaryColor, preamble } satisfies WebsiteConfig,
          })
          .eq("id", websiteId);

        if (error) {
          console.error("Error updating chat config:", error);
          throw error;
        }
      } catch (error) {
        console.error("Error updating chat config:", error);
      }
    };

    updateConfig();
  }, [websiteId, primaryColor, preamble]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { content: message, isUser: true }]);
      setMessage("");

      const response = await getChatResponse(message, websiteId);
      setMessages((prev) => [...prev, { content: response, isUser: false }]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error instanceof Error && error.message === "No credits remaining"
          ? "This website has run out of chat credits. Please contact the website owner."
          : "Failed to send message. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages((prev) => [
        ...prev,
        {
          content: errorMessage,
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0"
        style={{ backgroundColor: primaryColor }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-900">Chat Support</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.isUser ? "text-white" : "bg-gray-100 text-gray-900"
              }`}
              style={{ backgroundColor: msg.isUser ? primaryColor : undefined }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: primaryColor }}
            className="text-white px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
