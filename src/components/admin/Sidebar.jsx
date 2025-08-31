// components/admin/Sidebar.jsx
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Users, Trophy, Settings, Shield, LogOut, Layers } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, user, handleLogout }) {
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "users", label: "Users", icon: Users },
    { id: "tournaments", label: "Tournaments", icon: Trophy },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "transactions", label: "Transactions", icon: Settings },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-slate-200 z-40">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === item.id
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user.displayName || "Admin User"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}