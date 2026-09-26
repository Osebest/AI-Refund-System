export type RefundStatus = "approved" | "denied" | "escalated";
export type RefundCategory =
  | "damaged"
  | "wrong_item"
  | "changed_mind"
  | "other";

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
export interface RefundRequest {
  id: string;
  timestamp: string;
  customerId: string;
  orderId: string;
  message: string;
  ruleFired: string;
  ai: AiClassification;
  finalStatus: RefundStatus;
  customerMessage: string;
}
export interface AiClassification {
  category: RefundCategory;
  confidence: number;
  suspicious: boolean;
  customer_message: string;
  reasoning: string;
}
export interface PolicyDecision {
  status: RefundStatus;
  rule: string;
}
