import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { ArrowLeft, QrCode, History, Info, Plus, Download, FileText, User, Calendar, AlertCircle, Clock } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { cn, formatDate } from '../lib/utils';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface EquipmentDetailProps {
  id: number;
  onBack: () => void;
  onEdit: (id: number) => void;
}

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({ id, onBack, onEdit }) => {
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    responsavel: '',
    observacao: ''
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    setLoading(true);
    fetchApi(`/api/equipments/${id}`)
      .then(setEquipment)
      .finally(() => setLoading(false));
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('equipmentId', id.toString());
    formData.append('data', maintenanceForm.data);
    formData.append('descricao', maintenanceForm.descricao);
    formData.append('responsavel', maintenanceForm.responsavel);
    formData.append('observacao', maintenanceForm.observacao);
    if (file) formData.append('arquivo', file);

    try {
      await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gh_dutos_token')}` },
        body: formData
      });
      setShowMaintenanceModal(false);
      toast.success('Manutenção registrada com sucesso!');
      loadData();
    } catch (err) {
      toast.error('Erro ao registrar manutenção');
    }
  };

  const generateLabel = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [100, 60]
    });

    // Border
    doc.setDrawColor(10, 25, 47);
    doc.setLineWidth(1);
    doc.rect(2, 2, 96, 56);

    // Header
    doc.setFillColor(10, 25, 47);
    doc.rect(2, 2, 96, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GH DUTOS', 50, 10, { align: 'center' });

    // Content
    doc.setTextColor(10, 25, 47);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`CÓDIGO:`, 10, 22);
    doc.setFont('helvetica', 'normal');
    doc.text(`${equipment.codigo}`, 30, 22);

    doc.setFont('helvetica', 'bold');
    doc.text(`TIPO:`, 10, 28);
    doc.setFont('helvetica', 'normal');
    doc.text(`${equipment.tipo}`, 30, 28);

    doc.setFont('helvetica', 'bold');
    doc.text(`LOCAL:`, 10, 34);
    doc.setFont('helvetica', 'normal');
    doc.text(`${equipment.local}`, 30, 34);

    doc.setFont('helvetica', 'bold');
    doc.text(`ANDAR:`, 10, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`${equipment.andar}`, 30, 40);

    // QR Code
    const qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (qrCanvas) {
      const qrDataUrl = qrCanvas.toDataURL('image/png');
      doc.addImage(qrDataUrl, 'PNG', 65, 18, 25, 25);
    }

    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('ESCANEIE PARA VER HISTÓRICO', 77.5, 46, { align: 'center' });
    
    doc.setDrawColor(229, 231, 235);
    doc.line(10, 50, 90, 50);
    
    doc.setFontSize(8);
    doc.text('ghdutos.com.br', 50, 54, { align: 'center' });

    doc.save(`etiqueta-${equipment.codigo}.pdf`);
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE MANUTENÇÃO', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 20, 25, { align: 'right' });

    // Equipment Info
    doc.setTextColor(10, 25, 47);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO ATIVO', 20, 55);
    
    doc.setDrawColor(10, 25, 47);
    doc.setLineWidth(0.5);
    doc.line(20, 58, 65, 58);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Código:', 20, 68);
    doc.setFont('helvetica', 'normal');
    doc.text(equipment.codigo, 45, 68);

    doc.setFont('helvetica', 'bold');
    doc.text('Tipo:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(equipment.tipo, 45, 75);

    doc.setFont('helvetica', 'bold');
    doc.text('Localização:', 20, 82);
    doc.setFont('helvetica', 'normal');
    doc.text(`${equipment.local} - ${equipment.andar}`, 45, 82);

    // Maintenance List
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTÓRICO DE INTERVENÇÕES', 20, 100);
    doc.line(20, 103, 90, 103);

    let y = 115;
    equipment.maintenances.forEach((m: any, index: number) => {
      if (y > 250) {
        doc.addPage();
        y = 30;
      }

      doc.setFillColor(249, 250, 251);
      doc.rect(20, y, pageWidth - 40, 35, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(20, y, pageWidth - 40, 35, 'S');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Data: ${formatDate(m.data)}`, 25, y + 10);
      doc.text(`Responsável: ${m.responsavel}`, pageWidth - 25, y + 10, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      const splitDesc = doc.splitTextToSize(m.descricao, pageWidth - 50);
      doc.text(splitDesc, 25, y + 20);

      y += 45;
    });

    doc.save(`relatorio-${equipment.codigo}.pdf`);
  };

  if (loading || !equipment) return <div className="animate-pulse space-y-8">
    <div className="h-10 bg-slate-200 w-1/4" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="col-span-2 h-96 bg-white border" />
      <div className="h-96 bg-white border" />
    </div>
  </div>;

  const publicUrl = `${window.location.origin}/e/${equipment.publicId}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-[#0A192F] tracking-tight">{equipment.codigo}</h2>
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                equipment.status === 'OPERACIONAL' ? 'bg-emerald-100 text-emerald-700' :
                equipment.status === 'MANUTENCAO' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              )}>
                {equipment.status}
              </span>
            </div>
            <p className="text-[#6B7280] text-sm">{equipment.tipo} • {equipment.local} ({equipment.andar})</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onEdit(equipment.id)}
            className="px-4 py-2 border border-[#E5E7EB] text-sm font-bold text-[#4B5563] hover:bg-slate-50 uppercase tracking-wider"
          >
            Editar Ativo
          </button>
          <button 
            onClick={() => setShowMaintenanceModal(true)}
            className="px-4 py-2 bg-[#0A192F] text-white text-sm font-bold hover:bg-[#112240] uppercase tracking-wider flex items-center gap-2"
          >
            <Plus size={16} />
            Registrar Manutenção
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white border border-[#E5E7EB] shadow-sm">
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center gap-2">
              <Info size={16} className="text-[#0A192F]" />
              <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-widest">Informações Técnicas</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Data de Instalação</p>
                <p className="text-sm font-medium text-[#0A192F] mt-1">{formatDate(equipment.dataInstalacao)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Periodicidade</p>
                <p className="text-sm font-medium text-[#0A192F] mt-1">{equipment.periodicidadeManutencao ? `${equipment.periodicidadeManutencao} dias` : 'Não definida'}</p>
              </div>
              {equipment.attributes.map((attr: any) => (
                <div key={attr.id}>
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">{attr.key}</p>
                  <p className="text-sm font-medium text-[#0A192F] mt-1">{attr.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-[#E5E7EB] shadow-sm">
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#0A192F]" />
                <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-widest">Linha do Tempo de Intervenções</h3>
              </div>
              <button 
                onClick={generateReport}
                className="text-[10px] font-bold text-[#0A192F] flex items-center gap-1 hover:underline tracking-widest"
              >
                <Download size={14} /> EXPORTAR HISTÓRICO (PDF)
              </button>
            </div>
            <div className="p-6">
              {equipment.maintenances.length === 0 ? (
                <div className="text-center py-8 text-[#9CA3AF] italic text-sm">Nenhuma manutenção registrada.</div>
              ) : (
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#E5E7EB] before:via-[#E5E7EB] before:to-transparent">
                  {equipment.maintenances.map((m: any) => (
                    <div key={m.id} className="relative flex items-start gap-6">
                      <div className="absolute left-0 w-10 h-10 bg-white border-2 border-[#0A192F] flex items-center justify-center z-10">
                        <Clock size={16} className="text-[#0A192F]" />
                      </div>
                      <div className="ml-12 flex-1 bg-[#F9FAFB] p-4 border border-[#E5E7EB]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <span className="text-sm font-bold text-[#0A192F]">{formatDate(m.data)}</span>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                            <User size={12} /> {m.responsavel}
                          </div>
                        </div>
                        <p className="text-sm text-[#4B5563] leading-relaxed">{m.descricao}</p>
                        {m.observacao && (
                          <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280] italic">
                            Obs: {m.observacao}
                          </div>
                        )}
                        {m.arquivoUrl && (
                          <a 
                            href={m.arquivoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#0A192F] hover:underline bg-white px-3 py-2 border border-[#E5E7EB]"
                          >
                            <FileText size={14} /> VER RELATÓRIO TÉCNICO (PDF)
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* QR & Label */}
        <div className="space-y-8">
          <section className="bg-white border border-[#E5E7EB] shadow-sm p-6 text-center">
            <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-widest mb-6">Identificador QR Code</h3>
            <div className="flex justify-center mb-6 p-4 bg-white border border-[#E5E7EB]">
              <QRCodeCanvas id="qr-canvas" value={publicUrl} size={180} level="H" includeMargin={true} />
            </div>
            <p className="text-[10px] text-[#6B7280] break-all mb-6 font-mono">{publicUrl}</p>
            <button 
              onClick={generateLabel}
              className="w-full py-3 border-2 border-[#0A192F] text-[#0A192F] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#0A192F] hover:text-white transition-all"
            >
              <Download size={18} />
              Gerar Etiqueta PDF
            </button>
          </section>

          <section className="bg-[#0A192F] p-6 text-white">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2">Próxima Manutenção</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Baseado na periodicidade de {equipment.periodicidadeManutencao || 'N/A'} dias, a próxima revisão deve ocorrer em breve.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A192F]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0A192F] uppercase tracking-tight">Registrar Intervenção</h3>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-[#9CA3AF] hover:text-[#0A192F]">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddMaintenance} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase">Data</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2 border border-[#E5E7EB] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A192F]"
                    value={maintenanceForm.data}
                    onChange={e => setMaintenanceForm({...maintenanceForm, data: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase">Responsável</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nome do técnico"
                    className="w-full px-3 py-2 border border-[#E5E7EB] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A192F]"
                    value={maintenanceForm.responsavel}
                    onChange={e => setMaintenanceForm({...maintenanceForm, responsavel: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase">Descrição do Serviço</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="O que foi realizado?"
                  className="w-full px-3 py-2 border border-[#E5E7EB] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A192F]"
                  value={maintenanceForm.descricao}
                  onChange={e => setMaintenanceForm({...maintenanceForm, descricao: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase">Observações Extras</label>
                <textarea 
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E5E7EB] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A192F]"
                  value={maintenanceForm.observacao}
                  onChange={e => setMaintenanceForm({...maintenanceForm, observacao: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase">Relatório Técnico (PDF)</label>
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-[#0A192F] file:text-white hover:file:bg-[#112240]"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="flex-1 py-3 border border-[#E5E7EB] text-[#4B5563] font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#0A192F] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#112240]"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetail;
