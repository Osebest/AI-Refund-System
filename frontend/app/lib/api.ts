const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
export interface Customer {
  id: string;
  name: string;
  email: string;
  tier: string;
}
export interface Order {
  id: string;
  customerId: string;
  item: string;
  price: number;
  purchaseDate: string;
  finalSale: boolean;
  condition: "damaged" | "wrong-item" | "none";
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_URL}/api/customers`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load customers");
  return response.json();
}
export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/api/orders`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load orders");
  return response.json();
}

export async function getRefunds() {
  const response = await fetch(`${API_URL}/api/refunds`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load requests");
  return response.json();
}
export async function submitRefund(payload: {
  customerId: string;
  orderId: string;
  message: string;
}) {
  const response = await fetch(`${API_URL}/api/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not submit request");
  return data;
}
