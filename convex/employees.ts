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
    department: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    let employees;
    
    if (args.department) {
      employees = await ctx.db.query("employees")
        .withIndex("by_department", (q) => q.eq("department", args.department!))
        .collect();
    } else if (args.status) {
      employees = await ctx.db.query("employees")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      employees = await ctx.db.query("employees").collect();
    }
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      return employees.filter(employee => 
        employee.name.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        employee.position.toLowerCase().includes(searchLower)
      );
    }
    
    return employees;
  },
});

export const get = query({
  args: { id: v.id("employees") },
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
    position: v.string(),
    department: v.string(),
    salary: v.number(),
    hireDate: v.string(),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    return await ctx.db.insert("employees", {
      ...args,
      status: "active",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("employees"),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    position: v.string(),
    department: v.string(),
    salary: v.number(),
    hireDate: v.string(),
    status: v.string(),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    
    const employees = await ctx.db.query("employees").collect();
    const activeEmployees = employees.filter(e => e.status === "active").length;
    const departments = [...new Set(employees.map(e => e.department))];
    
    return {
      total: employees.length,
      active: activeEmployees,
      departments: departments.length,
    };
  },
});
