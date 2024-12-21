import { useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ChatWidgets } from "./Dashboard/ChatWidgets";
import { Overview } from "./Dashboard/Overview";

const Analytics = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Analytics</h2>
    {/* Add analytics content here */}
  </div>
);

const Billing = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Billing</h2>
    {/* Add billing content here */}
  </div>
);

const Export = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Export</h2>
    {/* Add export content here */}
  </div>
);

const Settings = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Settings</h2>
    {/* Add settings content here */}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/widgets" element={<ChatWidgets />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/export" element={<Export />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
