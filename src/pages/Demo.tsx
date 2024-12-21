import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Demo = () => {
  const navigate = useNavigate();

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
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Chat widget coming soon</h2>
          <p className="mt-2 text-gray-600">Try out our AI-powered chat support</p>
        </div>
      </main>
    </div>
  );
};

export default Demo;