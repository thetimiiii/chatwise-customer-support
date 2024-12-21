import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Customer support powered by AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Add intelligent chat support to your website in minutes. Our AI learns from your content
              and handles customer inquiries 24/7.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                onClick={() => navigate("/dashboard")}
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
              >
                Get started
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/demo")}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Live demo <span aria-hidden="true">→</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Deploy faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to launch AI support
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    name: "Simple Integration",
    description: "Add our chat widget to your website with a single line of code. No complex setup required.",
  },
  {
    name: "AI-Powered Responses",
    description: "Our AI learns from your website content to provide accurate, contextual responses to customer queries.",
  },
  {
    name: "24/7 Availability",
    description: "Provide instant support to your customers around the clock, reducing response times and improving satisfaction.",
  },
];

export default Index;