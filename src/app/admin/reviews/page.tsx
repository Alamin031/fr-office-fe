/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Eye, Edit, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

interface Review {
  id: string;
  product: string;
  productImage: string;
  customer: string;
  rating: number;
  content: string;
  date: string;
  status: "Pending" | "Approved" | "Flagged" | "Rejected";
}

const initialReviews: Review[] = [
  {
    id: "1",
    product: "iPhone 15 Pro Max",
    productImage: "/placeholder.svg?key=f23k9",
    customer: "John Doe",
    rating: 5,
    content:
      "Amazing phone with great camera and performance. The titanium design feels premium.",
    date: "Nov 20, 2024",
    status: "Approved",
  },
  {
    id: "2",
    product: "MacBook Air M3",
    productImage: "/placeholder.svg?key=m9x2v",
    customer: "Jane Smith",
    rating: 4,
    content:
      "Overall excellent laptop for daily use. Battery life is incredible. Wish it had more ports.",
    date: "Nov 19, 2024",
    status: "Approved",
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [form, setForm] = useState<Omit<Review, "id" | "date" | "status">>({
    product: "",
    productImage: "",
    customer: "",
    rating: 5,
    content: "",
  });
  const [productSearch, setProductSearch] = useState("");
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productSearchTimeout, setProductSearchTimeout] = useState<any>(null);
  // Product search handler
  const handleProductSearch = async (value: string) => {
    setProductSearch(value);
    setForm((prev) => ({ ...prev, product: value }));
    if (productSearchTimeout) clearTimeout(productSearchTimeout);
    setProductLoading(true);
    setProductSearchTimeout(
      setTimeout(async () => {
        try {
          const res = await fetch(`/api/products/search?query=${encodeURIComponent(value)}`);
          const data = await res.json();
          setProductOptions(data.data || []);
        } catch {
          setProductOptions([]);
        } finally {
          setProductLoading(false);
        }
      }, 400)
    );
  };

  // Product select handler
  const handleProductSelect = (product: any) => {
    setForm((prev) => ({
      ...prev,
      product: product.name,
      productImage: product.image || (product.images && product.images[0]) || "",
    }));
    setProductSearch(product.name);
  };

  // Image upload handler
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setForm((prev) => ({ ...prev, productImage: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Review
  const handleAddReview = () => {
    setForm({
      product: "",
      productImage: "",
      customer: "",
      rating: 5,
      content: "",
    });
    setEditMode(false);
    setViewMode(false);
    setModalOpen(true);
    setSelectedReview(null);
  };

  // Edit Review
  const handleEditReview = (review: Review) => {
    setForm({
      product: review.product,
      productImage: review.productImage,
      customer: review.customer,
      rating: review.rating,
      content: review.content,
    });
    setEditMode(true);
    setViewMode(false);
    setModalOpen(true);
    setSelectedReview(review);
  };

  // View Review
  const handleViewReview = (review: Review) => {
    setForm({
      product: review.product,
      productImage: review.productImage,
      customer: review.customer,
      rating: review.rating,
      content: review.content,
    });
    setEditMode(false);
    setViewMode(true);
    setModalOpen(true);
    setSelectedReview(review);
  };

  // Delete Review
  const handleDeleteReview = (review: Review) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviews(reviews.filter((r) => r.id !== review.id));
    }
  };

  // Save Review (Add or Edit)
  const handleSaveReview = () => {
    if (editMode && selectedReview) {
      setReviews(
        reviews.map((r) => (r.id === selectedReview.id ? { ...r, ...form } : r))
      );
    } else {
      setReviews([
        ...reviews,
        {
          id: Date.now().toString(),
          ...form,
          date: new Date().toLocaleDateString(),
          status: "Approved",
        },
      ]);
    }
    setModalOpen(false);
  };

  // Form change handler
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Reviews</h1>
          <p className="text-muted-foreground">
            Add, edit, delete, and view product reviews.
          </p>
        </div>
        <button
          onClick={handleAddReview}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-bold">{avgRating}</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-2xl font-bold">{reviews.length}</p>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Rating</th>
                  {/* <th className="px-4 py-2 text-left">Title</th> */}
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <Image
                        src={review.productImage || "/placeholder.svg"}
                        alt={review.product}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                      <span>{review.product}</span>
                    </td>
                    <td className="px-4 py-2">{review.customer}</td>
                    <td className="px-4 py-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    {/* <td className="px-4 py-2">{review.title}</td> */}
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {review.date}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          className="p-2"
                          title="View"
                          onClick={() => handleViewReview(review)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2"
                          title="Edit"
                          onClick={() => handleEditReview(review)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2"
                          title="Delete"
                          onClick={() => handleDeleteReview(review)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reviews.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No reviews found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit/View Review Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? "View Review"
                : editMode
                ? "Edit Review"
                : "Add Review"}
            </DialogTitle>
            <DialogDescription>
              {viewMode
                ? "View review details."
                : editMode
                ? "Edit the selected review."
                : "Add a new review for a product."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!viewMode) handleSaveReview();
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Input
                id="product"
                name="product"
                value={productSearch}
                onChange={(e) => handleProductSearch(e.target.value)}
                disabled={viewMode}
                placeholder="Search product..."
                autoComplete="off"
                required
              />
              {/* Product search dropdown */}
              {productSearch && productOptions.length > 0 && !viewMode && (
                <div className="border rounded bg-white shadow absolute z-50 w-full max-h-48 overflow-y-auto">
                  {productOptions.map((p) => (
                    <div
                      key={p.id}
                      className="px-4 py-2 cursor-pointer hover:bg-accent"
                      onClick={() => handleProductSelect(p)}
                    >
                      <div className="flex items-center gap-2">
                        <img src={p.image || (p.images && p.images[0]) || "/placeholder.svg"} alt={p.name} className="w-8 h-8 object-cover rounded" />
                        <span>{p.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="productImage">Product Image</Label>
              {form.productImage && (
                <div className="mb-2">
                  <img src={form.productImage} alt="Product" className="w-20 h-20 object-cover rounded" />
                </div>
              )}
              <Input
                id="productImage"
                name="productImage"
                type="file"
                accept="image/*"
                onChange={handleProductImageUpload}
                disabled={viewMode}
              />
              <p className="text-xs text-muted-foreground">Upload a product image (optional, overrides selected product image)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                name="customer"
                value={form.customer}
                onChange={handleFormChange}
                disabled={viewMode}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={handleFormChange}
                disabled={viewMode}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleFormChange}
                disabled={viewMode}
                required
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={() => setModalOpen(false)}
              >
                {viewMode ? "Close" : "Cancel"}
              </button>
              {!viewMode && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  {editMode ? "Save Changes" : "Add Review"}
                </button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
