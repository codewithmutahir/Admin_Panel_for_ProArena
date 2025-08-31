// components/admin/DashboardOverview.jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "../ui/skeleton";
import { Users, UserCheck, Trophy, Activity, LogOut } from "lucide-react";

export default function DashboardOverview({
  users,
  tournaments,
  setActiveTab,
  setShowAddTournament,
  handleLogout,
}) {
  return (
    <div>
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {users.length || <Skeleton className="h-6 w-12" />}
                </div>
                <p className="text-sm text-slate-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.isActive !== false).length || (
                    <Skeleton className="h-6 w-12" />
                  )}
                </div>
                <p className="text-sm text-slate-600">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {tournaments.length || <Skeleton className="h-6 w-12" />}
                </div>
                <p className="text-sm text-slate-600">Total Tournaments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {tournaments.filter((t) => t.isActive).length || (
                    <Skeleton className="h-6 w-12" />
                  )}
                </div>
                <p className="text-sm text-slate-600">Active Tournaments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Perform common admin tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setActiveTab("tournaments");
              setShowAddTournament(true);
            }}
          >
            <Trophy className="h-4 w-4 mr-2" /> Create New Tournament
          </Button>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
