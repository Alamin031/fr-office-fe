/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {ArrowLeft, CheckCircle2, MapPin, Phone} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import {Button} from '../../../../components/ui/button';
import {Badge} from '../../../../components/ui/badge';
import {Separator} from '../../../../components/ui/separator';
import {formatPrice} from '../../../../lib/utils/format';
import {withProtectedRoute} from '../../../../lib/auth/protected-route';
import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {ordersService} from '../../../../lib/api/services/orders';

// Map backend timeline to UI timeline
function mapOrderTimeline(tracking: {
  timeline?: {
    status?: string;
    date?: string;
    completed?: boolean;
    label?: string;
  }[];
}) {
  if (tracking && Array.isArray(tracking.timeline)) {
    let foundCurrent = false;
    return tracking.timeline.map(item => {
      let completed = false;
      if (item.completed !== undefined) {
        completed = item.completed;
      } else if (item.status) {
        // Mark all previous statuses as completed until the current one
        if (
          !foundCurrent &&
          ['delivered', 'cancelled', 'returned'].includes(item.status)
        ) {
          completed = true;
        } else if (!foundCurrent) {
          completed = true;
        } else {
          completed = false;
        }
      }
      if (
        item.status &&
        ['delivered', 'cancelled', 'returned'].includes(item.status)
      ) {
        foundCurrent = true;
      }
      return {
        status: item.status
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
          : item.label,
        date: item.date ? new Date(item.date).toLocaleString() : '',
        completed,
      };
    });
  }
  return [];
}

