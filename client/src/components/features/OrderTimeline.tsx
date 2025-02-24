"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Package, Truck } from "lucide-react";

const timelineSteps = [
  { icon: Clock, label: "Order Placed", status: "completed" },
  { icon: Package, label: "Processing", status: "completed" },
  { icon: Truck, label: "Shipping", status: "current" },
  { icon: CheckCircle, label: "Delivered", status: "pending" }
];

interface OrderTimelineProps {
  status: string;
  createdAt: Date;
}

export default function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-start gap-3">
                <div className={`rounded-full p-2 ${
                  step.status === 'completed' ? 'bg-green-100 text-green-600' :
                  step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-medium">{step.label}</p>
                  <p className="text-sm text-gray-600">
                    {index === 0 ? new Date(createdAt).toLocaleDateString() : "Pending"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
