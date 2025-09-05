// components/admin/Dashboard.jsx
"use client";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import DashboardOverview from "@/components/admin/DashboardOverview";
import UserManagement from "@/components/admin/UserManagement";
import TournamentManagement from "@/components/admin/TournamentManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import Transactions from "@/components/admin/Transactions";
import { serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import MoreScreenManager from '../../components/admin/MoreScreenManager';
import FeedbackManger from '../../components/admin/FeedbackManager';

const auth = getAuth();
const db = getFirestore();

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddTournament, setShowAddTournament] = useState(false);

  console.log("🏠 Dashboard rendered - user:", !!user, "loading:", loading);

  useEffect(() => {
    console.log("🔍 Dashboard useEffect - user:", !!user, "loading:", loading);
    if (!loading && !user) {
      console.log("❌ No user found, redirecting to login...");
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        console.log("📊 Fetching users from Firestore...");
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("✅ Users fetched:", userList.length);
        setUsers(userList);
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [user]);

  // Fetch tournaments from Firestore
  useEffect(() => {
    const fetchTournaments = async () => {
      if (!user) return;
      try {
        console.log("🏆 Fetching tournaments from Firestore...");
        const tournamentsCollection = collection(db, "active-tournaments");
        const tournamentSnapshot = await getDocs(tournamentsCollection);
        const tournamentList = tournamentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("✅ Tournaments fetched:", tournamentList.length);
        setTournaments(tournamentList);
      } catch (error) {
        console.error("❌ Error fetching tournaments:", error);
        setTournaments([]);
      } finally {
        setLoadingTournaments(false);
      }
    };
    fetchTournaments();
  }, [user, showAddTournament]); // Re-fetch when a new tournament is added or removed

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      try {
        console.log("🏷️ Fetching categories from Firestore...");
        const categoriesCollection = collection(db, "tournament-categories");
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("✅ Categories fetched:", categoryList.length);
        setCategories(categoryList);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [user]);

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");
      await signOut(auth);
      console.log("✅ Logout successful");
      router.push("/");
    } catch (error) {
      console.error("❌ Logout error:", error);
      alert("Logout failed: " + error.message);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isActive: !currentStatus,
        updatedAt: new Date(),
      });
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, isActive: !currentStatus } : u
        )
      );
      console.log("✅ User status updated");
    } catch (error) {
      console.error("❌ Error updating user:", error);
      alert("Failed to update user status");
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      console.log("✅ User deleted");
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const addTournament = async (tournamentData) => {
    try {
      const newDocRef = doc(collection(db, "active-tournaments"));
      await setDoc(newDocRef, tournamentData);
      console.log("🏆 Tournament added:", tournamentData.name);
      setTournaments([...tournaments, { id: newDocRef.id, ...tournamentData }]); // Update state immediately
      setShowAddTournament(false);
    } catch (error) {
      console.error("❌ Error adding tournament:", error);
      alert("Failed to add tournament: " + error.message);
    }
  };

  const deleteTournament = async (tournamentId) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;
    try {
      await deleteDoc(doc(db, "active-tournaments", tournamentId));
      setTournaments(tournaments.filter((t) => t.id !== tournamentId));
      console.log("🏆 Tournament deleted:", tournamentId);
    } catch (error) {
      console.error("❌ Error deleting tournament:", error);
      alert("Failed to delete tournament: " + error.message);
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const newDocRef = doc(collection(db, "tournament-categories"));
      await setDoc(newDocRef, { ...categoryData, id: newDocRef.id }); // Ensure ID is included
      console.log("🏷️ Category added:", categoryData.name);
      setCategories([...categories, { id: newDocRef.id, ...categoryData }]);
    } catch (error) {
      console.error("❌ Error adding category:", error);
      alert("Failed to add category: " + error.message);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteDoc(doc(db, "tournament-categories", categoryId));
      setCategories(categories.filter((c) => c.id !== categoryId));
      console.log("🏷️ Category deleted:", categoryId);
    } catch (error) {
      console.error("❌ Error deleting category:", error);
      alert("Failed to delete category: " + error.message);
    }
  };

  const updateTournament = async (tournamentId, updates) => {
    try {
      const tournamentRef = doc(db, "active-tournaments", tournamentId);
      await updateDoc(tournamentRef, {
        ...updates,
        updatedAt: new Date(),
      });
      setTournaments(
        tournaments.map((t) =>
          t.id === tournamentId ? { ...t, ...updates } : t
        )
      );
      console.log("🏆 Tournament updated:", tournamentId, updates);
    } catch (error) {
      console.error("❌ Error updating tournament:", error);
      alert("Failed to update tournament: " + error.message);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.inGameName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTournaments = tournaments.filter(
    (tournament) =>
      tournament.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.categoryId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        handleLogout={handleLogout}
      />
      <div className="ml-64">
        <TopBar activeTab={activeTab} />
        <main className="p-6">
          {activeTab === "dashboard" && (
            <DashboardOverview
              users={users}
              tournaments={tournaments}
              setActiveTab={setActiveTab}
              setShowAddTournament={setShowAddTournament}
              handleLogout={handleLogout}
            />
          )}
          {activeTab === "users" && (
            <UserManagement
              users={users}
              filteredUsers={filteredUsers}
              loadingUsers={loadingUsers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              toggleUserStatus={toggleUserStatus}
              deleteUser={deleteUser}
            />
          )}
          {activeTab === "tournaments" && (
            <TournamentManagement
              tournaments={tournaments}
              filteredTournaments={filteredTournaments}
              loadingTournaments={loadingTournaments}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showAddTournament={showAddTournament}
              setShowAddTournament={setShowAddTournament}
              addTournament={addTournament}
              deleteTournament={deleteTournament}
              updateTournament={updateTournament} // 👈 new
              categories={categories}
              loadingCategories={loadingCategories}
            />
          )}
          {activeTab === "categories" && (
            <CategoryManagement
              categories={categories}
              loadingCategories={loadingCategories}
              addCategory={addCategory}
              deleteCategory={deleteCategory}
            />
          )}
          {activeTab === "transactions" && (
            <div className="text-center py-12">
              <Transactions />
            </div>
          )}
          {activeTab === "app-management" && (
            <MoreScreenManager />
          )}

          {activeTab === "feedback" && (
            <FeedbackManger />
          )}
        </main>
      </div>
    </div>
  );
}
