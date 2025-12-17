"use client"
import type React from 'react';
import {useState} from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  FolderTree,
  CreditCard,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Gift,
  Menu,
  X,
} from 'lucide-react';
import {Badge} from '../components/ui/badge';
import {Suspense} from 'react';
import {AdminHeader} from '../components/admin/admin-header';

const sidebarLinks = [
  {href: '/admin', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/admin/banners', label: 'Banners', icon: ImageIcon},
  {href: '/admin/brand', label: 'Brand', icon: TrendingUp},
  {href: '/admin/categories', label: 'Categories', icon: FolderTree},
  {href: '/admin/corporate', label: 'Corporate Deals', icon: Users},
  {href: '/admin/delivery', label: 'Delivery Methods', icon: Package},
  {href: '/admin/emi', label: 'EMI Plans', icon: CreditCard},
  {href: '/admin/products', label: 'Products', icon: Package},
  {href: '/admin/giveaways', label: 'Giveaways', icon: Gift},
  {href: '/admin/product-faqs', label: 'Product Faqs', icon: MessageSquare},
  {href: '/admin/blog', label: 'Blog', icon: BookOpen},
  {href: '/admin/homeshow-category', label: 'HomeShow Category', icon: FolderTree},
  {href: '/admin/product-care-plan', label: 'Product Care Plan', icon: Settings},
  {href: '/admin/privacy-policy', label: 'Privacy Policy', icon: Settings},
  {href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badge: '12'},
  {href: '/admin/customers', label: 'Customers', icon: Users},
  {href: '/admin/flashsell', label: 'Flash Sell', icon: TrendingUp},
//warranty
  {href: '/admin/warranty', label: 'Warranty', icon: CreditCard},
  {
    href: '/admin/notify-products',
    label: 'Notify Products',
    icon: AlertCircle,
    badge: 'new',
  },
  {href: '/admin/settings', label: 'Settings', icon: Settings},
];

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0 lg:block ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/admin" className="text-xl font-bold">
              Admin Panel
            </Link>
          </div>
          <div className="flex flex-col h-[calc(100vh-64px)]">
            <nav className="flex-1 overflow-y-auto space-y-1 p-4">
              {sidebarLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <link.icon className="h-5 w-5" />
                  {link.label}
                  {link.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
            <div className="border-t border-border p-4">
              <Link
                href="/"
                onClick={closeSidebar}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <LogOut className="h-5 w-5" />
                Back to Store
              </Link>
            </div>
          </div>
        </aside>
      </Suspense>

      <div className="flex-1 lg:ml-64 flex flex-col">
        <Suspense fallback={<div className="h-16 bg-background" />}>
          <AdminHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </Suspense>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
