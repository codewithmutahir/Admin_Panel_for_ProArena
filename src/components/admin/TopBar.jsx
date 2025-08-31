// components/admin/TopBar.jsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export default function TopBar({ activeTab }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 capitalize">
            {activeTab === "users" ? "User Management" : 
             activeTab === "tournaments" ? "Tournament Management" : activeTab}
          </h2>
          <p className="text-slate-600">
            {activeTab === "dashboard" && "Overview of your admin panel"}
            {activeTab === "users" && "Manage and monitor user accounts"}
            {activeTab === "tournaments" && "Manage and monitor tournaments"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Online
          </Badge>
        </div>
      </div>
    </header>
  );
}