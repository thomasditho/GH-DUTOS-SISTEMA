import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { Package, CheckCircle, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

interface DashboardProps {
  onNavigate?: (tab: string, filter?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/dashboard/stats')
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white border border-[#E5E7EB]" />)}
    </div>
    <div className="h-96 bg-white border border-[#E5E7EB]" />
  </div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERACIONAL': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'MANUTENCAO': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'CRITICO': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-[#0A192F] tracking-tight">Visão Geral do Sistema</h2>
        <p className="text-[#6B7280] mt-1">Acompanhe o status dos ativos e as últimas intervenções técnicas.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 border-l-4 border-[#0A192F] shadow-sm rounded-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Total de Ativos</p>
              <p className="text-4xl font-black text-[#0A192F] mt-2">{stats.totalEquipments}</p>
            </div>
            <div className="p-4 bg-slate-50 text-[#0A192F]">
              <Package size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 border-l-4 border-red-500 shadow-sm rounded-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Manutenções Vencidas</p>
              <p className="text-4xl font-black text-red-600 mt-2">{stats.maintenanceAlerts?.overdue || 0}</p>
            </div>
            <div className="p-4 bg-red-50 text-red-600">
              <AlertTriangle size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 border-l-4 border-amber-500 shadow-sm rounded-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Próximos 15 dias</p>
              <p className="text-4xl font-black text-amber-600 mt-2">{stats.maintenanceAlerts?.upcoming || 0}</p>
            </div>
            <div className="p-4 bg-amber-50 text-amber-600">
              <Clock size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 border-l-4 border-emerald-500 shadow-sm rounded-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Operacionais</p>
              <p className="text-4xl font-black text-emerald-600 mt-2">
                {stats.statusCounts.find((s: any) => s.status === 'OPERACIONAL')?._count?._all || 0}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 text-emerald-600">
              <CheckCircle size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Maintenances */}
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] shadow-sm rounded-none">
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
            <h3 className="font-black text-[#0A192F] uppercase tracking-[0.2em] text-xs">Últimas Intervenções</h3>
            <button 
              onClick={() => onNavigate?.('maintenances')}
              className="text-[10px] font-bold text-[#0A192F] flex items-center gap-1 hover:underline tracking-widest"
            >
              HISTÓRICO COMPLETO <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9FAFB] text-[10px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Equipamento</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {Array.isArray(stats?.recentMaintenances) && stats.recentMaintenances.map((m: any) => (
                  <tr key={m.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#0A192F]">{formatDate(m.data)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#0A192F]">{m.equipment.codigo}</div>
                      <div className="text-[10px] text-[#6B7280] uppercase">{m.equipment.tipo}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4B5563] max-w-xs truncate">{m.descricao}</td>
                    <td className="px-6 py-4 text-sm text-[#4B5563]">{m.responsavel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-none flex flex-col">
          <div className="p-6 border-b border-[#E5E7EB] bg-red-50">
            <h3 className="font-black text-red-700 uppercase tracking-[0.2em] text-xs flex items-center gap-2">
              <AlertTriangle size={16} /> Alertas Críticos
            </h3>
          </div>
          <div className="flex-1 p-6 space-y-4">
            {(stats.statusCounts.find((s: any) => s.status === 'CRITICO')?._count?._all || 0) > 0 ? (
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Existem ativos que requerem atenção imediata. Verifique o inventário para mais detalhes.
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                <CheckCircle size={32} className="text-emerald-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Tudo sob controle</p>
              </div>
            )}
            
            <button 
              onClick={() => onNavigate?.('equipments', 'CRITICO')}
              className="w-full py-4 bg-[#0A192F] text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#112240] transition-all"
            >
              Ver Ativos Críticos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
