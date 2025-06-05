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
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    let services;
    
    if (args.category) {
      services = await ctx.db.query("services")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.status) {
      services = await ctx.db.query("services")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      services = await ctx.db.query("services").collect();
    }
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      return services.filter(service => 
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.category.toLowerCase().includes(searchLower)
      );
    }
    
    return services;
  },
});

export const get = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    duration: v.number(),
    materials: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    return await ctx.db.insert("services", {
      ...args,
      status: "active",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    duration: v.number(),
    status: v.string(),
    materials: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    
    const services = await ctx.db.query("services").collect();
    const activeServices = services.filter(s => s.status === "active").length;
    const categories = [...new Set(services.map(s => s.category))];
    
    return {
      total: services.length,
      active: activeServices,
      categories: categories.length,
    };
  },
});
