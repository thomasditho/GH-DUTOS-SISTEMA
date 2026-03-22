import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, Download, FileText, User, Package } from 'lucide-react';
import { fetchApi } from '../services/api';
import { formatDate } from '../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const MaintenanceHistory: React.FC = () => {
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApi('/api/maintenances')
      .then(setMaintenances)
      .finally(() => setLoading(false));
  }, []);

  const filtered = maintenances.filter(m => 
    m.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.equipment.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateGlobalReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO GLOBAL DE MANUTENÇÕES', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 20, 25, { align: 'right' });

    const tableData = filtered.map(m => [
      formatDate(m.data),
      m.equipment.codigo,
      m.equipment.tipo,
      m.descricao,
      m.responsavel
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Data', 'Ativo', 'Tipo', 'Descrição', 'Responsável']],
      body: tableData,
      headStyles: { fillColor: [10, 25, 47] },
      styles: { fontSize: 8 },
      columnStyles: { 3: { cellWidth: 60 } }
    });

    doc.save(`relatorio-global-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0A192F] tracking-tighter uppercase">Histórico de Manutenções</h2>
          <p className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mt-1">Registro global de todas as intervenções técnicas</p>
        </div>
        <button 
          onClick={generateGlobalReport}
          className="bg-[#0A192F] text-white px-8 py-4 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#112240] transition-all shadow-xl rounded-none border-b-4 border-[#FF6B00]"
        >
          <Download size={18} />
          Exportar Relatório Global
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9FAFB] text-[10px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Ativo</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4 text-right">Anexo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-slate-100 w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6B7280] text-sm italic">Nenhuma manutenção encontrada.</td>
                </tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="hover:bg-[#F8F9FA] transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-[#0A192F]">{formatDate(m.data)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-[#9CA3AF]" />
                      <span className="text-sm font-bold text-[#0A192F]">{m.equipment.codigo}</span>
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] uppercase font-bold">{m.equipment.tipo}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#4B5563] max-w-md">{m.descricao}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                      <User size={14} className="text-[#9CA3AF]" />
                      {m.responsavel}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {m.arquivoUrl ? (
                      <a 
                        href={m.arquivoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-[#0A192F] hover:bg-[#0A192F] hover:text-white transition-all inline-block border border-[#E5E7EB]"
                      >
                        <FileText size={18} />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-[#E5E7EB] uppercase">Sem Anexo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistory;
