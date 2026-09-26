import { readJson, writeJson } from "./store";
import { Customer, Order, RefundRequest } from "../types";

const customers: Customer[] = Array.from({ length: 15 }, (_, index) => ({
  id: `cus_${String(index + 1).padStart(3, "0")}`,
  name: [
    "Avery Stone",
    "Mina Patel",
    "Jordan Lee",
    "Sam Rivera",
    "Taylor Brooks",
    "Casey Nguyen",
    "Morgan Ellis",
    "Riley Chen",
    "Jamie Hart",
    "Drew Foster",
    "Alex Kim",
    "Quinn Parker",
    "Emery Davis",
    "Cameron Wells",
    "Robin Shah",
  ][index],
  email: `customer${index + 1}@example.test`,
  tier: index % 4 === 0 ? "gold" : "standard",
}));

const items = [
  "Wireless Headphones",
  "Desk Lamp",
  "Travel Backpack",
  "Mechanical Keyboard",
  "Ceramic Mug",
  "Running Shoes",
  "USB-C Dock",
  "Smart Watch",
  "Cotton Hoodie",
  "Noise Machine",
  "Monitor Stand",
  "Camera Strap",
  "Water Bottle",
  "Notebook Set",
  "Portable Charger",
];
const orders: Order[] = customers.flatMap((customer, customerIndex) =>
  Array.from({ length: (customerIndex % 3) + 1 }, (_, orderIndex) => {
    const age = (customerIndex * 7 + orderIndex * 11) % 45;
    return {
      id: `ord_${String(customerIndex * 3 + orderIndex + 1).padStart(3, "0")}`,
      customerId: customer.id,
      item: items[(customerIndex + orderIndex) % items.length],
      price: [39.99, 89.5, 149, 249, 599][(customerIndex + orderIndex) % 5],
      purchaseDate: new Date(Date.now() - age * 86400000)
        .toISOString()
        .slice(0, 10),
      finalSale: customerIndex % 7 === 0 && orderIndex === 0,
      condition:
        customerIndex % 6 === 0 && orderIndex === 0
          ? "damaged"
          : customerIndex % 8 === 0 && orderIndex === 1
            ? "wrong-item"
            : "none",
    } as Order;
  }),
);

export async function seedData() {
  const existing = await readJson<Customer[]>("customers.json", []);
  if (!existing.length) await writeJson("customers.json", customers);
  if (!(await readJson<Order[]>("orders.json", [])).length)
    await writeJson("orders.json", orders);
  if (!(await readJson<RefundRequest[]>("requests.json", [])).length)
    await writeJson("requests.json", []);
}
