/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import {useState, useRef} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {Label} from '../ui/label';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {AlertCircle, Loader2, Bold, Italic} from 'lucide-react';
import blogsService, {BlogPost} from '../../lib/api/services/blogs';
import {RichTextEditor} from '../ui/rich-text-editor';

interface BlogFormProps {
  initialData?: BlogPost;
  isEditing?: boolean;
}

export function BlogForm({initialData, isEditing = false}: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    publishedAt: initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : '',
    readTime:
      initialData?.readTime !== undefined && initialData?.readTime !== null
        ? String(initialData.readTime)
        : '',
    status: (initialData?.status as 'draft' | 'published') || 'draft',
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : '',
  });

  const [images, setImages] = useState<(File | string)[]>(
    initialData?.image ? [initialData.image] : [],
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const {name, value} = e.target;
    setFormData(prev => {
      const updated = {...prev, [name]: value};
      if (name === 'title' && !initialData) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({...prev, content}));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Only allow one image (replace previous)
    setImages([files[0]]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (idx: number) => {
    setImages([]);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({...prev, [name]: value}));
  };

  const getPlainTextLength = (html: string) => {
    if (!html) return 0;
    // Remove HTML tags and count characters
    const plainText = html.replace(/<[^>]*>/g, '');
    return plainText.length;
  };

  const validateForm = () => {
    if (
      !formData.title ||
      !formData.slug ||
      !formData.excerpt ||
      !formData.content
    ) {
      setError('Please fill in all required fields');
      return false;
    }

    // Check content length without HTML tags
    const contentLength = getPlainTextLength(formData.content);
    if (contentLength < 100) {
      setError(
        `Content must be at least 100 characters (currently ${contentLength})`,
      );
      return false;
    }

    // Require one image
    if (images.length === 0) {
      setError('Please upload an image');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare FormData for binary image upload
      const form = new FormData();
      form.append('title', formData.title);
      form.append('slug', formData.slug);
      form.append('excerpt', formData.excerpt);
      form.append('content', formData.content);
      if (formData.publishedAt) form.append('publishedAt', new Date(formData.publishedAt).toISOString());
      if (formData.readTime) form.append('readTime', String(formData.readTime));
      form.append('status', formData.status);
      // Always send tags as array (even if single or empty)
      const tagsArr = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      tagsArr.forEach(tag => form.append('tags[]', tag));
      // Only send the first image
      if (images[0] && typeof images[0] !== 'string') {
        form.append('image', images[0]);
      } else if (images[0] && typeof images[0] === 'string') {
        form.append('image', images[0]);
      }

      if (isEditing && initialData?.id) {
        await blogsService.update(initialData.id, form);
      } else {
        await blogsService.create(form);
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const addPublishedDateField = () => {
    return (
      <div>
        <Label htmlFor="publishedAt">Publish Date & Time</Label>
        <Input
          id="publishedAt"
          name="publishedAt"
          type="datetime-local"
          value={formData.publishedAt}
          onChange={handleInputChange}
          className="mt-1"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditing
            ? 'Update the blog post details and content'
            : 'Create a new blog post with rich content'}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter blog post title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="slug">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                name="slug"
                placeholder="url-friendly-slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="mt-1"
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly identifier. Auto-generated from title.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  name="readTime"
                  placeholder="e.g., 5"
                  value={formData.readTime}
                  onChange={handleInputChange}
                  className="mt-1"
                  type="number"
                  min="1"
                />
              </div>
              {addPublishedDateField()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={val =>
                  handleSelectChange('status', val as 'draft' | 'published')
                }>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="Separate tags with commas (e.g., tech, guide, review)"
                value={formData.tags}
                onChange={handleInputChange}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tags help categorize your content
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images">
                Featured Image <span className="text-red-500">*</span>
              </Label>
              <Input
                id="images"
                name="images"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1"
                ref={fileInputRef}
              />
              <div className="flex flex-wrap gap-3 mt-2">
                {images[0] && (
                  <div className="relative group">
                    <img
                      src={
                        typeof images[0] === 'string'
                          ? images[0]
                          : URL.createObjectURL(images[0])
                      }
                      alt="Featured image preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(0)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-90 hover:opacity-100 transition-opacity"
                      title="Remove image">
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended size: 1200×630px. Max file size: 5MB.
              </p>
            </div>
            <div>
              <Label htmlFor="excerpt">
                Excerpt <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="excerpt"
                name="excerpt"
                placeholder="Brief summary of the blog post (shown in listings)"
                value={formData.excerpt}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Keep it concise, ideally 150-300 characters. Current:{' '}
                {formData.excerpt.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Content <span className="text-red-500">*</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-xs">
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewMode ? (
                <div className="border rounded-md p-6 min-h-[400px] overflow-auto bg-muted/10">
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{__html: formData.content}}
                  />
                  {!formData.content && (
                    <div className="text-center text-muted-foreground py-12">
                      No content to preview
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your blog post content here..."
                    className="min-h-[400px]"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                    <div>
                      <span className="font-medium">Character Count:</span>{' '}
                      {getPlainTextLength(formData.content)}
                      {getPlainTextLength(formData.content) < 100 && (
                        <span className="text-red-500 ml-2">
                          (Minimum 100 required)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <Bold className="h-3 w-3" /> Bold: Ctrl+B
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs">
                        <Italic className="h-3 w-3" /> Italic: Ctrl+I
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-muted/20 rounded-lg p-4 border">
                <h4 className="font-medium text-sm mb-2">Formatting Tips:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>
                    • Use toolbar buttons or keyboard shortcuts for formatting
                  </li>
                  <li>• Headings help structure your content (H1, H2, H3)</li>
                  <li>
                    • Use lists (bullet or numbered) for better readability
                  </li>
                  <li>• Add blockquotes for important quotes or highlights</li>
                  <li>• Use code blocks for technical content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Blog Post' : 'Publish Blog Post'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}>
            Cancel
          </Button>
          {isEditing && (
            <Button
              type="submit"
              variant="secondary"
              disabled={loading}
              onClick={e => {
                e.preventDefault();
                setFormData(prev => ({...prev, status: 'draft'}));
                setTimeout(() => {
                  const submitBtn = document.querySelector(
                    'button[type="submit"]',
                  ) as HTMLButtonElement;
                  if (submitBtn) submitBtn.click();
                }, 100);
              }}
              className="ml-auto">
              Save as Draft
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
