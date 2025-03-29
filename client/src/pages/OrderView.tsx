"use client";
// Using URL path parsing instead of wouter
import { useQuery } from "@tanstack/react-query";
import { 
  Card, CardContent, CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Mail, X } from "lucide-react";
import OrderTimeline from "@/components/features/OrderTimeline";
import OrderFinancials from "@/components/features/OrderFinancials";
import OrderItems from "@/components/features/OrderItems";
import type { Order } from "@shared/schema";

export default function OrderView() {
  // Extract ID from the URL path
  const id = parseInt(window.location.pathname.split('/').pop() || '0');
  const { data: order, isLoading } = useQuery<Order>({ 
    queryKey: ['/api/orders', id]
  });

  if (isLoading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-gray-600">{order.customerName}</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="destructive" size="sm">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderItems items={order.items} />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <OrderTimeline status={order.status} createdAt={order.createdAt} />
          <OrderFinancials total={order.total} />
        </div>
      </div>
    </div>
  );
}
