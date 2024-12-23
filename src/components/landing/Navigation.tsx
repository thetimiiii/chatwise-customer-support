import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed w-full top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 font-bold text-2xl bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            <a href="/" className="hover:opacity-80 transition-opacity">
              Chatly
            </a>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#highlights" className="text-gray-600 hover:text-gray-900">Highlights</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
          </div>
          <div className="flex gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 px-6"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};