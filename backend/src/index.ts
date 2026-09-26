import "dotenv/config";
import express from "express";
import cors from "cors";
import { seedData } from "./data/seed";
import { readJson } from "./data/store";
import { healthRouter } from "./routes/health";
import { refundsRouter } from "./routes/refunds";
import { Customer, Order } from "./types";

const app = express();
const port = Number(process.env.BACKEND_PORT || 4000);
app.use(cors({ origin: true }));
app.use(express.json());
app.use("/api/health", healthRouter);
app.use("/api/refunds", refundsRouter);
app.get("/api/customers", async (_req, res) => {
  res.json(await readJson<Customer[]>("customers.json", []));
});
app.get("/api/orders", async (_req, res) => {
  res.json(await readJson<Order[]>("orders.json", []));
});
app.get("/api/customers/:id", async (req, res) => {
  const value = (await readJson<Customer[]>("customers.json", [])).find(
    (entry) => entry.id === req.params.id,
  );
  value
    ? res.json(value)
    : res.status(404).json({ error: "Customer not found." });
});
app.get("/api/orders/:id", async (req, res) => {
  const value = (await readJson<Order[]>("orders.json", [])).find(
    (entry) => entry.id === req.params.id,
  );
  value ? res.json(value) : res.status(404).json({ error: "Order not found." });
});
seedData()
  .then(() =>
    app.listen(port, () =>
      console.log(`Backend listening on http://localhost:${port}`),
    ),
  )
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
