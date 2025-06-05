import { DashboardOverview } from "./DashboardOverview";
import { ClientsPage } from "./pages/ClientsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { ServicesPage } from "./pages/ServicesPage";
import { QuotesPage } from "./pages/QuotesPage";
import { ReceiptsPage } from "./pages/ReceiptsPage";

interface DashboardProps {
  currentPage: string;
}

export function Dashboard({ currentPage }: DashboardProps) {
  switch (currentPage) {
    case "dashboard":
      return <DashboardOverview />;
    case "clients":
      return <ClientsPage />;
    case "employees":
      return <EmployeesPage />;
    case "services":
      return <ServicesPage />;
    case "quotes":
      return <QuotesPage />;
    case "receipts":
      return <ReceiptsPage />;
    default:
      return <DashboardOverview />;
  }
}
