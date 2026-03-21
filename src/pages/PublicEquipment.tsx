import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchApi } from '../services/api';
import { Package, History, Info, FileText, User, Clock, ShieldCheck } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

const PublicEquipment: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/public/equipment/${publicId}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setEquipment)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [publicId]);

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="animate-pulse text-[#0A192F] font-bold uppercase tracking-widest">Carregando Ativo...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-red-500 mb-4 flex justify-center"><Info size={48} /></div>
        <h2 className="text-xl font-bold text-[#0A192F]">Equipamento não encontrado</h2>
        <p className="text-[#6B7280] text-sm mt-2">O QR Code escaneado pode estar inválido ou o ativo foi removido do sistema.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A]">
      <header className="bg-[#0A192F] text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white flex items-center justify-center text-[#0A192F] font-bold">GH</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">DUTOS</h1>
              <p className="text-[8px] text-white/50 uppercase tracking-widest mt-0.5">Rastreabilidade</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={12} className="text-emerald-400" />
            Ativo Verificado
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Main Card */}
        <section className="bg-white shadow-sm border border-[#E5E7EB]">
          <div className="p-6 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-[#0A192F] tracking-tight">{equipment.codigo}</h2>
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                equipment.status === 'OPERACIONAL' ? 'bg-emerald-100 text-emerald-700' :
                equipment.status === 'MANUTENCAO' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              )}>
                {equipment.status}
              </span>
            </div>
            <p className="text-sm font-bold text-[#4B5563] uppercase tracking-wide">{equipment.tipo}</p>
            <p className="text-xs text-[#6B7280] mt-1">{equipment.local} • {equipment.andar}</p>
          </div>

          <div className="p-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Instalação</p>
              <p className="text-sm font-medium text-[#0A192F] mt-1">{formatDate(equipment.dataInstalacao)}</p>
            </div>
            {equipment.attributes.map((attr: any) => (
              <div key={attr.id}>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">{attr.key}</p>
                <p className="text-sm font-medium text-[#0A192F] mt-1">{attr.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Maintenance History */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-widest flex items-center gap-2 px-2">
            <History size={14} /> Histórico de Manutenções
          </h3>
          
          {equipment.maintenances.length === 0 ? (
            <div className="bg-white p-8 text-center border border-[#E5E7EB] text-[#9CA3AF] italic text-sm">
              Nenhum registro encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {equipment.maintenances.map((m: any) => (
                <div key={m.id} className="bg-white border border-[#E5E7EB] shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
                    <span className="text-sm font-bold text-[#0A192F]">{formatDate(m.data)}</span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#6B7280] uppercase">
                      <User size={12} /> {m.responsavel}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-[#4B5563] leading-relaxed">{m.descricao}</p>
                    {m.arquivoUrl && (
                      <a 
                        href={m.arquivoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-[#0A192F] text-[#0A192F] text-xs font-bold uppercase tracking-widest hover:bg-[#0A192F] hover:text-white transition-all"
                      >
                        <FileText size={16} /> Ver Relatório PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="py-8 text-center">
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.2em]">
            Sistema de Gestão GH DUTOS
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PublicEquipment;
