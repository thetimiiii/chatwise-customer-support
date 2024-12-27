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
  token?: string;
  onClose?: () => void;
  primaryColor?: string;
  preamble?: string;
}

export const ChatWidget = ({
  websiteId,
  token,
  onClose,
  primaryColor = "#2563eb",
  preamble = "You are a helpful customer support agent. Be concise and friendly in your responses.",
}: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<WebsiteConfig>({ primaryColor, preamble });
  const { toast } = useToast();

  // Fetch initial config if token is provided (embedded mode)
  useEffect(() => {
    if (token) {
      const fetchConfig = async () => {
        try {
          const response = await fetch(`/api/websites/${websiteId}/config?token=${token}`);
          if (!response.ok) {
            throw new Error('Failed to fetch website configuration');
          }
          const config = await response.json();
          setConfig(config);
        } catch (error) {
          console.error('Error fetching website config:', error);
        }
      };
      fetchConfig();
    } else {
      // In dashboard mode, use props directly
      setConfig({ primaryColor, preamble });
    }
  }, [websiteId, token, primaryColor, preamble]);

  // Update config in dashboard mode
  useEffect(() => {
    if (!token) {
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
    }
  }, [websiteId, primaryColor, preamble, token]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { content: userMessage, isUser: true }]);

    try {
      let response;
      if (token) {
        // Embedded mode - use API endpoint
        const apiResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, websiteId, token }),
        });
        
        if (!apiResponse.ok) throw new Error('Failed to send message');
        const data = await apiResponse.json();
        response = data.text;
      } else {
        // Dashboard mode - use direct service
        response = await getChatResponse(userMessage, websiteId);
      }

      setMessages((prev) => [...prev, { content: response, isUser: false }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { 
        content: 'I apologize, but I am having trouble responding right now. Please try again in a moment.',
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      <Button
        size="icon"
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: config.primaryColor }}
        className={`h-12 w-12 rounded-full shadow-lg ${!isOpen ? 'flex' : 'hidden'}`}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-[350px] h-[500px] flex flex-col border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Chat Support</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-3 rounded-lg ${
                  msg.isUser
                    ? 'ml-auto text-white rounded-br-sm'
                    : 'mr-auto bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
                style={{ backgroundColor: msg.isUser ? config.primaryColor : undefined }}
              >
                {msg.content}
              </div>
            ))}
          </div>

          <div className="p-4 border-t flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              style={{ backgroundColor: config.primaryColor }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
