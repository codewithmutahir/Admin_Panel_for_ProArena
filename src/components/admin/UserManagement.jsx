// components/admin/UserManagement.jsx
"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Activity } from "lucide-react";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Firebase
import { db } from "@/lib/firebaseClient";
import { doc, updateDoc } from "firebase/firestore";

export default function UserManagement({
  users,
  filteredUsers,
  loadingUsers,
  searchQuery,
  setSearchQuery,
  toggleUserStatus,
  deleteUser,
}) {
  const [wonTournamentsMap, setWonTournamentsMap] = useState({});
  const [updatingUserId, setUpdatingUserId] = useState(null); // track only one user update
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Initialize map
  useEffect(() => {
    const initialMap = {};
    users.forEach((user) => {
      initialMap[user.id] = user.wonTournaments || 0;
    });
    setWonTournamentsMap(initialMap);
  }, [users]);

  const handleWonTournamentsChange = (userId, value) => {
    setWonTournamentsMap((prev) => ({
      ...prev,
      [userId]: value,
    }));
  };

  const handleUpdateWonTournaments = async (userId) => {
    const wonTournaments = wonTournamentsMap[userId] || 0;
    try {
      setUpdatingUserId(userId);
      await updateDoc(doc(db, "users", userId), {
        wonTournaments: wonTournaments,
      });
      setAlert({
        show: true,
        message: "Updated successfully!",
        type: "success",
      });
      setUpdatingUserId(null);
    } catch (error) {
      console.error("Error updating wonTournaments:", error);
      setAlert({
        show: true,
        message: "Failed to update.",
        type: "error",
      });
      setUpdatingUserId(null);
    }
  };

  return (
    <>
      {/* AlertDialog */}
      <AlertDialog
        open={alert.show}
        onOpenChange={() => setAlert((prev) => ({ ...prev, show: false }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alert.type === "success" ? "Success" : "Error"}
            </AlertDialogTitle>
            <AlertDialogDescription>{alert.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
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
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.isActive !== false).length}
                </p>
                <p className="text-sm text-slate-600">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.isActive === false).length}
                </p>
                <p className="text-sm text-slate-600">Inactive Users</p>
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
                <p className="text-2xl font-bold text-slate-900">
                  {
                    users.filter(
                      (u) =>
                        u.lastLoginAt &&
                        new Date(u.lastLoginAt.seconds * 1000) >
                          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </p>
                <p className="text-sm text-slate-600">Active This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">No Users Found</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((userData) => (
                <div
                  key={userData.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar & User Info */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={userData.photoURL} />
                      <AvatarFallback className="bg-slate-100">
                        {(userData.name || userData.email)
                          ?.charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {userData.inGameName || "Unnamed User"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4" />
                        {userData.email}
                      </div>
                      {userData.createdAt && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          Joined{" "}
                          {new Date(userData.createdAt).toLocaleDateString()}{" "}
                          {new Date(userData.createdAt).toLocaleTimeString()}
                        </div>
                      )}

                      {/* Won Tournaments Input */}
                      <div className="flex flex-col gap-1 mt-2">
                        <label className="text-xs text-slate-500">
                          Won Tournaments
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            value={wonTournamentsMap[userData.id] || 0}
                            onChange={(e) =>
                              handleWonTournamentsChange(
                                userData.id,
                                parseInt(e.target.value || 0, 10)
                              )
                            }
                            className="w-20"
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateWonTournaments(userData.id)
                            }
                            disabled={updatingUserId === userData.id}
                          >
                            {updatingUserId === userData.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Updating...
                              </>
                            ) : (
                              "Update"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Badge & Actions */}
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        userData.isActive !== false ? "default" : "secondary"
                      }
                      className={
                        userData.isActive !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {userData.isActive !== false ? "Active" : "Inactive"}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleUserStatus(userData.id, userData.isActive)
                          }
                        >
                          {userData.isActive !== false ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" /> Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteUser(userData.id)}
                          className="text-red-600"
                        >
                          <UserX className="h-4 w-4 mr-2" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
