import { SignOutButton } from "../SignOutButton";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface HeaderProps {
  user: any;
  onMenuClick: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100/50"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Sistema Administrativo
            </h1>
            <p className="text-sm text-gray-600">
              Bem-vindo, {user?.email || "Usuário"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
