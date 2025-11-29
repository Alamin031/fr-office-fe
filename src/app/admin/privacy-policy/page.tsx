'use client';

import {useState, useEffect, useCallback} from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {Checkbox} from '../../components/ui/checkbox';
import {policiesService} from '../../lib/api';
import {toast} from 'sonner';
import type {Policy} from '../../lib/api/types';

const POLICY_TYPES: Array<Policy['type']> = [
  'privacy',
  'terms',
  'shipping',
  'return',
  'refund',
  'warranty',
  'custom',
];

export default function PrivacyPolicyPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | Policy['type']>('all');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    type: 'privacy' as Policy['type'],
    isPublished: false,
  });

  // Ensure all form input values are never null
  const normalizeInput = (value: unknown): string => (typeof value === 'string' ? value : '');

  useEffect(() => {
    fetchPolicies();
  }, []);


  const filterPolicies = useCallback(() => {
    let filtered = policies;

    if (searchQuery) {
      filtered = filtered.filter(
        policy =>
          policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          policy.slug.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(policy => policy.type === typeFilter);
    }

    setFilteredPolicies(filtered);
  }, [policies, searchQuery, typeFilter]);

  useEffect(() => {
    filterPolicies();
  }, [filterPolicies]);
  // Stub handlers to fix lint errors (replace with real logic as needed)
  const handleAddPolicy = () => {
    setIsModalOpen(true);
    setSelectedPolicy(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      type: 'privacy',
      isPublished: false,
    });
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsViewMode(true);
    setIsModalOpen(true);
    setFormData({
      title: policy.title || '',
      slug: policy.slug || '',
      content: policy.content || '',
      type: policy.type || 'privacy',
      isPublished: policy.isPublished ?? false,
    });
  };

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsViewMode(false);
    setIsModalOpen(true);
    setFormData({
      title: policy.title || '',
      slug: policy.slug || '',
      content: policy.content || '',
      type: policy.type || 'privacy',
      isPublished: policy.isPublished ?? false,
    });
  };

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await policiesService.getAll();
      setPolicies(Array.isArray(response) ? response : response?.data ?? []);
    } catch (error) {
      toast.error('Failed to fetch policies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ...existing code...

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSavePolicy = async () => {
    // Normalize input values
    const title = normalizeInput(formData.title).trim();
    const content = normalizeInput(formData.content).trim();
    if (!title || !content) {
      toast.error('Title and Content are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        content,
        type: formData.type,
        isPublished: formData.isPublished,
        slug: formData.slug,
      };

      if (selectedPolicy) {
        if (!selectedPolicy.id) {
          toast.error('This policy has no id. Cannot update.');
          setLoading(false);
          return;
        }
        await policiesService.update(selectedPolicy.id, payload);
        toast.success('Policy updated successfully');
      } else {
        await policiesService.create(payload);
        toast.success('Policy created successfully');
      }

      await fetchPolicies();
      setIsModalOpen(false);
    } catch (error: unknown) {
      // Check for 409 Conflict error with specific message
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (
        err?.response?.status === 409 &&
        err?.response?.data?.message?.includes('already exists')
      ) {
        toast.error(err.response.data.message || 'A policy of this type already exists.');
      } else {
        toast.error('Failed to save policy');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async () => {
    if (!selectedPolicy?.id) {
      toast.error('This policy has no id. Cannot delete.');
      return;
    }
    setLoading(true);
    try {
      await policiesService.delete(selectedPolicy.id);
      toast.success('Policy deleted successfully');
      await fetchPolicies();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete policy');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (policy: Policy) => {
    setLoading(true);
    try {
      await policiesService.update(policy.id, {
        ...policy,
        isPublished: !policy.isPublished,
      });
      toast.success(
        policy.isPublished ? 'Policy unpublished' : 'Policy published',
      );
      await fetchPolicies();
    } catch (error) {
      toast.error('Failed to toggle publish status');
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
            Policies & Legal
          </h1>
          <p className="text-muted-foreground">
            Manage privacy policies, terms, and legal documents
          </p>
        </div>
        <Button onClick={handleAddPolicy} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Policy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Policies</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={v => setTypeFilter(v as 'all' | Policy['type'])}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {POLICY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && !policies.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No policies found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPolicies.map(policy => (
                <div
                  key={policy.id}
                  className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{policy.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {policy.slug}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {policy.type
                              ? policy.type.charAt(0).toUpperCase() + policy.type.slice(1)
                              : 'Unknown'}
                          </Badge>
                          <Badge
                            variant={
                              policy.isPublished ? 'default' : 'secondary'
                            }
                            className="text-xs">
                            {policy.isPublished ? 'Published' : 'Draft'}
                          </Badge>
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
                        onClick={() => handleViewPolicy(policy)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditPolicy(policy)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(policy)}>
                        {policy.isPublished ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedPolicy(policy);
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isViewMode
                ? 'View Policy'
                : selectedPolicy
                ? 'Edit Policy'
                : 'Add New Policy'}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? 'Policy details'
                : 'Create or edit a policy document'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Privacy Policy"
                value={formData.title || ''}
                onChange={e => {
                  setFormData({...formData, title: e.target.value});
                  if (!selectedPolicy) {
                    setFormData(prev => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }));
                  }
                }}
                disabled={isViewMode}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="privacy-policy"
                  value={formData.slug || ''}
                  onChange={e =>
                    setFormData({...formData, slug: e.target.value})
                  }
                  disabled={isViewMode || !!selectedPolicy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={type =>
                    setFormData({...formData, type: type as Policy['type']})
                  }
                  disabled={isViewMode}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter the policy content (supports plain text or HTML)"
                value={formData.content || ''}
                onChange={e =>
                  setFormData({...formData, content: e.target.value})
                }
                disabled={isViewMode}
                className="min-h-64 font-mono text-xs"
              />
            </div>

            {!isViewMode && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={checked =>
                    setFormData({...formData, isPublished: checked === true})
                  }
                />
                <Label
                  htmlFor="isPublished"
                  className="font-normal cursor-pointer">
                  Publish immediately
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button onClick={handleSavePolicy} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {selectedPolicy ? 'Update Policy' : 'Create Policy'}
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
            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this policy? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePolicy}
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
