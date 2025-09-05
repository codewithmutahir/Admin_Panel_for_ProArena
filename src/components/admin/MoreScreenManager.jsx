"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Move,
  ExternalLink,
  Mail,
  Shield,
  FileText,
  HelpCircle,
  Share,
  Wallet,
  Bell,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Home,
  User,
  Settings,
  Star,
  Heart,
  Search,
  Camera,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Zap,
  Award,
  Gift,
  ShoppingCart,
  CreditCard,
  Download,
  Upload,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Info,
  Flag,
  Bookmark,
  Tag,
  Folder,
  Archive,
  Coffee,
  Music,
  Video,
  Image,
  Book,
  Gamepad2
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { app } from "../../lib/firebaseClient";

// Icon options that match React Native Ionicons
const iconOptions = [
  { value: "home-outline", label: "Home", component: Home },
  { value: "person-outline", label: "Person", component: User },
  { value: "settings-outline", label: "Settings", component: Settings },
  { value: "star-outline", label: "Star", component: Star },
  { value: "heart-outline", label: "Heart", component: Heart },
  { value: "search-outline", label: "Search", component: Search },
  { value: "camera-outline", label: "Camera", component: Camera },
  { value: "call-outline", label: "Phone", component: Phone },
  { value: "chatbubble-outline", label: "Chat", component: MessageCircle },
  { value: "calendar-outline", label: "Calendar", component: Calendar },
  { value: "time-outline", label: "Clock", component: Clock },
  { value: "location-outline", label: "Location", component: MapPin },
  { value: "globe-outline", label: "Globe", component: Globe },
  { value: "flash-outline", label: "Flash", component: Zap },
  { value: "trophy-outline", label: "Trophy", component: Award },
  { value: "gift-outline", label: "Gift", component: Gift },
  { value: "bag-outline", label: "Shopping", component: ShoppingCart },
  { value: "card-outline", label: "Card", component: CreditCard },
  { value: "download-outline", label: "Download", component: Download },
  { value: "cloud-upload-outline", label: "Upload", component: Upload },
  { value: "lock-closed-outline", label: "Lock", component: Lock },
  { value: "lock-open-outline", label: "Unlock", component: Unlock },
  { value: "alert-circle-outline", label: "Alert", component: AlertCircle },
  { value: "checkmark-circle-outline", label: "Check", component: CheckCircle },
  { value: "information-circle-outline", label: "Info", component: Info },
  { value: "flag-outline", label: "Flag", component: Flag },
  { value: "bookmark-outline", label: "Bookmark", component: Bookmark },
  { value: "pricetag-outline", label: "Tag", component: Tag },
  { value: "folder-outline", label: "Folder", component: Folder },
  { value: "archive-outline", label: "Archive", component: Archive },
  { value: "cafe-outline", label: "Coffee", component: Coffee },
  { value: "musical-notes-outline", label: "Music", component: Music },
  { value: "videocam-outline", label: "Video", component: Video },
  { value: "image-outline", label: "Image", component: Image },
  { value: "book-outline", label: "Book", component: Book },
  { value: "game-pad-outline", label: "Game", component: Gamepad2 },
  { value: "wallet-outline", label: "Wallet", component: Wallet },
  { value: "mail-outline", label: "Mail", component: Mail },
  { value: "shield-checkmark-outline", label: "Shield", component: Shield },
  { value: "document-text-outline", label: "Document", component: FileText },
  { value: "help-circle-outline", label: "Help", component: HelpCircle },
  { value: "share-social-outline", label: "Share", component: Share },
  { value: "notifications-outline", label: "Bell", component: Bell },
  { value: "newspaper-outline", label: "News", component: FileText }
];

// Color presets
const colorPresets = [
  "#08CB00", // Green
  "#33A1E0", // Blue
  "#FF6B35", // Orange
  "#9C27B0", // Purple
  "#FF9800", // Amber
  "#4CAF50", // Light Green
  "#FF4500", // Red Orange
  "#2196F3", // Blue
  "#E91E63", // Pink
  "#607D8B", // Blue Grey
  "#795548", // Brown
  "#FF5722", // Deep Orange
];

// Action types for custom actions
const actionTypes = [
  {
    value: "feedback",
    label: "Feedback Modal",
    description: "Opens the feedback form",
  },
  {
    value: "share",
    label: "Share App",
    description: "Shows app sharing options",
  },
  {
    value: "contact",
    label: "Contact Support",
    description: "Opens contact options",
  },
  {
    value: "custom",
    label: "Custom Action",
    description: "Generic placeholder action",
  },
];

