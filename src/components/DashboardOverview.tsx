import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StatsCard } from "./ui/StatsCard";
import { ChartCard } from "./ui/ChartCard";
import { 
  UsersIcon, 
  UserGroupIcon, 
  CogIcon, 
  DocumentTextIcon, 
  ReceiptPercentIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

export function DashboardOverview() {
  const overview = useQuery(api.dashboard.getOverview);

  if (!overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { stats, charts } = overview;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Clientes"
          value={stats.clients.active}
          subtitle={`${stats.clients.total} total`}
          icon={UsersIcon}
          color="blue"
        />
        <StatsCard
          title="Funcionários"
          value={stats.employees.active}
          subtitle={`${stats.employees.total} total`}
          icon={UserGroupIcon}
          color="green"
        />
        <StatsCard
          title="Serviços"
          value={stats.services.active}
          subtitle={`${stats.services.total} total`}
          icon={CogIcon}
          color="purple"
        />
        <StatsCard
          title="Orçamentos"
          value={stats.quotes.pending}
          subtitle={`${stats.quotes.approved} aprovados`}
          icon={DocumentTextIcon}
          color="yellow"
        />
        <StatsCard
          title="Recibos"
          value={stats.receipts.paid}
          subtitle={`${stats.receipts.pending} pendentes`}
          icon={ReceiptPercentIcon}
          color="indigo"
        />
        <StatsCard
          title="Receita"
          value={`R$ ${stats.receipts.totalRevenue.toLocaleString('pt-BR')}`}
          subtitle={`R$ ${stats.receipts.pendingAmount.toLocaleString('pt-BR')} pendente`}
          icon={CurrencyDollarIcon}
          color="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard
          title="Receita Mensal"
          type="line"
          data={charts.monthlyRevenue}
          className="lg:col-span-2"
        />
        <ChartCard
          title="Categorias de Serviços"
          type="doughnut"
          data={charts.serviceCategories}
        />
        <ChartCard
          title="Métodos de Pagamento"
          type="bar"
          data={charts.paymentMethods}
          className="lg:col-span-1"
        />
      </div>
    </div>
  );
}
