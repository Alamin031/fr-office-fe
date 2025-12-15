'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { policiesService, Policy } from '../../../lib/api';
import { Loader2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    policiesService
      .getBySlug(slug)
      .then((data) => {
        setPolicy(data);
        setNotFound(false);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !policy) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Policy Not Found</h1>
        <p className="text-muted-foreground">The requested policy does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">{policy.title}</h1>
      <div
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: policy.content ?? '' }}
      />
      <div className="mt-8 text-xs text-muted-foreground">
        Last updated: {policy.updatedAt ? new Date(policy.updatedAt).toLocaleString() : ''}
      </div>
    </div>
  );
}