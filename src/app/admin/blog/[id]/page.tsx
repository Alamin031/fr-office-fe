'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BlogForm } from '../../../components/admin/blog-form';
import { withProtectedRoute } from '../../../lib/auth/protected-route';
import { Loader2 } from 'lucide-react';
import blogsService, { BlogPost } from '../../../lib/api/services/blogs';
import { Card, CardContent } from '../../../components/ui/card';

function EditBlogPage() {
  const params = useParams();
  const id = params?.id as string;
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await blogsService.getById(id);
        setBlog(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading blog...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!blog) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Blog not found</p>
        </CardContent>
      </Card>
    );
  }

  return <BlogForm initialData={blog} isEditing={true} />;
}

export default withProtectedRoute(EditBlogPage, {
  requiredRoles: ['admin'],
  fallbackTo: '/login',
  showLoader: true,
});
