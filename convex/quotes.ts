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
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    let quotes;
    
    if (args.clientId) {
      quotes = await ctx.db.query("quotes")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId!))
        .collect();
    } else if (args.status) {
      quotes = await ctx.db.query("quotes")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      quotes = await ctx.db.query("quotes").collect();
    }
    
    // Get related data
    const quotesWithData = await Promise.all(
      quotes.map(async (quote) => {
        const client = await ctx.db.get(quote.clientId);
        const employee = await ctx.db.get(quote.employeeId);
        const services = await Promise.all(
          quote.serviceIds.map(id => ctx.db.get(id))
        );
        
        return {
          ...quote,
          client,
          employee,
          services: services.filter(Boolean),
        };
      })
    );
    
    return quotesWithData;
  },
});

export const get = query({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const quote = await ctx.db.get(args.id);
    if (!quote) return null;
    
    const client = await ctx.db.get(quote.clientId);
    const employee = await ctx.db.get(quote.employeeId);
    const services = await Promise.all(
      quote.serviceIds.map(id => ctx.db.get(id))
    );
    
    return {
      ...quote,
      client,
      employee,
      services: services.filter(Boolean),
    };
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    serviceIds: v.array(v.id("services")),
    employeeId: v.id("employees"),
    description: v.string(),
    totalAmount: v.number(),
    validUntil: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    return await ctx.db.insert("quotes", {
      ...args,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("quotes"),
    clientId: v.id("clients"),
    serviceIds: v.array(v.id("services")),
    employeeId: v.id("employees"),
    description: v.string(),
    totalAmount: v.number(),
    status: v.string(),
    validUntil: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    
    const quotes = await ctx.db.query("quotes").collect();
    const pending = quotes.filter(q => q.status === "pending").length;
    const approved = quotes.filter(q => q.status === "approved").length;
    const totalValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0);
    
    return {
      total: quotes.length,
      pending,
      approved,
      totalValue,
    };
  },
});
