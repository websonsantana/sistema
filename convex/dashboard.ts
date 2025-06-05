import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireAuth(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}

export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    
    // Get all data
    const clients = await ctx.db.query("clients").collect();
    const employees = await ctx.db.query("employees").collect();
    const services = await ctx.db.query("services").collect();
    const quotes = await ctx.db.query("quotes").collect();
    const receipts = await ctx.db.query("receipts").collect();
    
    // Calculate stats
    const activeClients = clients.filter(c => c.status === "active").length;
    const activeEmployees = employees.filter(e => e.status === "active").length;
    const activeServices = services.filter(s => s.status === "active").length;
    
    const pendingQuotes = quotes.filter(q => q.status === "pending").length;
    const approvedQuotes = quotes.filter(q => q.status === "approved").length;
    
    const paidReceipts = receipts.filter(r => r.status === "paid");
    const pendingReceipts = receipts.filter(r => r.status === "pending");
    
    const totalRevenue = paidReceipts.reduce((sum, r) => sum + r.amount, 0);
    const pendingAmount = pendingReceipts.reduce((sum, r) => sum + r.amount, 0);
    
    // Monthly revenue (last 6 months)
    const now = new Date();
    const monthlyRevenue = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthReceipts = paidReceipts.filter(r => {
        if (!r.paidAt) return false;
        const paidDate = new Date(r.paidAt);
        return paidDate >= date && paidDate < nextDate;
      });
      
      const revenue = monthReceipts.reduce((sum, r) => sum + r.amount, 0);
      
      monthlyRevenue.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        revenue,
      });
    }
    
    // Service categories distribution
    const serviceCategories = services.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Payment methods distribution
    const paymentMethods = paidReceipts.reduce((acc, receipt) => {
      acc[receipt.paymentMethod] = (acc[receipt.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      stats: {
        clients: { total: clients.length, active: activeClients },
        employees: { total: employees.length, active: activeEmployees },
        services: { total: services.length, active: activeServices },
        quotes: { total: quotes.length, pending: pendingQuotes, approved: approvedQuotes },
        receipts: { 
          total: receipts.length, 
          paid: paidReceipts.length, 
          pending: pendingReceipts.length,
          totalRevenue,
          pendingAmount,
        },
      },
      charts: {
        monthlyRevenue,
        serviceCategories: Object.entries(serviceCategories).map(([name, value]) => ({ name, value })),
        paymentMethods: Object.entries(paymentMethods).map(([name, value]) => ({ name, value })),
      },
    };
  },
});
