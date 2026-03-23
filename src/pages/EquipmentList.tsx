import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { Plus, Search, Eye, Edit2, ChevronRight, ChevronLeft, Trash2, X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface Equipment {
  id: number;
  codigo: string;
  tipo: string;
  local: string;
  andar: string;
  status: string;
  createdAt: string;
}

interface EquipmentListProps {
  onSelect: (id: number) => void;
  onNew: () => void;
  onEdit: (id: number) => void;
  initialStatus?: string;
  onFilterChange?: (status: string) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ onSelect, onNew, onEdit, initialStatus = 'ALL', onFilterChange }) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [andarFilter, setAndarFilter] = useState<string>('ALL');
  const [localFilter, setLocalFilter] = useState<string>('ALL');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);

  const loadEquipments = () => {
    setLoading(true);
    fetchApi('/api/equipments')
      .then(setEquipments)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEquipments();
  }, []);

  useEffect(() => {
    if (initialStatus === 'IMPORT') {
      setShowImportModal(true);
      setStatusFilter('ALL');
      onFilterChange?.('ALL');
    } else {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus, onFilterChange]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    onFilterChange?.(status);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setImportData(results.data);
        },
        error: (err) => {
          toast.error('Erro ao ler arquivo CSV: ' + err.message);
        }
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setImportData(data);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error('Formato de arquivo não suportado. Use CSV ou Excel.');
    }
  };

  const processImport = async () => {
    if (importData.length === 0) return;
    setImporting(true);
    try {
      // Map common spreadsheet headers to our API fields
      const mappedData = importData.map(row => ({
        codigo: row.codigo || row.Codigo || row.CÓDIGO || row.ID || '',
        tipo: row.tipo || row.Tipo || row.TIPO || row.Equipamento || '',
        local: row.local || row.Local || row.LOCAL || row.Setor || '',
        andar: row.andar || row.Andar || row.ANDAR || row.Pavimento || '',
        status: row.status || row.Status || row.STATUS || 'OPERACIONAL',
        periodicidadeManutencao: row.periodicidade || row.Periodicidade || row.Dias || 90,
        dataInstalacao: row.dataInstalacao || row.Data || null
      })).filter(item => item.codigo);

      const response = await fetchApi('/api/equipments/bulk', {
        method: 'POST',
        body: JSON.stringify({ equipments: mappedData })
      });

      toast.success(`${response.count} equipamentos importados com sucesso!`);
      setShowImportModal(false);
      setImportData([]);
      loadEquipments();
    } catch (err) {
      toast.error('Erro ao importar dados');
    } finally {
      setImporting(false);
    }
  };

  const andares = ['ALL', ...new Set(equipments.map(e => e.andar))].sort();
  const locais = ['ALL', ...new Set(equipments.map(e => e.local))].sort();

  const handleDelete = async (id: number) => {
    try {
      await fetchApi(`/api/equipments/${id}`, { method: 'DELETE' });
      toast.success('Equipamento excluído com sucesso!');
      setEquipments(prev => prev.filter(e => e.id !== id));
      setShowDeleteConfirm(null);
    } catch {
      toast.error('Erro ao excluir equipamento');
    }
  };

  const filtered = equipments.filter(e => {
    const matchesSearch = 
      e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.local.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesAndar = andarFilter === 'ALL' || e.andar === andarFilter;
    const matchesLocal = localFilter === 'ALL' || e.local === localFilter;
    
    return matchesSearch && matchesStatus && matchesAndar && matchesLocal;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERACIONAL': return 'bg-emerald-100 text-emerald-700';
      case 'MANUTENCAO': return 'bg-amber-100 text-amber-700';
      case 'CRITICO': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0A192F] tracking-tighter uppercase">Inventário de Ativos</h2>
          <p className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mt-1">Gestão de equipamentos e infraestrutura</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="w-full sm:w-auto px-6 py-4 border-2 border-[#0A192F] text-[#0A192F] flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all rounded-none"
          >
            <FileSpreadsheet size={18} />
            Importar Planilha
          </button>
          <button 
            onClick={onNew}
            className="w-full sm:w-auto bg-[#0A192F] text-white px-8 py-4 flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#112240] transition-all shadow-xl rounded-none border-b-4 border-[#FF6B00]"
          >
            <Plus size={18} />
            Novo Equipamento
          </button>
        </div>
      </header>

      <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-none">
        {/* Filters bar */}
        <div className="p-6 border-b border-[#E5E7EB] flex flex-col lg:flex-row gap-4 bg-[#F9FAFB]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <input 
              type="text" 
              placeholder="BUSCAR POR CÓDIGO, TIPO OU LOCAL..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-0 focus:border-[#0A192F] rounded-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              className="px-4 py-3 bg-white border border-[#E5E7EB] text-xs font-bold text-[#4B5563] uppercase tracking-widest rounded-none focus:outline-none focus:border-[#0A192F]"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="ALL">TODOS OS STATUS</option>
              <option value="OPERACIONAL">OPERACIONAL</option>
              <option value="MANUTENCAO">MANUTENÇÃO</option>
              <option value="CRITICO">CRÍTICO</option>
            </select>
            <select 
              className="px-4 py-3 bg-white border border-[#E5E7EB] text-xs font-bold text-[#4B5563] uppercase tracking-widest rounded-none focus:outline-none focus:border-[#0A192F]"
              value={andarFilter}
              onChange={(e) => setAndarFilter(e.target.value)}
            >
              <option value="ALL">TODOS OS ANDARES</option>
              {andares.filter(a => a !== 'ALL').map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select 
              className="px-4 py-3 bg-white border border-[#E5E7EB] text-xs font-bold text-[#4B5563] uppercase tracking-widest rounded-none focus:outline-none focus:border-[#0A192F]"
              value={localFilter}
              onChange={(e) => setLocalFilter(e.target.value)}
            >
              <option value="ALL">TODOS OS LOCAIS</option>
              {locais.filter(l => l !== 'ALL').map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9FAFB] text-[10px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-100 w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6B7280] text-sm italic">Nenhum equipamento encontrado.</td>
                </tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="hover:bg-[#F8F9FA] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[#0A192F]">{e.codigo}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#4B5563]">{e.tipo}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#4B5563]">{e.local}</div>
                    <div className="text-[10px] text-[#9CA3AF] uppercase font-bold">{e.andar}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-wider", getStatusColor(e.status))}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{formatDate(e.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onSelect(e.id)}
                        className="p-2 text-[#4B5563] hover:text-[#0A192F] hover:bg-slate-100 transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(e.id)}
                        className="p-2 text-[#4B5563] hover:text-[#0A192F] hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(e.id)}
                        className="p-2 text-[#4B5563] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">Mostrando <b>{filtered.length}</b> de <b>{equipments.length}</b> ativos</p>
          <div className="flex items-center gap-1">
            <button className="p-2 border border-[#E5E7EB] text-[#9CA3AF] disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
            <button className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-[#0A192F] text-white">1</button>
            <button className="p-2 border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A192F]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl shadow-2xl p-8 rounded-none border-t-4 border-[#0A192F]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#0A192F] uppercase tracking-tight">Importar Equipamentos</h3>
              <button onClick={() => setShowImportModal(false)} className="text-[#9CA3AF] hover:text-[#0A192F]">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 flex gap-4">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <p className="font-bold uppercase mb-1">Instruções de Importação:</p>
                  <p>O arquivo deve conter as colunas: <b>codigo, tipo, local, andar</b>.</p>
                  <p className="mt-1 italic">Formatos aceitos: .csv, .xlsx, .xls</p>
                </div>
              </div>

              {!importData.length ? (
                <div className="border-2 border-dashed border-[#E5E7EB] p-12 text-center">
                  <input 
                    type="file" 
                    id="bulk-upload" 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                  />
                  <label 
                    htmlFor="bulk-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-[#0A192F]">
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0A192F] uppercase tracking-widest">Clique para selecionar arquivo</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-1 uppercase">Arraste sua planilha aqui</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-height-[300px] overflow-y-auto border border-[#E5E7EB]">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-[#F9FAFB] sticky top-0">
                        <tr className="border-b border-[#E5E7EB] font-bold uppercase text-[#6B7280]">
                          <th className="p-2">Código</th>
                          <th className="p-2">Tipo</th>
                          <th className="p-2">Local</th>
                          <th className="p-2">Andar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {importData.slice(0, 10).map((row, i) => (
                          <tr key={i}>
                            <td className="p-2">{row.codigo || row.Codigo || row.CÓDIGO || row.ID}</td>
                            <td className="p-2">{row.tipo || row.Tipo || row.TIPO || row.Equipamento}</td>
                            <td className="p-2">{row.local || row.Local || row.LOCAL || row.Setor}</td>
                            <td className="p-2">{row.andar || row.Andar || row.ANDAR || row.Pavimento}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importData.length > 10 && (
                      <div className="p-2 text-center bg-[#F9FAFB] text-[10px] text-[#9CA3AF] font-bold italic">
                        + {importData.length - 10} outros registros...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setImportData([])}
                      className="flex-1 py-4 border border-[#E5E7EB] text-[#4B5563] font-bold text-xs uppercase tracking-widest hover:bg-slate-50"
                    >
                      Trocar Arquivo
                    </button>
                    <button 
                      onClick={processImport}
                      disabled={importing}
                      className="flex-1 py-4 bg-[#0A192F] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#112240] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {importing ? 'Processando...' : `Importar ${importData.length} Ativos`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A192F]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md shadow-2xl p-8 rounded-none border-t-4 border-red-600">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#0A192F] uppercase tracking-tight">Confirmar Exclusão</h3>
              <button onClick={() => setShowDeleteConfirm(null)} className="text-[#9CA3AF] hover:text-[#0A192F]">
                <X size={24} />
              </button>
            </div>
            <p className="text-[#4B5563] text-sm leading-relaxed mb-8">
              Tem certeza que deseja excluir este ativo? Esta ação é irreversível e removerá todo o histórico de manutenções associado.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-4 border border-[#E5E7EB] text-[#4B5563] font-bold text-xs uppercase tracking-widest hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-4 bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700"
              >
                Excluir Ativo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
