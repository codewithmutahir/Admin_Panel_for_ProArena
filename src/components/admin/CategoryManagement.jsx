// components/admin/CategoryManagement.jsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Search, Filter, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CategoryManagement({ categories, loadingCategories, addCategory, deleteCategory }) {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let imageUrl = "";

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "proof_uploads");

        const response = await fetch("https://api.cloudinary.com/v1_1/dhnxmsbaj/image/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        imageUrl = data.secure_url;
      } catch (error) {
        console.error("❌ Error uploading image:", error);
        alert("Failed to upload image: " + error.message);
        setIsSaving(false);
        return;
      }
    }

    const categoryData = {
      ...newCategory,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    await addCategory(categoryData);
    setIsSaving(false);
    setShowAddCategory(false);
    setNewCategory({ name: "", description: "" });
    setImageFile(null);
  };

  return (
    <>
      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Categories</CardTitle>
              <CardDescription>Manage tournament categories</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search categories..."
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddCategory(true)}>
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingCategories ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Categories Found</h3>
              <p className="text-slate-600">No categories have been created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={category.imageUrl} />
                      <AvatarFallback className="bg-purple-100">
                        {category.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-slate-900">{category.name || "Unnamed Category"}</h4>
                      <p className="text-sm text-slate-600 truncate">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Active
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => deleteCategory(category.id)}>
                          Delete Category
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

      {showAddCategory && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Enter details to create a new category</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
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
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Category"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
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