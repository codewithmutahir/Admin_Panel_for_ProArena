import { useState } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Search, Filter, Calendar, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { serverTimestamp } from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function TournamentManagement({
  tournaments,
  filteredTournaments,
  loadingTournaments,
  searchQuery,
  setSearchQuery,
  showAddTournament,
  setShowAddTournament,
  addTournament,
  deleteTournament,
  updateTournament, // ✅ make sure this is passed from Dashboard
  categories,
  loadingCategories,
}) {
  const [newTournament, setNewTournament] = useState({
    name: "",
    categoryId: "",
    entryFee: "",
    prizePool: "",
    slots: "",
    startTime: "",
    isActive: "true",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 👉 for dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [pass, setPass] = useState("");

  const handleAddTournament = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let imageUrl = "";

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "proof_uploads");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dhnxmsbaj/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        imageUrl = data.secure_url;
      } catch (error) {
        console.error("❌ Error uploading image:", error);
        setIsSaving(false);
        return;
      }
    }

    const numSlots = parseInt(newTournament.slots);
    const bookedSlots = [];

    const tournamentData = {
      ...newTournament,
      entryFee: parseInt(newTournament.entryFee),
      prizePool: parseInt(newTournament.prizePool),
      slots: numSlots,
      bookedSlots,
      isActive: newTournament.isActive === "true",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      imageUrl,
    };

    try {
      await addTournament(tournamentData);
      setIsSaving(false);
      setNewTournament({
        name: "",
        categoryId: "",
        entryFee: "",
        prizePool: "",
        slots: "",
        startTime: "",
        isActive: "true",
      });
      setImageFile(null);
    } catch (error) {
      console.error("❌ Error saving tournament:", error);
      setIsSaving(false);
    }
  };

  const handleSendUpdate = async () => {
    if (selectedTournament) {
      await updateTournament(selectedTournament.id, { roomId, pass });
      setDialogOpen(false);
      setRoomId("");
      setPass("");
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* * ... your existing stats cards ... */}
      </div>

      {/* Tournaments Table */}
      <Card>
        <CardHeader>
          {/* ... header code ... */}
        </CardHeader>
        <CardContent>
          {loadingTournaments ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No Tournaments Found
              </h3>
              <p className="text-slate-600">
                {tournaments.length === 0
                  ? "No tournaments have been created yet."
                  : "No tournaments match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tournament.imageUrl} />
                      <AvatarFallback className="bg-yellow-100">
                        {tournament.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {tournament.name || "Unnamed Tournament"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        Start Time: {tournament.startTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={tournament.isActive ? "default" : "secondary"}
                      className={
                        tournament.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {tournament.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ⋮
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => deleteTournament(tournament.id)}
                        >
                          Delete Tournament
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTournament(tournament);
                            setDialogOpen(true);
                          }}
                        >
                          Send Update (Room ID)
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

      {/* Room Update Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Tournament Update</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the Room ID and Room Pass for{" "}
              <span className="font-semibold">
                {selectedTournament?.name}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="roomId" className={
                "text-sm font-medium text-slate-900 pb-2"
              }>Room ID</Label>
              <Input
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
              />
            </div>
            <div>
              <Label htmlFor="pass" className={
                "text-sm font-medium text-slate-900 pb-2"
              }>Room Pass</Label>
              <Input
                id="pass"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Enter Pass"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendUpdate}>
              Send Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showAddTournament && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add New Tournament</CardTitle>
            <CardDescription>
              Enter details to create a new tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTournament} className="space-y-4">
              <div>
                <Label htmlFor="name">Tournament Name</Label>
                <Input
                  id="name"
                  value={newTournament.name}
                  onChange={(e) =>
                    setNewTournament({ ...newTournament, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  value={newTournament.categoryId}
                  onChange={(e) =>
                    setNewTournament({
                      ...newTournament,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  required
                  disabled={loadingCategories}
                >
                  <option value="">Select a Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="entryFee">Entry Fee</Label>
                <Input
                  id="entryFee"
                  type="number"
                  value={newTournament.entryFee}
                  onChange={(e) =>
                    setNewTournament({
                      ...newTournament,
                      entryFee: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="prizePool">Prize Pool</Label>
                <Input
                  id="prizePool"
                  type="number"
                  value={newTournament.prizePool}
                  onChange={(e) =>
                    setNewTournament({
                      ...newTournament,
                      prizePool: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="slots">Total Slots</Label>
                <Input
                  id="slots"
                  type="number"
                  value={newTournament.slots}
                  onChange={(e) =>
                    setNewTournament({
                      ...newTournament,
                      slots: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  value={newTournament.startTime}
                  onChange={(e) =>
                    setNewTournament({
                      ...newTournament,
                      startTime: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="imageFile">Upload Image</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </div>
              <div>
                <Label htmlFor="isActive">Active</Label>
                <select
                  id="isActive"
                  value={newTournament.isActive}
                  onChange={(e) =>
                    setNewTournament({
                      ...newTournament,
                      isActive: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Tournament"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddTournament(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
