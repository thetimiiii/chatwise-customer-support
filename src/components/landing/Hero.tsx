import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown } from "lucide-react";
import { useState } from "react";

interface HeroProps {
  onTryDemo: (demoUrl: string) => Promise<void>;
  isLoading: boolean;
}

export const Hero = ({ onTryDemo, isLoading }: HeroProps) => {
  const [demoUrl, setDemoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onTryDemo(demoUrl);
  };

  return (
    <div className="relative isolate px-6 pt-10 lg:px-8">
      <div className="mx-auto max-w-4xl py-24 sm:py-32 lg:py-40 text-center">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"/>
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl mb-8">
          <span className="block mb-4">We don't talk much,</span>
          <span className="block bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            but our bot does
          </span>
        </h1>

        <div className="mt-12 mb-8 flex justify-center">
          <ArrowDown className="h-12 w-12 text-primary animate-bounce" />
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="Enter your website URL"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="flex-1 h-12 text-lg shadow-lg focus:ring-2 focus:ring-primary/20"
              disabled={isLoading}
            />
            <Button 
              type="submit"
              className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Setting up..." : "Try it out"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};