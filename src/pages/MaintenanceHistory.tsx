import React from 'react';
import { Clock, Search, Filter, Download } from 'lucide-react';

const MaintenanceHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0A192F] tracking-tighter uppercase">Histórico de Manutenções</h2>
          <p className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mt-1">Registro global de todas as intervenções técnicas</p>
        </div>
        <button className="bg-[#0A192F] text-white px-8 py-4 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#112240] transition-all shadow-xl rounded-none border-b-4 border-[#FF6B00]">
          <Download size={18} />
          Exportar Relatório
        </button>
      </header>

      <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-none">
        <div className="p-6 border-b border-[#E5E7EB] flex flex-col lg:flex-row gap-4 bg-[#F9FAFB]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <input 
              type="text" 
              placeholder="BUSCAR POR EQUIPAMENTO OU RESPONSÁVEL..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-0 focus:border-[#0A192F] rounded-none"
            />
          </div>
          <button className="px-6 py-3 bg-white border border-[#E5E7EB] text-xs font-bold text-[#4B5563] flex items-center gap-2 hover:bg-[#F9FAFB] uppercase tracking-widest rounded-none">
            <Filter size={16} />
            Filtrar por Data
          </button>
        </div>
        
        <div className="p-20 text-center">
          <Clock size={48} className="mx-auto text-[#E5E7EB] mb-4" />
          <p className="text-sm text-[#6B7280] font-bold uppercase tracking-widest">Módulo em desenvolvimento</p>
          <p className="text-xs text-[#9CA3AF] mt-2">O histórico global será integrado na Fase 3.</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistory;
