/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';

import {useState, useEffect} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {Heart, ArrowLeftRight} from 'lucide-react';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {useWishlistStore} from '@/app/store/wishlist-store';
import {useCompareStore} from '@/app/store/compare-store';
import {
  formatPrice,
  formatPriceParts, // added
} from '@/app/lib/utils/format';
import {cn} from '@/app/lib/utils';
import {Product} from '@/app/types';
import {getDefaultProductPrice} from '@/app/lib/utils/product';
import {emiService, type EmiPlan} from '@/app/lib/api/services/emi';

interface ProductCardProps {
  product: Product;
  className?: string;
  emiPlans?: EmiPlan[];
}

export function ProductCard({
  product,
  className,
  emiPlans: propEmiPlans,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [emiPlans, setEmiPlans] = useState<EmiPlan[]>(propEmiPlans || []);
  const [emiLoading, setEmiLoading] = useState(false);
  const [emiError, setEmiError] = useState<string | null>(null);

  // Fetch EMI plans on mount if not provided as prop
  useEffect(() => {
    if (!propEmiPlans || propEmiPlans.length === 0) {
      const fetchEmiPlans = async () => {
        setEmiLoading(true);
        setEmiError(null);
        try {
          const plans = await emiService.getPlans();
          setEmiPlans(plans);
        } catch (err: any) {
          setEmiPlans([]);
          setEmiError(
            err?.message || 'Failed to load EMI plans. Please try again later.'
          );
          console.error('Error fetching EMI plans:', err);
        } finally {
          setEmiLoading(false);
        }
      };
      fetchEmiPlans();
    } else {
      setEmiPlans(propEmiPlans);
    }
  }, [propEmiPlans]);

  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const {
    addItem: addToCompare,
    removeItem: removeFromCompare,
    isInCompare,
  } = useCompareStore();

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  // Extract default variant prices based on product type
  const priceInfo = getDefaultProductPrice(product);
  const regularPrice = priceInfo.regularPrice;
  const salePrice = priceInfo.discountPrice;
  const hasDiscount = priceInfo.hasDiscount;
  const discount = priceInfo.discount;
  const isOutOfStock = priceInfo.stockQuantity === 0;

  // Calculate minimum EMI/month for the bank with the highest month count
  let minEmiPerMonth: number | null = null;
  if (emiPlans && emiPlans.length > 0 && regularPrice > 0) {
    // Find the plan(s) with the highest month count
    const maxMonths = Math.max(...emiPlans.map(p => p.months));
    const maxMonthPlans = emiPlans.filter(p => p.months === maxMonths);
    // Calculate EMI for each plan (simple interest)
    const calculateEmi = (
      principal: number,
      monthCount: number,
      rate: number = 0,
    ) => {
      const totalInterest = (principal * rate) / 100;
      const totalAmount = principal + totalInterest * monthCount;
      return totalAmount / monthCount;
    };
    minEmiPerMonth = Math.min(
      ...maxMonthPlans.map(plan =>
        calculateEmi(regularPrice, plan.months, plan.interestRate),
      ),
    );
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  // Extract image URL from product images array
  const getImageUrl = (img: any): string => {
    if (!img || img === '') return '/placeholder.svg';
    if (typeof img === 'string') return img;
    if (typeof img === 'object') {
      const url = img.imageUrl || img.url || '';
      return url && url !== '' ? url : '/placeholder.svg';
    }
    return '/placeholder.svg';
  };

  const primaryImage = getImageUrl(
    Array.isArray(product.images) && product.images[0]
      ? product.images[0]
      : null,
  );

  const secondaryImage =
    Array.isArray(product.images) && product.images.length > 1
      ? getImageUrl(product.images[1])
      : null;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[2rem] border-2 border-gray-200 bg-card transition-all duration-300 hover:shadow-lg',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white flex items-center justify-center">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className={cn(
              'object-contain transition-all duration-500',
              isHovered && 'scale-105',
              !imageLoaded && 'blur-sm',
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, 100%"
            priority={false}
          />
          {/* Second image on hover */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={product.name}
              fill
              className={cn(
                'absolute inset-0 object-contain transition-opacity duration-500',
                isHovered ? 'opacity-100' : 'opacity-0',
              )}
              sizes="(max-width: 768px) 100vw, 100%"
              priority={false}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge className="bg-blue-800 text-white hover:bg-blue-900">
              {discount}%
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-foreground text-background hover:bg-foreground">
              New
            </Badge>
          )}
          {isOutOfStock && (
            <Badge
              variant="secondary"
              className="bg-muted-foreground text-background">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick Actions - Bottom Right */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 rounded-lg bg-stone-500 p-1.5 shadow-md">
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              'h-5 w-5 rounded-full shadow-md',
              inWishlist && 'bg-blue-600 text-white hover:bg-blue-700',
            )}
            onClick={handleWishlistToggle}>
            <Heart className={cn('h-3 w-3', inWishlist && 'fill-current')} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              'h-5 w-5 rounded-full shadow-md',
              inCompare && 'bg-yellow-500 text-white hover:bg-yellow-600',
            )}
            onClick={handleCompareToggle}>
            <ArrowLeftRight className={cn('h-3 w-3', inCompare && 'fill-current')} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand */}
        {product.brand && product.brand.slug && product.brand.name && (
          <Link
            href={`/brand/${product.brand.slug}`}
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground">
            {product.brand.name}
          </Link>
        )}

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3
            className="mt-1 text-sm font-medium transition-colors hover:text-muted-foreground truncate"
            style={{ maxWidth: '100%' }}
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* RatingPoint (always show if present) */}
        {(() => {
          let ratingPointNum = 0;
          if (typeof product.ratingPoint === 'number') {
            ratingPointNum = product.ratingPoint;
          } else if (typeof product.ratingPoint === 'string') {
            const parsed = parseFloat(product.ratingPoint);
            if (!isNaN(parsed)) ratingPointNum = parsed;
          }
          return ratingPointNum > 0 ? (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex">
                {Array.from({length: 5}).map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < Math.round(ratingPointNum)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted',
                    )}
                    viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-yellow-700 font-medium ml-1">
                {ratingPointNum.toFixed(1)}
              </span>
              {product.reviewCount !== undefined && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          ) : null;
        })()}

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            {/* sale price with larger bold symbol */}
            {(() => {
              const {symbol, amount} = formatPriceParts(salePrice);
              return (
                <span className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold leading-none text-green-800">
                    {symbol}
                  </span>
                  <span className="text-lg font-bold text-green-800 leading-none">
                    {amount}
                  </span>
                </span>
              );
            })()}

            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>
          {/* EMI info */}
          {emiError && (
            <div className="text-xs text-red-600 mt-1">
              EMI info unavailable
            </div>
          )}
          {!emiError && minEmiPerMonth !== null && (
            <div className="text-xs text-muted-foreground mt-1">
              EMI {formatPrice(minEmiPerMonth)}/mo
            </div>
          )}
        </div>

        {/* Stock Indicator */}
        {typeof product.stock === 'number' &&
          product.stock > 0 &&
          product.stock <= 10 && (
            <p className="mt-2 text-xs text-[oklch(0.55_0.2_25)]">
              Only {product.stock} left in stock
            </p>
          )}
      </div>
    </div>
  );
}
