import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireAuth(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}

export const list = query({
  args: {
    status: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    let receipts;
    
    if (args.clientId) {
      receipts = await ctx.db.query("receipts")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId!))
        .collect();
    } else if (args.status) {
      receipts = await ctx.db.query("receipts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else if (args.paymentMethod) {
      receipts = await ctx.db.query("receipts")
        .withIndex("by_payment_method", (q) => q.eq("paymentMethod", args.paymentMethod!))
        .collect();
    } else {
      receipts = await ctx.db.query("receipts").collect();
    }
    
    // Get related data
    const receiptsWithData = await Promise.all(
      receipts.map(async (receipt) => {
        const client = await ctx.db.get(receipt.clientId);
        const employee = await ctx.db.get(receipt.employeeId);
        const quote = receipt.quoteId ? await ctx.db.get(receipt.quoteId) : null;
        
        return {
          ...receipt,
          client,
          employee,
          quote,
        };
      })
    );
    
    return receiptsWithData;
  },
});

export const get = query({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const receipt = await ctx.db.get(args.id);
    if (!receipt) return null;
    
    const client = await ctx.db.get(receipt.clientId);
    const employee = await ctx.db.get(receipt.employeeId);
    const quote = receipt.quoteId ? await ctx.db.get(receipt.quoteId) : null;
    
    return {
      ...receipt,
      client,
      employee,
      quote,
    };
  },
});

export const create = mutation({
  args: {
    quoteId: v.optional(v.id("quotes")),
    clientId: v.id("clients"),
    employeeId: v.id("employees"),
    description: v.string(),
    amount: v.number(),
    paymentMethod: v.string(),
    dueDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    return await ctx.db.insert("receipts", {
      ...args,
      status: "pending",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("receipts"),
    quoteId: v.optional(v.id("quotes")),
    clientId: v.id("clients"),
    employeeId: v.id("employees"),
    description: v.string(),
    amount: v.number(),
    paymentMethod: v.string(),
    status: v.string(),
    dueDate: v.string(),
    paidAt: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    
    const receipts = await ctx.db.query("receipts").collect();
    const paid = receipts.filter(r => r.status === "paid");
    const pending = receipts.filter(r => r.status === "pending");
    const totalRevenue = paid.reduce((sum, r) => sum + r.amount, 0);
    const pendingAmount = pending.reduce((sum, r) => sum + r.amount, 0);
    
    return {
      total: receipts.length,
      paid: paid.length,
      pending: pending.length,
      totalRevenue,
      pendingAmount,
    };
  },
});
