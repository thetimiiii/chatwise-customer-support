import { Card } from "@/components/ui/card";
import { MessageSquare, Users, CreditCard, TrendingUp } from "lucide-react";

export const Overview = () => {
  const stats = [
    {
      title: "Chat Credits Used",
      value: "234",
      icon: MessageSquare,
      color: "bg-blue-100",
      iconColor: "text-blue-500"
    },
    {
      title: "Total Users",
      value: "1,234",
      icon: Users,
      color: "bg-green-100",
      iconColor: "text-green-500"
    },
    {
      title: "Revenue",
      value: "$2.4k",
      icon: CreditCard,
      color: "bg-purple-100",
      iconColor: "text-purple-500"
    },
    {
      title: "Conversion Rate",
      value: "12%",
      icon: TrendingUp,
      color: "bg-orange-100",
      iconColor: "text-orange-500"
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};