import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '../services/api';
import { LogIn, ShieldCheck, Lock, Mail } from 'lucide-react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Left Side: Brand/Visual (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-[#0A192F] relative items-center justify-center p-12 overflow-hidden">
        {/* Abstract Industrial Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px' 
          }} />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-[#FF6B00]/5 to-transparent" />
        </div>

        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="mb-8 inline-block p-6 bg-white/5 backdrop-blur-sm border border-white/10">
            <Logo size="lg" variant="light" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-4">
            Gestão de <span className="text-[#FF6B00]">Ativos</span>
          </h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
            Sistema Inteligente de Rastreabilidade e Manutenção Industrial
          </p>
          
          <div className="mt-16 grid grid-cols-2 gap-8 text-left">
            <div className="space-y-2">
              <div className="w-8 h-1 bg-[#FF6B00]" />
              <p className="text-white font-bold text-xs uppercase tracking-widest">QR Code Tracking</p>
              <p className="text-white/30 text-[10px] leading-relaxed">Rastreabilidade total via etiquetas inteligentes.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-1 bg-[#FF6B00]" />
              <p className="text-white font-bold text-xs uppercase tracking-widest">Smart Maintenance</p>
              <p className="text-white/30 text-[10px] leading-relaxed">Alertas preditivos e histórico de intervenções.</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-12 left-12 flex items-center gap-4">
          <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
            <ShieldCheck className="text-[#FF6B00]" size={20} />
          </div>
          <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold">Secure Access Node v2.6</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-[#F8F9FA]">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-700 delay-200 fill-mode-both">
          {/* Mobile Logo Only */}
          <div className="md:hidden flex flex-col items-center mb-12">
            <Logo size="lg" />
            <div className="mt-4 h-1 w-12 bg-[#FF6B00]" />
            <p className="mt-4 text-[#6B7280] text-[10px] uppercase tracking-[0.3em] font-bold">Sistemas de Manutenção</p>
          </div>

          <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-t-4 border-[#0A192F] relative">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-[#0A192F] tracking-tighter uppercase">Acesso ao Sistema</h2>
              <p className="text-[#6B7280] text-[10px] uppercase tracking-widest font-bold mt-2">Identifique-se para continuar</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[11px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-[#6B7280] uppercase tracking-widest">
                  <Mail size={12} className="text-[#FF6B00]" />
                  E-mail Corporativo
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b-2 border-[#E5E7EB] text-sm font-medium focus:outline-none focus:border-[#0A192F] transition-all placeholder:text-slate-300"
                    placeholder="exemplo@ghdutos.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-[#FF6B00] w-0 group-focus-within:w-full transition-all duration-300" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-[#6B7280] uppercase tracking-widest">
                  <Lock size={12} className="text-[#FF6B00]" />
                  Senha de Acesso
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b-2 border-[#E5E7EB] text-sm font-medium focus:outline-none focus:border-[#0A192F] transition-all placeholder:text-slate-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-[#FF6B00] w-0 group-focus-within:w-full transition-all duration-300" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A192F] text-white py-5 font-black text-xs uppercase tracking-[0.3em] hover:bg-[#112240] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Autenticar Agora
                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-[#F1F5F9] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] text-[#9CA3AF] uppercase tracking-widest font-bold">Suporte Técnico</span>
                <span className="text-[10px] text-[#0A192F] font-black">suporte@ghdutos.com.br</span>
              </div>
              <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-300">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center md:text-left">
            <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.3em] font-bold">
              &copy; 2026 GH DUTOS &bull; Tecnologia em Manutenção
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
