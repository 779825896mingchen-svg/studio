
"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, MapPin, CheckCircle2, Package, Timer, ChefHat, User, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'Received' | 'Preparing' | 'Ready for Pickup' | 'Picked Up';

type Order = {
  id: string;
  customerName: string;
  phone: string;
  items: { name: string, quantity: number, instructions?: string }[];
  total: number;
  status: OrderStatus;
  timestamp: Date;
  pickupTime: string;
};

const mockOrders: Order[] = [
  {
    id: "ORD-1234",
    customerName: "Gavin Belson",
    phone: "(555) 000-1111",
    items: [
      { name: "General Tso Chicken", quantity: 2, instructions: "Extra spicy please" },
      { name: "Imperial Dim Sum Platter", quantity: 1 }
    ],
    total: 46.85,
    status: 'Received',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    pickupTime: "6:45 PM"
  },
  {
    id: "ORD-1235",
    customerName: "Laurie Bream",
    phone: "(555) 222-3333",
    items: [
      { name: "Yangzhou Fried Rice", quantity: 1 },
      { name: "Crispy Spring Rolls", quantity: 3 }
    ],
    total: 31.45,
    status: 'Preparing',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    pickupTime: "6:30 PM"
  }
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const { toast } = useToast();

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    if (newStatus === 'Ready for Pickup') {
      toast({
        title: "SMS Sent",
        description: `Customer has been notified that order ${orderId} is ready.`,
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Order ${orderId} is now: ${newStatus}`,
      });
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Received': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Preparing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Ready for Pickup': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-headline font-bold text-primary">Live Orders</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Connected to Royal Dispatch • {orders.length} active orders
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-xl">History</Button>
            <Button className="bg-primary hover:bg-primary/90 rounded-xl">Terminal View</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {orders.map((order) => (
            <Card key={order.id} className={`border-l-4 transition-all duration-300 ${
              order.status === 'Received' ? 'border-l-blue-500' : 
              order.status === 'Preparing' ? 'border-l-orange-500' : 
              'border-l-green-500'
            } shadow-md`}>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{order.id}</Badge>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2 mt-2">
                    <User className="w-4 h-4 text-muted-foreground" /> {order.customerName}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Scheduled Pickup</p>
                  <p className="text-xl font-headline font-bold text-primary flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {order.pickupTime}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Package className="w-4 h-4" /> Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-start border-b border-border/50 pb-2">
                          <div>
                            <p className="font-bold text-sm"><span className="text-primary">{item.quantity}x</span> {item.name}</p>
                            {item.instructions && <p className="text-xs text-orange-600 font-medium italic">"{item.instructions}"</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex justify-between items-center font-bold">
                      <span className="text-muted-foreground">Total Value</span>
                      <span className="text-xl text-primary">${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Timer className="w-4 h-4" /> Management Actions
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {order.status === 'Received' && (
                          <Button onClick={() => updateStatus(order.id, 'Preparing')} className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                            <ChefHat className="mr-2 w-4 h-4" /> Start Preparing
                          </Button>
                        )}
                        {order.status === 'Preparing' && (
                          <Button onClick={() => updateStatus(order.id, 'Ready for Pickup')} className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl">
                            <CheckCircle2 className="mr-2 w-4 h-4" /> Ready & Send SMS
                          </Button>
                        )}
                        {order.status === 'Ready for Pickup' && (
                          <Button onClick={() => updateStatus(order.id, 'Picked Up')} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl">
                            <Package className="mr-2 w-4 h-4" /> Confirm Pickup
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" /> {order.phone}
                      </div>
                      <Button variant="link" size="sm" className="p-0 h-auto text-primary font-bold">
                        Call Customer <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
