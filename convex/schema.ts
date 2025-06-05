import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  clients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    zipCode: v.string(),
    cpfCnpj: v.string(),
    status: v.string(), // "active", "inactive"
    notes: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  employees: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    position: v.string(),
    department: v.string(),
    salary: v.number(),
    hireDate: v.string(),
    status: v.string(), // "active", "inactive"
    skills: v.array(v.string()),
  })
    .index("by_department", ["department"])
    .index("by_status", ["status"]),

  services: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    duration: v.number(), // in hours
    status: v.string(), // "active", "inactive"
    materials: v.optional(v.array(v.string())),
  })
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  quotes: defineTable({
    clientId: v.id("clients"),
    serviceIds: v.array(v.id("services")),
    employeeId: v.id("employees"),
    description: v.string(),
    totalAmount: v.number(),
    status: v.string(), // "pending", "approved", "rejected", "expired"
    validUntil: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_client", ["clientId"])
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"]),

  receipts: defineTable({
    quoteId: v.optional(v.id("quotes")),
    clientId: v.id("clients"),
    employeeId: v.id("employees"),
    description: v.string(),
    amount: v.number(),
    paymentMethod: v.string(), // "cash", "card", "transfer", "pix"
    status: v.string(), // "paid", "pending", "cancelled"
    dueDate: v.string(),
    paidAt: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_client", ["clientId"])
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"])
    .index("by_payment_method", ["paymentMethod"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
