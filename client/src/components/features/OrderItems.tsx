"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderItemsProps {
  items: string[];
}

export default function OrderItems({ items }: OrderItemsProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item}</TableCell>
            <TableCell>1</TableCell>
            <TableCell>$99.99</TableCell>
            <TableCell>$99.99</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
