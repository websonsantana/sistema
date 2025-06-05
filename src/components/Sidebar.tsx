import { 
  HomeIcon, 
  UsersIcon, 
  UserGroupIcon, 
  CogIcon, 
  DocumentTextIcon, 
  ReceiptPercentIcon,
  XMarkIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: HomeIcon },
  { id: "clients", label: "Clientes", icon: UsersIcon },
  { id: "employees", label: "Funcionários", icon: UserGroupIcon },
  { id: "services", label: "Serviços", icon: CogIcon },
  { id: "quotes", label: "Orçamentos", icon: DocumentTextIcon },
  { id: "receipts", label: "Recibos", icon: ReceiptPercentIcon },
];

export function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-lg border-r border-white/20 
        shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-900">Admin System</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100/50"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-100/80 text-indigo-700 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100/50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
