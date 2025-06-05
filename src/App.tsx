import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Authenticated>
        <AdminSystem />
      </Authenticated>
      <Unauthenticated>
        <LoginPage />
      </Unauthenticated>
      <Toaster />
    </div>
  );
}

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema Administrativo
          </h1>
          <p className="text-gray-600">
            Gerencie sua empresa de serviços técnicos
          </p>
        </div>
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}

function AdminSystem() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header 
          user={loggedInUser}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-4 lg:p-8">
          <Dashboard currentPage={currentPage} />
        </main>
      </div>
    </div>
  );
}