// ItemForm Component
function ItemForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState(item);
  const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};

  if (!formData.title.trim()) {
    newErrors.title = "Title is required";
  }

  if (!formData.subtitle.trim()) {
    newErrors.subtitle = "Subtitle is required";
  }

  if (formData.type === "navigate" && !formData.navigationTarget.trim()) {
    newErrors.navigationTarget = "Navigation target is required";
  }

  if (formData.type === "link" && !formData.navigationTarget.trim()) {
    newErrors.navigationTarget = "Link URL is required";
  }

  if (formData.type === "action" && !formData.navigationTarget.trim()) {
    newErrors.navigationTarget = "Action type is required";
  }

  if (formData.type === "toggle" && !formData.content.trim()) {
    newErrors.content = "Content is required for expandable items";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Menu item title"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle *
          </label>
          <Input
            value={formData.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder="Brief description"
            className={errors.subtitle ? "border-red-500" : ""}
          />
          {errors.subtitle && (
            <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>
          )}
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon
          </label>
          <Select
            value={formData.icon}
            onValueChange={(value) => updateField("icon", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((option) => {
                const IconComponent = option.component;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <IconComponent className="h-4 w-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={formData.color}
              onChange={(e) => updateField("color", e.target.value)}
              className="w-16 h-10"
            />
            <div className="flex flex-wrap gap-1">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                  style={{ backgroundColor: color }}
                  onClick={() => updateField("color", color)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <Select
            value={formData.type}
            onValueChange={(value) => updateField("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="navigate">
                Navigate (to another screen)
              </SelectItem>
              <SelectItem value="action">Action (custom function)</SelectItem>
              <SelectItem value="toggle">
                Toggle (expandable content)
              </SelectItem>
              <SelectItem value="link">Link (external URL)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation Target / URL */}
        {(formData.type === "navigate" || formData.type === "link") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === "navigate" ? "Screen Name *" : "URL *"}
            </label>
            <Input
              value={formData.navigationTarget}
              onChange={(e) => updateField("navigationTarget", e.target.value)}
              placeholder={
                formData.type === "navigate"
                  ? "e.g., Wallet, Profile, Settings"
                  : "e.g., https://example.com"
              }
              className={errors.navigationTarget ? "border-red-500" : ""}
            />
            {errors.navigationTarget && (
              <p className="text-red-500 text-sm mt-1">
                {errors.navigationTarget}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Expandable Content */}
      {formData.type === "toggle" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expandable Content *
          </label>
          <Textarea
            value={formData.content}
            onChange={(e) => updateField("content", e.target.value)}
            placeholder="Content that will be shown when expanded"
            rows={4}
            className={errors.content ? "border-red-500" : ""}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
        </div>
      )}

      {/* Visibility Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isVisible}
          onCheckedChange={(checked) => updateField("isVisible", checked)}
        />
        <label className="text-sm font-medium text-gray-700">
          Visible in app
        </label>
      </div>

      {formData.type === "action" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Type *
          </label>
          <Select
            value={formData.navigationTarget}
            onValueChange={(value) => updateField("navigationTarget", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  <div className="flex flex-col">
                    <span>{action.label}</span>
                    <span className="text-sm text-gray-500">
                      {action.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.navigationTarget && (
            <p className="text-red-500 text-sm mt-1">
              {errors.navigationTarget}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Item
        </Button>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${formData.color}20` }}
          >
            {(() => {
              const IconComponent =
                iconOptions.find((opt) => opt.value === formData.icon)
                  ?.component || Info;
              return (
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: formData.color }}
                />
              );
            })()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              {formData.title || "Menu Title"}
            </h3>
            <p className="text-sm text-gray-600">
              {formData.subtitle || "Menu subtitle"}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </form>
  );
}

export default function MoreScreenManager() {
  const db = getFirestore(app);

  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    subtitle: "",
    icon: "information-circle-outline",
    color: "#333333",
    type: "navigate",
    navigationTarget: "",
    isVisible: true,
    isExpandable: false,
    content: "",
  });

  // Load items from Firestore (Realtime listener)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "moreScreenItems", "config"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.items) setItems(data.items);
        }
      },
      (error) => console.error("Error loading items:", error)
    );
    return () => unsubscribe();
  }, [db]);

  // Save items to Firestore
  const saveItemsToFirebase = async (updatedItems) => {
    setLoading(true);
    try {
      await setDoc(doc(db, "moreScreenItems", "config"), {
        items: updatedItems,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving items:", error);
      alert("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  // Save single item
  const handleSaveItem = async (item) => {
    let updatedItems;

    if (editingItem) {
      updatedItems = items.map((i) =>
        i.id === item.id
          ? { ...item, lastUpdated: new Date().toISOString() }
          : i
      );
      setEditingItem(null);
    } else {
      const newId = Date.now().toString();
      const newOrder = items.length
        ? Math.max(...items.map((i) => i.order)) + 1
        : 1;
      updatedItems = [
        ...items,
        {
          ...item,
          id: newId,
          order: newOrder,
          lastUpdated: new Date().toISOString(),
        },
      ];
      setNewItem({
        title: "",
        subtitle: "",
        icon: "information-circle-outline",
        color: "#333333",
        type: "navigate",
        navigationTarget: "",
        isVisible: true,
        isExpandable: false,
        content: "",
      });
      setShowAddForm(false);
    }

    setItems(updatedItems);
    await saveItemsToFirebase(updatedItems);
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const updatedItems = items.filter((i) => i.id !== id);
      setItems(updatedItems);
      await saveItemsToFirebase(updatedItems);
    }
  };

  // Toggle visibility
  const toggleVisibility = async (id) => {
    const updatedItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            isVisible: !item.isVisible,
            lastUpdated: new Date().toISOString(),
          }
        : item
    );
    setItems(updatedItems);
    await saveItemsToFirebase(updatedItems);
  };

  // Move item (ordering)
  const moveItem = async (id, direction) => {
    const itemIndex = items.findIndex((i) => i.id === id);
    if (
      (direction === "up" && itemIndex > 0) ||
      (direction === "down" && itemIndex < items.length - 1)
    ) {
      const newItems = [...items];
      const targetIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
      [newItems[itemIndex], newItems[targetIndex]] = [
        newItems[targetIndex],
        newItems[itemIndex],
      ];

      // Update order values
      newItems.forEach((item, index) => {
        item.order = index + 1;
        item.lastUpdated = new Date().toISOString();
      });

      setItems(newItems);
      await saveItemsToFirebase(newItems);
    }
  };

  // Sort items
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            More Screen Items
          </h2>
          <p className="text-gray-600 mt-1">
            Manage the menu items that appear in the mobile app's "More" screen
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">Total Items</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {items.length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Visible Items</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {items.filter((item) => item.isVisible).length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <EyeOff className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">Hidden Items</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {items.filter((item) => !item.isVisible).length}
          </p>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Add New Menu Item
          </h3>
          <ItemForm
            item={newItem}
            onSave={handleSaveItem}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {sortedItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md border border-gray-200"
          >
            {editingItem === item.id ? (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Menu Item
                </h3>
                <ItemForm
                  item={item}
                  onSave={handleSaveItem}
                  onCancel={() => setEditingItem(null)}
                />
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      {(() => {
                        const IconComponent =
                          iconOptions.find((opt) => opt.value === item.icon)
                            ?.component || Bell;
                        return (
                          <IconComponent
                            className="h-6 w-6"
                            style={{ color: item.color }}
                          />
                        );
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.subtitle}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge
                          variant={item.isVisible ? "default" : "secondary"}
                        >
                          {item.isVisible ? "Visible" : "Hidden"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                        {item.type === "navigate" && item.navigationTarget && (
                          <Badge variant="outline">
                            → {item.navigationTarget}
                          </Badge>
                        )}
                        {item.type === "link" && item.navigationTarget && (
                          <Badge variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Link
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Move buttons */}
                    <div className="flex flex-col">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveItem(item.id, "up")}
                        disabled={index === 0}
                        className="h-6 px-2"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveItem(item.id, "down")}
                        disabled={index === items.length - 1}
                        className="h-6 px-2"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Visibility toggle */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleVisibility(item.id)}
                      className="p-2"
                    >
                      {item.isVisible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>

                    {/* Edit button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingItem(item.id)}
                      className="p-2"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>

                    {/* Delete button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Expandable content preview */}
                {item.type === "toggle" && item.content && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Expandable Content:
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.content}
                    </p>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-400">
                  Last updated:{" "}
                  {new Date(
                    item.lastUpdated || Date.now()
                  ).toLocaleDateString()}{" "}
                  at{" "}
                  {new Date(
                    item.lastUpdated || Date.now()
                  ).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first menu item to get started
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          How to integrate with your React Native app:
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            1. Save items to Firebase Firestore in collection:{" "}
            <code className="bg-blue-100 px-1 rounded">moreScreenItems</code>
          </p>
          <p>
            2. In your React Native app, fetch items on MoreScreen component
            mount
          </p>
          <p>
            3. Filter by{" "}
            <code className="bg-blue-100 px-1 rounded">isVisible: true</code>{" "}
            and sort by <code className="bg-blue-100 px-1 rounded">order</code>
          </p>
          <p>4. Use the item data to dynamically render your menu</p>
        </div>
      </div>
    </div>
  );
}
