"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Calendar, User } from "lucide-react";

interface OrderDetailsProps {
  orderNumber: number;
  customerName: string;
  orderDate: Date;
  status: string;
  shippingAddress?: string;
}

export default function OrderDetails({
  orderNumber,
  customerName,
  orderDate,
  status,
  shippingAddress = "123 Shipping Street, City, Country"
}: OrderDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Order Number</p>
                <p className="text-lg font-semibold">#{orderNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p className="text-lg font-semibold">{customerName}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Order Date</p>
                <p className="text-lg font-semibold">
                  {new Date(orderDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                <p className="text-lg font-semibold">{shippingAddress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <p className="text-sm font-medium text-gray-500">Status:</p>
          <Badge variant="secondary" className={`${getStatusColor(status)} capitalize`}>
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
