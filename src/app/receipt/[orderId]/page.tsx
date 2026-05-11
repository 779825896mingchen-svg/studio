import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/app/lib/orders/local-orders-store";
import { ReceiptView } from "./receipt-view";

type Props = { params: Promise<{ orderId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId: raw } = await params;
  const orderId = decodeURIComponent(raw);
  return {
    title: `Receipt ${orderId} | Emperor's Choice`,
    robots: { index: false, follow: false },
  };
}

export default async function ReceiptPage({ params }: Props) {
  const { orderId: raw } = await params;
  const orderId = decodeURIComponent(raw).trim();
  if (!orderId) notFound();

  const order = await getOrderById(orderId);
  if (!order) notFound();

  return <ReceiptView order={order} />;
}
