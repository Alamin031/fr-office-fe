'use client';

import {useRef} from 'react';
import {ProductCard} from '../product/product-card';
import type {Product} from '@/app/types';

import type { EmiPlan } from "@/app/lib/api/services/emi";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  badge?: string;
  badgeColor?: string;
  isLoading?: boolean;
  emiPlans?: EmiPlan[];
  viewAllLink?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  badge,
  badgeColor = 'bg-foreground',
  isLoading = false,
  emiPlans,
  viewAllLink,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [firstWord, ...restWords] = (title ?? '').split(' ');
  const restTitle = restWords.join(' ');

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {badge && (
              <span
                className={`rounded-full ${badgeColor} px-3 py-1 text-xs font-medium text-background`}>
                {badge}
              </span>
            )}
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-purple-500 bg-clip-text text-transparent">
                {firstWord}
              </span>
              {restTitle ? ` ${restTitle}` : ''}
            </h2>
          </div>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="shrink-0 inline-flex items-center rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View All
          </a>
        )}
      </div>
      <div
        ref={scrollRef}
        className="flex flex-nowrap overflow-x-auto gap-3 pb-2 w-full lg:gap-6 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="w-[48vw] max-w-[180px] h-[200px] lg:w-[23%] lg:max-w-xs lg:h-[320px] bg-muted animate-pulse rounded-[1.2rem] flex-shrink-0 mx-auto"
              />
            ))
          : products.map((product) => (
              <div
                key={product.id}
                className="w-[48vw] max-w-[180px] h-[260px] lg:w-[23%] lg:max-w-xs lg:h-[340px] flex-shrink-0 flex mx-auto"
              >
                <ProductCard product={product} className="w-full h-full" emiPlans={emiPlans} />
              </div>
            ))}
      </div>
    </section>
  );
}
