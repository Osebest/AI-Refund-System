import { Router } from "express";
import { appendJson, readJson } from "../data/store";
import { classifyRefund } from "../ai/classify";
import { evaluateRefund } from "../policy/rules";
import { AiClassification, Customer, Order, RefundRequest, RefundStatus } from "../types";

export const refundsRouter = Router();
refundsRouter.get("/", async (_req, res) =>
  res.json(await readJson<RefundRequest[]>("requests.json", [])),
);
refundsRouter.post("/", async (req, res) => {
  const { customerId, orderId, message } = req.body || {};
  if (
    typeof customerId !== "string" ||
    typeof orderId !== "string" ||
    typeof message !== "string" ||
    !message.trim()
  )
    return res
      .status(400)
      .json({ error: "customerId, orderId, and message are required." });
  const customers = await readJson<Customer[]>("customers.json", []);
  const orders = await readJson<Order[]>("orders.json", []);
  const customer = customers.find((entry) => entry.id === customerId);
  const order = orders.find(
    (entry) => entry.id === orderId && entry.customerId === customerId,
  );
  if (!customer || !order)
    return res
      .status(404)
      .json({ error: "Customer or matching order not found." });
  const policy = evaluateRefund(customer, order, { message });
  let ai: AiClassification;
  try {
    ai = await classifyRefund(
      message,
      order,
      "Final sale denied; over 30 days denied; over $500 escalated; conflicting or suspicious claims escalated.",
    );
  } catch {
    ai = {
      category: "other",
      confidence: 0,
      suspicious: true,
      customer_message: "Your request needs review by our support team.",
      reasoning: "AI output was unavailable or invalid.",
    };
  }
  const finalStatus =
    policy.status === "approved" && ai.suspicious ? "escalated" : policy.status;
  const record: RefundRequest = {
    id: `req_${Date.now()}`,
    timestamp: new Date().toISOString(),
    customerId,
    orderId,
    message,
    ruleFired: policy.rule,
    ai,
    finalStatus,
    customerMessage:
      finalStatus === "approved"
        ? ai.customer_message
        : finalStatus === "denied"
          ? `This request was not approved: ${policy.rule}`
          : `This request has been escalated for review: ${policy.rule}`,
  };
  await appendJson("requests.json", record);
  res.status(201).json(record);
});
