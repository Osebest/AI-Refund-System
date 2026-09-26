import { Customer, Order, PolicyDecision, RefundRequest } from "../types";

export function evaluateRefund(
  customer: Customer,
  order: Order,
  request: Pick<RefundRequest, "message">,
): PolicyDecision {
  void customer;
  const ageDays = Math.floor(
    (Date.now() - new Date(order.purchaseDate).getTime()) / 86400000,
  );
  if (order.finalSale)
    return {
      status: "denied",
      rule: "Final-sale items are not eligible for refunds.",
    };
  if (ageDays > 30)
    return {
      status: "denied",
      rule: "Orders older than 30 days cannot be refunded.",
    };
  if (order.price > 500)
    return {
      status: "escalated",
      rule: "Refunds above $500 require proper review.",
    };
  const text = request.message.toLowerCase();
  const claimsWrong = /wrong|incorrect|different item/.test(text);
  const claimsDamage = /damaged|broken|defect/.test(text);
  if (claimsWrong && order.condition !== "wrong-item")
    return {
      status: "escalated",
      rule: "The wrong-item claim conflicts with the order condition.",
    };
  if (claimsDamage && order.condition !== "damaged")
    return {
      status: "escalated",
      rule: "The damage claim conflicts with the order condition.",
    };
  if (order.condition === "damaged" || order.condition === "wrong-item")
    return {
      status: "approved",
      rule: "Damaged or incorrect items may qualify for approval.",
    };
  return {
    status: "escalated",
    rule: "The request will be escalated for review due to conflicting or suspicious claims.",
  };
}
