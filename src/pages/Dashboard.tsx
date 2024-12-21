import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Websites</h1>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Website
            </Button>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for website cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-sm font-medium text-gray-500">No websites yet</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">Add your first website</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;