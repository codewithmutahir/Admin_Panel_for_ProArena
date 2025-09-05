// components/admin/Sidebar.jsx
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Users,
  Trophy,
  Settings,
  Shield,
  LogOut,
  Layers,
  Wallet,
  Smartphone,
} from "lucide-react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebaseClient";

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  handleLogout,
}) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = () => {
      try {
        const feedbackRef = collection(db, "feedback");
        const q = query(feedbackRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const feedbackData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || new Date(),
            }));

            setFeedbacks(feedbackData);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching feedbacks:", err);
            setError("Failed to load feedbacks");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up feedback listener:", err);
        setError("Failed to initialize feedback listener");
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const getFilteredFeedbacks = () => {
    let filtered = feedbacks;

    // Apply filter
    if (filter !== "all") {
      filtered = filtered.filter((feedback) => feedback.type === filter);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.timestamp) - new Date(a.timestamp);
        case "oldest":
          return new Date(a.timestamp) - new Date(b.timestamp);
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const stats = {
    total: feedbacks.length,
    unread: feedbacks.filter((f) => !f.isRead).length,
    averageRating:
      feedbacks.length > 0
        ? (
            feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
          ).toFixed(1)
        : 0,
    byType: {
      general: feedbacks.filter((f) => f.type === "general").length,
      bug: feedbacks.filter((f) => f.type === "bug").length,
      feature: feedbacks.filter((f) => f.type === "feature").length,
      complaint: feedbacks.filter((f) => f.type === "complaint").length,
    },
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "users", label: "Users", icon: Users },
    { id: "tournaments", label: "Tournaments", icon: Trophy },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "transactions", label: "Transactions", icon: Wallet },
    { id: "app-management", label: "App Management", icon: Smartphone },
    { id: "feedback", label: "Feedback Manager", icon: Trophy },
    // { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderMenuItem = (item) => {
    return (
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
    );
  };

  return (
    <div className="fixed inset-y-0 overflow-scroll left-0 w-64 bg-white shadow-lg border-r border-slate-200 z-40">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">ProArena Admin</h1>
          <p className="text-sm text-slate-500">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4 space-y-1 flex-1 overflow-y-auto">
        {sidebarItems.map(renderMenuItem)}
      </nav>

      {/* Quick Stats */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600"><a onClick={() => setActiveTab("feedback")}>Unread Feedback</a></span>
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {stats.unread}
            </span>
          </div>
        </div>
      </div>

      {/* User Info at Bottom */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
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
