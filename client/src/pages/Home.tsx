"use client";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Order } from "@shared/schema";

export default function Home() {
  const { data: orders, isLoading } = useQuery<Order[]>({ 
    queryKey: ['/api/orders']
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders?.map(order => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold">${order.total}</p>
              </div>

              <a href={`/orders/${order.id}`}>
                <Button className="w-full">View Details</Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
