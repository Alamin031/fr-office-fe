'use client';

import {useState, useEffect, Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {Button} from '@/app/components/ui/button';
import {Badge} from '@/app/components/ui/badge';
import {ProductCard} from '@/app/components/product/product-card';
import {Navbar} from '@/app/components/layout/navbar';
import {Footer} from '@/app/components/layout/footer';
import {MobileBottomNav} from '@/app/components/layout/mobile-bottom-nav';
import {
  flashsellService,
  type Flashsell,
} from '@/app/lib/api/services/flashsell';
import {productsService} from '@/app/lib/api/services';
import {toast} from 'sonner';
import {ArrowLeft, Calendar, Zap} from 'lucide-react';
import type {Product} from '@/app/types';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
  isUpcoming: boolean;
}

function useCountdown(
  startTime: string | null,
  endTime: string | null,
): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
    isUpcoming: false,
  });

  useEffect(() => {
    if (!startTime || !endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (now < start) {
        const difference = start.getTime() - now.getTime();
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isEnded: false,
          isUpcoming: true,
        });
      } else if (now > end) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
          isUpcoming: false,
        });
      } else {
        const difference = end.getTime() - now.getTime();
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isEnded: false,
          isUpcoming: false,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime]);

  return timeLeft;
}

function FlashSellDetailContent() {
  const searchParams = useSearchParams();
  const flashsellId = searchParams.get('id');

  const [flashsell, setFlashsell] = useState<Flashsell | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeLeft = useCountdown(
    flashsell?.startTime ?? null,
    flashsell?.endTime ?? null,
  );

  useEffect(() => {
    const fetchFlashsellData = async () => {
      if (!flashsellId) {
        setError('No flash sale selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const flashsellData = await flashsellService.findOne(flashsellId);
        setFlashsell(flashsellData);

        if (flashsellData.productIds && flashsellData.productIds.length > 0) {
          const productsData = await Promise.all(
            flashsellData.productIds.map(id =>
              productsService.getById(id).catch(() => null),
            ),
          );
          const validProducts = productsData.filter(
            p => p !== null,
          ) as Product[];
          setProducts(validProducts);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load flash sale';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashsellData();
  }, [flashsellId]);

  if (loading) {
    return (
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <div className="space-y-4">
            <div className="h-96 bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-40 bg-muted rounded animate-pulse" />
              <div className="h-4 w-60 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-64 bg-muted rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !flashsell) {
    return (
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <Link href="/">
            <Button variant="outline" className="gap-2 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Flash Sale Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The flash sale you're looking for doesn't exist."}
            </p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = () => {
    if (timeLeft.isUpcoming) {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-0 text-base">
          Upcoming
        </Badge>
      );
    }
    if (timeLeft.isEnded) {
      return (
        <Badge className="bg-gray-500/10 text-gray-600 border-0 text-base">
          Ended
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/10 text-green-600 border-0 text-base">
        Active
      </Badge>
    );
  };

  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="outline" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Flash Sale Header Section */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          {/* Banner and Title */}
          <div className="md:col-span-2">
            {flashsell.bannerImg && (
              <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-muted mb-6">
                <Image
                  src={flashsell.bannerImg}
                  alt={flashsell.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {flashsell.title}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">
                    {flashsell.discountpercentage}% OFF
                  </span>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </div>

          {/* Timer and Info Card */}
          <div className="bg-card border border-border rounded-2xl p-6 h-fit">
            {!timeLeft.isEnded && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3 text-muted-foreground">
                  {timeLeft.isUpcoming ? 'Starts in:' : 'Ends in:'}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {value: timeLeft.days, label: 'Days'},
                    {value: timeLeft.hours, label: 'Hrs'},
                    {value: timeLeft.minutes, label: 'Min'},
                    {value: timeLeft.seconds, label: 'Sec'},
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <div className="bg-muted rounded p-2 mb-1">
                        <p className="font-bold text-lg">
                          {String(item.value).padStart(2, '0')}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Stock Available</p>
                <p className="text-lg font-semibold">{flashsell.stock} units</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Products</p>
                <p className="text-lg font-semibold">
                  {flashsell.productIds.length}
                </p>
              </div>
            </div>

            {/* Time Info */}
            <div className="space-y-2 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <div>
                  <p>Start: {formatDateTime(flashsell.startTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <div>
                  <p>End: {formatDateTime(flashsell.endTime)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Featured Products
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-2xl">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No products available for this flash sale
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function FlashSellPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense
        fallback={
          <main className="flex-1 flex flex-col">
            <div className="mx-auto w-full max-w-7xl px-4 py-8">
              <div className="space-y-4">
                <div className="h-96 bg-muted rounded-2xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-8 w-40 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-60 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </main>
        }>
        <FlashSellDetailContent />
      </Suspense>
      <MobileBottomNav />
    </div>
  );
}
