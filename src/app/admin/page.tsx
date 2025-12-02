"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"
import { formatPrice } from "../lib/utils/format"
import Link from "next/link"
import { withProtectedRoute } from "../lib/auth/protected-route"

const stats = [
  {
    title: "Total Revenue",
    value: formatPrice(2456789),
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Total Customers",
    value: "5,678",
    change: "+15.3%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Total Products",
    value: "456",
    change: "-2.1%",
    trend: "down",
    icon: Package,
  },
]

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", amount: 129999, status: "Processing", date: "2 min ago" },
  { id: "ORD-002", customer: "Jane Smith", amount: 49999, status: "Shipped", date: "15 min ago" },
  { id: "ORD-003", customer: "Bob Wilson", amount: 79999, status: "Delivered", date: "1 hour ago" },
  { id: "ORD-004", customer: "Alice Brown", amount: 15999, status: "Processing", date: "2 hours ago" },
  { id: "ORD-005", customer: "Charlie Davis", amount: 249999, status: "Pending", date: "3 hours ago" },
]

const topProducts = [
  { name: "iPhone 15 Pro Max", sales: 234, revenue: 30419766 },
  { name: "MacBook Air M3", sales: 156, revenue: 12479844 },
  { name: "Samsung Galaxy S24", sales: 189, revenue: 17009811 },
  { name: "AirPods Pro 2", sales: 312, revenue: 4991688 },
  { name: "Sony WH-1000XM5", sales: 98, revenue: 2939902 },
]

function getStatusColor(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-green-500/10 text-green-600"
    case "Shipped":
      return "bg-blue-500/10 text-blue-600"
    case "Processing":
      return "bg-yellow-500/10 text-yellow-600"
    case "Pending":
      return "bg-orange-500/10 text-orange-600"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your store.</p>
        </div>
        <Button className="gap-2">
          <ArrowUpRight className="h-4 w-4" />
          View Reports
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.amount)}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        {order.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Products</CardTitle>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <p className="font-medium">{formatPrice(product.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withProtectedRoute(AdminDashboard, {
  requiredRoles: ["admin"],
  fallbackTo: "/login",
  showLoader: true,
})
