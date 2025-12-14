/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle2, MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Separator } from "../../../../components/ui/separator"
import { formatPrice } from "../../../../lib/utils/format"
import { withProtectedRoute } from "../../../../lib/auth/protected-route"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ordersService } from "../../../../lib/api/services/orders"

// Map backend timeline to UI timeline
function mapOrderTimeline(tracking: {
  timeline?: { status?: string; date?: string; completed?: boolean; label?: string }[];
}) {
  if (tracking && Array.isArray(tracking.timeline)) {
    let foundCurrent = false;
    return tracking.timeline.map((item) => {
      let completed = false;
      if (item.completed !== undefined) {
        completed = item.completed;
      } else if (item.status) {
        // Mark all previous statuses as completed until the current one
        if (!foundCurrent && ["delivered", "cancelled", "returned"].includes(item.status)) {
          completed = true;
        } else if (!foundCurrent) {
          completed = true;
        } else {
          completed = false;
        }
      }
      if (item.status && ["delivered", "cancelled", "returned"].includes(item.status)) {
        foundCurrent = true;
      }
      return {
        status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : item.label,
        date: item.date ? new Date(item.date).toLocaleString() : '',
        completed,
      };
    });
  }
  return [];
}


function OrderDetailPage() {
    // Download Invoice handler
    const handleDownloadInvoice = async () => {
      try {
        if (!tracking?.orderNumber) return;
        const invoice = await ordersService.generateInvoice(tracking.orderNumber);
        if (invoice?.pdfUrl) {
          window.open(invoice.pdfUrl, '_blank');
        } else if (invoice?.html) {
          // fallback: open HTML in new tab
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(invoice.html);
            newWindow.document.close();
          }
        } else {
          alert("Invoice not available.");
        }
      } catch {
        alert("Failed to download invoice.");
      }
    };
  const params = useParams();
  const orderId = params?.id;
  type Tracking = {
    orderNumber: string;
    status: string;
    timeline: { status: string; date: string; completed?: boolean; label?: string }[];
    shippingAddress: any;
    paymentSummary: any;
    orderItems?: any[];
    items?: any[];
  } | null;

  const [tracking, setTracking] = useState<Tracking>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    // Use the new tracking endpoint for details page
    setLoading(true);
    const id = Array.isArray(orderId) ? orderId[0] : orderId;
    ordersService.track(id)
      .then((data) => {
        setTracking(data);
        setError(null);
      })
      .catch(() => setError("Failed to load order details."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }
  if (!tracking) {
    return <div className="py-12 text-center">Order not found.</div>;
  }

  const timeline = Array.isArray(tracking?.timeline) ? mapOrderTimeline(tracking) : [];
  const shippingAddress = tracking && typeof tracking.shippingAddress === 'object' && tracking.shippingAddress !== null ? tracking.shippingAddress : {};
  const paymentSummary = tracking && typeof tracking.paymentSummary === 'object' && tracking.paymentSummary !== null ? tracking.paymentSummary : {};
  // Prefer orderItems if available, fallback to items
  const items = Array.isArray(tracking?.orderItems) && tracking.orderItems.length > 0
    ? tracking.orderItems
    : (Array.isArray(tracking?.items) ? tracking.items : []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/account/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tracking.orderNumber || orderId}</h1>
          {/* You can add placed date if available */}
        </div>
        <Badge className="ml-auto bg-green-500/10 text-green-600 border-green-200" variant="outline">
          {tracking.status ? tracking.status.charAt(0).toUpperCase() + tracking.status.slice(1) : "-"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6">
                {timeline.length === 0 ? (
                  <div className="text-muted-foreground">No timeline available</div>
                ) : (
                  timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            event.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {event.completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className={`absolute top-8 h-full w-0.5 ${event.completed ? "bg-primary" : "bg-muted"}`} />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-medium">{event.status}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{shippingAddress.fullName || shippingAddress.name || '-'}</p>
                <p className="text-muted-foreground">{shippingAddress.address || '-'}</p>
                <p className="text-muted-foreground">
                  {(shippingAddress.division || '-')}, {(shippingAddress.district || shippingAddress.city || '-')} - {(shippingAddress.postCode || shippingAddress.pincode || '-')}
                </p>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {shippingAddress.phone || '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(paymentSummary.subtotal || 0)}</span>
              </div>
              {paymentSummary.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatPrice(paymentSummary.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(paymentSummary.total || 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Paid via {paymentSummary.paymentMethod || '-'}</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button variant="outline" className="w-full bg-transparent" onClick={handleDownloadInvoice}>
              Download Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withProtectedRoute(OrderDetailPage, {
  requiredRoles: ["user"],
})
