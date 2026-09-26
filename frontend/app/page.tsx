"use client";
import { FormEvent, useEffect, useState } from "react";
import {
  Customer,
  getCustomers,
  getOrders,
  Order,
  submitRefund,
} from "./lib/api";

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState(
    "My item arrived damaged and I would like a refund.",
  );
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const customerOrders = orders.filter(
    (order) => order.customerId === customerId,
  );

  useEffect(() => {
    Promise.all([getCustomers(), getOrders()])
      .then(([customerList, orderList]) => {
        setCustomers(customerList);
        setOrders(orderList);
        if (customerList.length > 0) {
          const firstCustomer = customerList[0];
          setCustomerId(firstCustomer.id);
          setOrderId(
            orderList.find((order) => order.customerId === firstCustomer.id)
              ?.id ?? "",
          );
        }
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Could not load customer orders",
        ),
      );
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await submitRefund({ customerId, orderId, message }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setCustomerId("");
      setOrderId("");
      setMessage("");
    }
  }
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1fr_0.8fr]">
      <section>
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-coral">
          Customer care / refunds
        </p>
        <h1 className="max-w-xl text-5xl font-bold leading-[1.05]">
          Let’s make this right.
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-8 text-ink/70">
          Tell us what happened. We’ll check the order details and give you a
          clear next step.
        </p>
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <label className="block text-sm font-bold">
            Customer
            <select
              required
              value={customerId}
              onChange={(event) => {
                const nextCustomerId = event.target.value;
                setCustomerId(nextCustomerId);
                setOrderId(
                  orders.find((order) => order.customerId === nextCustomerId)
                    ?.id ?? "",
                );
              }}
              className="mt-2 w-full rounded border border-ink/20 bg-white/70 px-4 py-3"
              disabled={!customers.length}
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Order
            <select
              required
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              className="mt-2 w-full rounded border border-ink/20 bg-white/70 px-4 py-3"
              disabled={!customerOrders.length}
            >
              <option value="" disabled>
                Select an order
              </option>
              {customerOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.item} · {order.id} · ${order.price.toFixed(2)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            What happened?
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded border border-ink/20 bg-white/70 px-4 py-3"
            />
          </label>
          <button
            disabled={loading}
            className="rounded bg-ink px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Reviewing…" : "Submit refund request"}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      </section>

      {result && (
        <aside className="self-start rounded border border-ink/10 bg-white/70 p-7 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-coral">
            Decision
          </p>
          <p className="mt-3 text-3xl font-bold capitalize">
            {result.finalStatus}
          </p>
          <p className="mt-5 leading-7">{result.customerMessage}</p>
          <p className="mt-6 border-t border-ink/10 pt-5 text-sm text-ink/65">
            <b>Policy check:</b> {result.ruleFired}
          </p>
        </aside>
      )}
    </main>
  );
}
