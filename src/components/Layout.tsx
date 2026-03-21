import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Package, LogOut, User as UserIcon, Menu, X, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import Logo from './Logo';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'equipments', label: 'Ativos', icon: Package },
    { id: 'maintenances', label: 'Manutenções', icon: Clock },
    ...(user?.role === 'ADMIN' ? [{ id: 'users', label: 'Usuários', icon: UserIcon }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      <Toaster position="top-right" richColors theme="light" expand={false} />
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0A192F] text-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 rounded-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-white/5">
          <Logo variant="light" size="sm" />
          <p className="text-[9px] text-white/30 mt-2 uppercase tracking-[0.2em] font-medium">Sistemas de Manutenção</p>
        </div>

        <nav className="mt-8 px-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-none border-l-4",
                activeTab === item.id 
                  ? "bg-white/5 border-[#FF6B00] text-white" 
                  : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/5 bg-[#0A192F]">
          <div className="flex items-center gap-3 px-2 py-2 mb-6">
            <div className="w-8 h-8 bg-white/10 flex items-center justify-center text-white rounded-none">
              <UserIcon size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold truncate uppercase tracking-wider">{user?.name}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-colors rounded-none border border-red-400/20"
          >
            <LogOut size={14} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 md:px-10">
          <button 
            className="md:hidden p-2 -ml-2 text-[#4B5563]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="hidden md:block">
             <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-[0.2em]">
               {activeTab === 'dashboard' ? 'Visão Geral da Planta' : 
                activeTab === 'equipments' ? 'Inventário de Ativos' :
                activeTab === 'maintenances' ? 'Histórico de Intervenções' : 'Gestão de Acessos'}
             </h2>
          </div>
          <div className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-[0.15em]">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <div className="flex-1 p-8 md:p-10 overflow-auto bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};


export default Layout;