function OrderDetailPage() {
  // Print Invoice handler (browser-side, no API)
  const handlePrintInvoice = () => {
    if (!tracking) return;
    const order = tracking;
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderNumber || order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: white; }
            .invoice-container { max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
            .header p { color: #666; font-size: 14px; }
            .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .invoice-section h3 { font-weight: bold; margin-bottom: 10px; font-size: 14px; }
            .invoice-section p { font-size: 13px; color: #666; line-height: 1.8; }
            .invoice-section .label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            table thead { background-color: #f5f5f5; }
            table th { padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
            table td { padding: 12px; border-bottom: 1px solid #eee; }
            table tr:last-child td { border-bottom: 2px solid #ddd; }
            .total-section { display: flex; justify-content: flex-end; margin-top: 30px; margin-bottom: 30px; }
            .total-box { width: 300px; padding: 20px; border-top: 2px solid #333; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total-row.final { font-size: 18px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            @media print { body { margin: 0; padding: 0; } .invoice-container { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>INVOICE</h1>
              <p>${order.orderNumber || order.id}</p>
            </div>

            <div class="invoice-details">
              <div class="invoice-section">
                <h3>From:</h3>
                <p><span class="label">Friend's Telecom</span><br>Bashundhara City Shopping Complex Basement 2, Shop 25, Dhaka, Bangladesh</p>
              </div>
              <div class="invoice-section">
                <h3>Bill To:</h3>
                <p>
                  <span class="label">${order.fullName || order.name || order.customer?.fullName || order.customer?.name || '-'}</span><br>
                  ${order.email || order.customer?.email || '-'}<br>
                  ${order.phone || order.customer?.phone || '-'}<br>
                  ${order.address || order.customer?.address || '-'}
                </p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th style="text-align: right; width: 80px;">Qty</th>
                  <th style="text-align: right; width: 100px;">Price</th>
                  <th style="text-align: right; width: 120px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${(order.orderItems || order.items || [])
                  .map(
                    (item: any) => `
                  <tr>
                    <td>${item.productName || item.name || 'Product'}</td>
                    <td style="text-align: right;">${item.quantity}</td>
                    <td style="text-align: right;">৳ ${(item.price || 0).toLocaleString('en-BD')}</td>
                    <td style="text-align: right;">৳ ${((item.price || 0) * (item.quantity || 0)).toLocaleString('en-BD')}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-box">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>৳ ${(order.paymentSummary?.subtotal ?? order.subtotal ?? order.total ?? 0).toLocaleString('en-BD')}</span>
                </div>
                <div class="total-row final">
                  <span>Total:</span>
                  <span>৳ ${(order.paymentSummary?.total ?? order.total ?? 0).toLocaleString('en-BD')}</span>
                </div>
              </div>
            </div>

            <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
              <p><strong>Status:</strong> ${order.status || '-'}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus || '-'}</p>
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Invoice generated on ${new Date().toLocaleDateString('en-BD', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };
  const params = useParams();
  const orderId = params?.id;
  type Tracking = {
    id?: string;
    orderNumber: string;
    status: string;
    timeline?: {
      status?: string;
      date?: string;
      completed?: boolean;
      label?: string;
    }[];
    statusHistory?: {
      status?: string;
      date?: string;
      completed?: boolean;
      label?: string;
    }[];
    shippingAddress?: {
      fullName?: string;
      name?: string;
      address?: string;
      division?: string;
      district?: string;
      city?: string;
      upzila?: string;
      postCode?: string;
      pincode?: string;
      phone?: string;
    };
    paymentSummary?: {
      subtotal?: number;
      discount?: number;
      total?: number;
      paymentMethod?: string;
    };
    orderItems?: any[];
    items?: any[];
    customer?: {
      fullName?: string;
      name?: string;
      email?: string;
      phone?: string;
      division?: string;
      district?: string;
      city?: string;
      upzila?: string;
      postCode?: string;
      pincode?: string;
      address?: string;
      paymentMethod?: string;
      deliveryMethod?: string;
    };
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
    division?: string;
    district?: string;
    city?: string;
    upzila?: string;
    postCode?: string;
    pincode?: string;
    address?: string;
    paymentMethod?: string;
    deliveryMethod?: string;
    subtotal?: number;
    discount?: number;
    total?: number;
    createdAt?: string;
    updatedAt?: string;
    paymentStatus?: string;
  } | null;

  const [tracking, setTracking] = useState<Tracking>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    // Use the new tracking endpoint for details page
    const fetchOrder = async () => {
      setLoading(true);
      const id = Array.isArray(orderId) ? orderId[0] : orderId;
      try {
        const data = await ordersService.track(id);
        setTracking(data);
        setError(null);
      } catch {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
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

  // Timeline: prefer timeline, fallback to statusHistory
  const timeline =
    Array.isArray(tracking?.timeline) && tracking.timeline.length > 0
      ? mapOrderTimeline(tracking)
      : Array.isArray(tracking?.statusHistory)
      ? mapOrderTimeline({timeline: tracking.statusHistory})
      : [];

  // Shipping address: prefer shippingAddress, then customer, then root fields, and support all possible field names
  const shippingAddress = (() => {
    if (tracking?.shippingAddress && typeof tracking.shippingAddress === 'object') {
      return tracking.shippingAddress;
    }
    if (tracking?.customer && typeof tracking.customer === 'object') {
      // Prefer customer fields, but fallback to root if missing
      return {
        fullName: tracking.customer.fullName || tracking.fullName,
        name: tracking.customer.name || tracking.name,
        address: tracking.customer.address || tracking.address,
        division: tracking.customer.division || tracking.division,
        district: tracking.customer.district || tracking.district,
        city: tracking.customer.city || tracking.city,
        upzila: tracking.customer.upzila || tracking.upzila,
        postCode: tracking.customer.postCode || tracking.postCode,
        pincode: tracking.customer.pincode || tracking.pincode,
        phone: tracking.customer.phone || tracking.phone,
      };
    }
    // fallback: build from root fields
    return {
      fullName: tracking?.fullName,
      name: tracking?.name,
      address: tracking?.address,
      division: tracking?.division,
      district: tracking?.district,
      city: tracking?.city,
      upzila: tracking?.upzila,
      postCode: tracking?.postCode,
      pincode: tracking?.pincode,
      phone: tracking?.phone,
    };
  })();

  // Payment summary: prefer paymentSummary, fallback to root fields and customer fields
  const paymentSummary = (() => {
    if (tracking?.paymentSummary && typeof tracking.paymentSummary === 'object') {
      return {
        ...tracking.paymentSummary,
        paymentMethod: tracking.paymentSummary.paymentMethod || tracking?.customer?.paymentMethod || tracking?.paymentMethod || '-',
      };
    }
    return {
      subtotal: tracking?.subtotal ?? tracking?.total ?? 0,
      discount: tracking?.discount ?? 0,
      total: tracking?.total ?? 0,
      paymentMethod: tracking?.customer?.paymentMethod || tracking?.paymentMethod || '-',
    };
  })();

  // Prefer orderItems if available, fallback to items
  const items =
    Array.isArray(tracking?.orderItems) && tracking.orderItems.length > 0
      ? tracking.orderItems
      : Array.isArray(tracking?.items)
      ? tracking.items
      : [];

  const discount = tracking?.paymentSummary?.discount ?? 0;
  console.log(`Discount: ${discount}`);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/account/orders">
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            {tracking.orderNumber || orderId}
          </h1>
          {tracking.createdAt && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Placed on {new Date(tracking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        <Badge
          className="bg-green-500/10 text-green-600 border-green-200 font-semibold px-3 py-1"
          variant="outline">
          {tracking.status
            ? tracking.status.charAt(0).toUpperCase() + tracking.status.slice(1)
            : '-'}
        </Badge>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">

                {/* Order Items Section */}
                <div className="lg:col-span-2">
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No items found
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {items.map((item: any, index: number) => (
                            <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                              <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 relative">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.productName || item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                                  {item.productName || item.name || 'Product'}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                  <div className="text-gray-600">
                                    <span className="text-xs text-gray-500">Qty:</span>{' '}
                                    <span className="font-medium text-gray-900">{item.quantity}</span>
                                  </div>
                                  <div className="text-gray-600">
                                    <span className="text-xs text-gray-500">Price:</span>{' '}
                                    <span className="font-medium text-gray-900">{formatPrice(item.price || 0)}</span>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Total:</span>{' '}
                                  <span className="font-bold text-gray-900">
                                    {formatPrice((item.price || 0) * (item.quantity || 0))}
                                  </span>
                                </div>

                                {/* Display assigned units (IMEI/Serial) if available */}
                                {item.orderItemUnits && item.orderItemUnits.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Assigned Units:</p>
                                    <div className="space-y-2">
                                      {item.orderItemUnits.map((unit: any, unitIdx: number) => (
                                        <div key={unitIdx} className="text-xs bg-gray-50 border border-gray-200 rounded p-2">
                                          {unit.imei && (
                                            <div className="text-gray-600">
                                              <span className="text-gray-500">IMEI:</span> <span className="font-mono">{unit.imei}</span>
                                            </div>
                                          )}
                                          {unit.serial && (
                                            <div className="text-gray-600">
                                              <span className="text-gray-500">Serial:</span> <span className="font-mono">{unit.serial}</span>
                                            </div>
                                          )}
                                          {unit.status && (
                                            <div className="text-gray-600">
                                              <span className="text-gray-500">Status:</span> <span className="capitalize">{unit.status}</span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
        <div className="space-y-4 sm:space-y-6 lg:col-span-1">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-gray-900">
                  {shippingAddress.fullName || shippingAddress.name || '-'}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {shippingAddress.address || '-'}
                </p>
                <p className="text-gray-600">
                  {shippingAddress.division || '-'},{' '}
                  {shippingAddress.district || shippingAddress.city || '-'} -{' '}
                  {shippingAddress.postCode || shippingAddress.pincode || '-'}
                </p>
                <div className="flex items-center gap-2 text-gray-600 pt-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100">
                    <Phone className="h-3 w-3 text-gray-600" />
                  </div>
                  <span className="font-medium">{shippingAddress.phone || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(paymentSummary.subtotal || 0)}</span>
                </div>

                <Separator />
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">{formatPrice(paymentSummary.total || 0)}</span>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 mt-4">
                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {paymentSummary.paymentMethod || '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="black"
            className="w-full bg-white hover:bg-gray-50 border-gray-300 font-semibold shadow-sm"
            onClick={handlePrintInvoice}>
            Print Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withProtectedRoute(OrderDetailPage, {
  requiredRoles: ['user'],
});
