import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries/orders";
import { OrderDetailContent } from "./order-detail-content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) return notFound();

  return <OrderDetailContent order={order} />;
}
