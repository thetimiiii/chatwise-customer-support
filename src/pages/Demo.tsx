import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChatWidget } from "@/components/ChatWidget";
import { EmbedCodeGenerator } from "@/components/EmbedCodeGenerator";

const Demo = () => {
  const navigate = useNavigate();
  const demoWebsiteId = "00000000-0000-0000-0000-000000000000";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Live Demo</h1>
            <Button onClick={() => navigate("/")} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Try our AI Chat Support</h2>
            <p className="text-gray-600 mb-4">Click the chat button in the bottom right corner to test the widget.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Embed on Your Website</h2>
            <p className="text-gray-600 mb-4">Copy and paste this code snippet into your website's HTML to add the chat widget:</p>
            <EmbedCodeGenerator websiteId={demoWebsiteId} />
          </div>
        </div>
      </main>
      <ChatWidget websiteId={demoWebsiteId} />
    </div>
  );
};

export default Demo;