/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Loader2,
  GripVertical,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {Label} from '../../components/ui/label';
import {Badge} from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {Textarea} from '../../components/ui/textarea';
import {toast} from 'sonner';
import {
  homecategoriesService,
  type Homecategory,
} from '../../lib/api/services/homecategories';
import {useEffect, useState} from 'react';
import {categoriesService} from '../../lib/api/services/categories';
import {productsService} from '../../lib/api/services/products';
import type {Category, Product} from '../../lib/api/types';
import { withProtectedRoute } from '../../lib/auth/protected-route';

// Custom MultiSelect Component
interface MultiSelectProps {
  options: {id: string; name: string}[];
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

function MultiSelect({
  options,
  selectedValues,
  onValuesChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedItems = options.filter(option =>
    selectedValues.includes(option.id),
  );

  const toggleOption = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onValuesChange(selectedValues.filter(id => id !== optionId));
    } else {
      onValuesChange([...selectedValues, optionId]);
    }
  };

  const removeOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange(selectedValues.filter(id => id !== optionId));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange([]);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        className={`flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:border-primary'
        } ${isOpen ? 'border-primary ring-2 ring-ring ring-offset-2' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}>
        <div className="flex flex-1 flex-wrap gap-1 overflow-hidden">
          {selectedItems.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedItems.map(item => (
              <Badge
                key={item.id}
                variant="secondary"
                className="flex items-center gap-1 pr-1">
                {item.name}
                {!disabled && (
                  <X
                    className="h-3 w-3 cursor-pointer hover:opacity-70"
                    onClick={e => removeOption(item.id, e)}
                  />
                )}
              </Badge>
            ))
          )}
        </div>
        {!disabled && selectedItems.length > 0 && (
          <X
            className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={clearAll}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {/* Search */}
          <div className="p-2">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8"
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No items found
              </div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                    selectedValues.includes(option.id) ? 'bg-accent' : ''
                  }`}
                  onClick={() => toggleOption(option.id)}>
                  <span className="flex-1 truncate">{option.name}</span>
                  {selectedValues.includes(option.id) && (
                    <div className="absolute right-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground">
                      ✓
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HomeshowCategoryPage() {
  const [categories, setCategories] = useState<Homecategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Homecategory[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Homecategory | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: '',
    categoryIds: [] as string[],
    productIds: [] as string[],
  });

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch all categories and products for dropdowns
    const fetchDropdownData = async () => {
      try {
        // Fetch categories
        const catsRes = await categoriesService.getAll();
        let categoriesArr: Category[] = [];
        if (Array.isArray(catsRes)) {
          categoriesArr = catsRes as Category[];
        } else if (
          catsRes &&
          Array.isArray((catsRes as {data: Category[]}).data)
        ) {
          categoriesArr = (catsRes as {data: Category[]}).data;
        }
        setAllCategories(categoriesArr);

        // Fetch products
        const prodsRes = await productsService.getAll();
        console.log('Fetched products for dropdown:', prodsRes);
        let productsArr: Product[] = [];
        if (Array.isArray(prodsRes)) {
          productsArr = prodsRes as Product[];
        } else if (Array.isArray(prodsRes?.data)) {
          productsArr = prodsRes.data as Product[];
        }
        setAllProducts(productsArr);
      } catch (e) {
        console.error('Error fetching dropdown data:', e);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await homecategoriesService.list();
      setCategories(data || []);
    } catch (error) {
      toast.error('Failed to fetch homeshow categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    if (searchQuery) {
      filtered = filtered.filter(
        cat =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    filtered.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    setFilteredCategories(filtered);
  };

  const handleAddCategory = () => {
    setFormData({
      name: '',
      description: '',
      priority: '',
      categoryIds: [],
      productIds: [],
    });
    setSelectedCategory(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Homecategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      priority: category.priority?.toString() || '',
      categoryIds: category.categoryIds || [],
      productIds: category.productIds || [],
    });
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewCategory = (category: Homecategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      priority: category.priority?.toString() || '',
      categoryIds: category.categoryIds || [],
      productIds: category.productIds || [],
    });
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        priority: formData.priority ? parseInt(formData.priority) : undefined,
        categoryIds: formData.categoryIds,
        productIds: formData.productIds,
      };

      if (selectedCategory) {
        await homecategoriesService.update(selectedCategory.id, payload);
        toast.success('Homeshow category updated successfully');
      } else {
        await homecategoriesService.create(payload);
        toast.success('Homeshow category created successfully');
      }

      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save homeshow category');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      await homecategoriesService.delete(selectedCategory.id);
      toast.success('Homeshow category deleted successfully');
      await fetchCategories();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete homeshow category');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Homeshow Categories
          </h1>
          <p className="text-muted-foreground">
            Manage homepage category sections and display order
          </p>
        </div>
        <Button onClick={handleAddCategory} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Homepage Categories</CardTitle>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && !categories.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No homeshow categories found
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors group">
                  <GripVertical className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{category.name}</h3>
                          {category.priority !== undefined && (
                            <Badge variant="outline">
                              Priority: {category.priority}
                            </Badge>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {category.categoryIds &&
                            category.categoryIds.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {category.categoryIds.length} categories
                              </Badge>
                            )}
                          {category.productIds &&
                            category.productIds.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {category.productIds.length} products
                              </Badge>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewCategory(category)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditCategory(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isViewMode
                ? 'View Homeshow Category'
                : selectedCategory
                ? 'Edit Homeshow Category'
                : 'Add New Homeshow Category'}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? 'Category details'
                : 'Create or manage homepage category sections'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Featured Smartphones"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                disabled={isViewMode}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this homepage section"
                value={formData.description}
                onChange={e =>
                  setFormData({...formData, description: e.target.value})
                }
                disabled={isViewMode}
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Display Priority (lower = first)</Label>
              <Input
                id="priority"
                type="number"
                placeholder="e.g., 1, 2, 3..."
                value={formData.priority}
                onChange={e =>
                  setFormData({...formData, priority: e.target.value})
                }
                disabled={isViewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryIds">Select Categories</Label>
              <MultiSelect
                options={allCategories.map(cat => ({
                  id: cat.id,
                  name: cat.name,
                }))}
                selectedValues={formData.categoryIds}
                onValuesChange={values =>
                  setFormData({...formData, categoryIds: values})
                }
                placeholder="Select categories..."
                searchPlaceholder="Search categories..."
                disabled={isViewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productIds">Select Products</Label>
              <MultiSelect
                options={allProducts.map(prod => ({
                  id: prod.id,
                  name: prod.name,
                }))}
                selectedValues={formData.productIds}
                onValuesChange={values =>
                  setFormData({...formData, productIds: values})
                }
                placeholder="Select products..."
                searchPlaceholder="Search products..."
                disabled={isViewMode}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button onClick={handleSaveCategory} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {selectedCategory ? 'Update Category' : 'Create Category'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Homeshow Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this homeshow category? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withProtectedRoute(HomeshowCategoryPage, {
  requiredRoles: ["admin"],
  fallbackTo: "/login",
  showLoader: true,
});
