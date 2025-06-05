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
    search: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    let clients;
    
    if (args.status) {
      clients = await ctx.db.query("clients")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      clients = await ctx.db.query("clients").collect();
    }
    

    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      return clients.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.includes(args.search!)
      );
    }
    
    return clients;
  },
});

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    zipCode: v.string(),
    cpfCnpj: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    return await ctx.db.insert("clients", {
      ...args,
      status: "active",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    zipCode: v.string(),
    cpfCnpj: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    
    const clients = await ctx.db.query("clients").collect();
    const activeClients = clients.filter(c => c.status === "active").length;
    const inactiveClients = clients.filter(c => c.status === "inactive").length;
    
    return {
      total: clients.length,
      active: activeClients,
      inactive: inactiveClients,
    };
  },
});
