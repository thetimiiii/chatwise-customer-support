import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X } from "lucide-react";
import { createEmbedClient } from "@/integrations/supabase/embed-client";
import { createEmbedChatService } from "@/services/embedChatService";
import { WebsiteConfig } from "@/integrations/supabase/types/website";

interface Message {
  content: string;
  isUser: boolean;
}

interface EmbedChatWidgetProps {
  websiteId: string;
  token: string;
}

export const EmbedChatWidget = ({
  websiteId,
  token,
}: EmbedChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<WebsiteConfig>({ 
    primaryColor: "#2563eb",
    preamble: "You are a helpful customer support agent. Be concise and friendly in your responses."
  });

  // Create Supabase client and chat service
  const supabase = createEmbedClient(websiteId, token);
  const chatService = createEmbedChatService(supabase);

  // Subscribe to config changes
  useEffect(() => {
    // Initial fetch
    const fetchConfig = async () => {
      try {
        const { data: website, error } = await supabase
          .from('websites')
          .select('config')
          .eq('id', websiteId)
          .single();

        if (error) throw error;
        if (website?.config) setConfig(website.config);
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };

    fetchConfig();

    // Subscribe to changes
    const subscription = supabase
      .channel('public:websites')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'websites',
          filter: `id=eq.${websiteId}`,
        },
        (payload: any) => {
          console.log('Config updated:', payload.new.config);
          if (payload.new.config) {
            setConfig(payload.new.config);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [websiteId, supabase]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { content: userMessage, isUser: true }]);

    try {
      const response = await chatService.getChatResponse(userMessage, websiteId);
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
              onClick={() => setIsOpen(false)}
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
