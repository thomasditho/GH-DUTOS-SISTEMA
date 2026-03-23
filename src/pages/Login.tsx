import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '../services/api';
import { LogIn } from 'lucide-react';
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans overflow-hidden">
      {/* Left Side: Brand Identity (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-brand-navy relative overflow-hidden items-center justify-center">
        {/* Geometric Shapes from Banner */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Teal Triangle Top Left */}
          <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-brand-teal transform -translate-x-1/4 -translate-y-1/4 rotate-12 opacity-80" />
          
          {/* Navy Overlays */}
          <div className="absolute bottom-0 left-0 w-[80%] h-[80%] bg-brand-navy transform -translate-x-1/4 translate-y-1/4 -rotate-12" />
          
          {/* Accent Shapes */}
          <div className="absolute top-1/2 right-0 w-[40%] h-[120%] bg-white/5 transform translate-x-1/4 -translate-y-1/2 rotate-45" />
        </div>

        <div className="relative z-10 text-center p-12 max-w-xl">
          <div className="mb-12 flex justify-center">
            <Logo size="lg" variant="light" className="scale-150" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Gestão Inteligente de <span className="text-brand-teal">Ativos Industriais</span>
          </h1>
          <p className="text-white/60 text-lg font-light tracking-wide leading-relaxed">
            Acesse o prontuário digital, histórico de manutenções e laudos técnicos em um só lugar.
          </p>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end text-white/30 text-[10px] uppercase tracking-[0.3em]">
          <span>&copy; 2026 GH DUTOS</span>
          <div className="flex gap-6">
            <span>Tecnologia em Manutenção</span>
            <span>v2.4.0</span>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#F8F9FA] relative">
        {/* Mobile Logo Background */}
        <div className="md:hidden absolute top-0 left-0 w-full h-32 bg-brand-navy overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-brand-teal opacity-20 transform -skew-y-6" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="md:hidden flex justify-center mb-12">
            <Logo size="lg" />
          </div>

          <div className="bg-white p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-t-4 border-brand-navy">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-brand-navy uppercase tracking-tight">Acesso ao Sistema</h2>
              <p className="text-[#6B7280] text-[10px] uppercase tracking-widest font-bold mt-1">Insira suas credenciais corporativas</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-navy uppercase tracking-widest">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] text-sm focus:outline-none focus:ring-0 focus:border-brand-navy transition-all rounded-none font-medium"
                  placeholder="exemplo@ghdutos.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Senha de Acesso</label>
                  <button type="button" className="text-[9px] font-bold text-brand-teal uppercase tracking-widest hover:underline">Esqueceu a senha?</button>
                </div>
                <input
                  type="password"
                  required
                  className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] text-sm focus:outline-none focus:ring-0 focus:border-brand-navy transition-all rounded-none font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-navy text-white py-5 font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-teal transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg active:transform active:scale-[0.98]"
              >
                {loading ? 'Autenticando...' : (
                  <>
                    Entrar no Sistema
                    <LogIn size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-4 text-[#9CA3AF]">
                <div className="h-[1px] flex-1 bg-[#E5E7EB]" />
                <span className="text-[9px] uppercase tracking-widest font-bold">Segurança</span>
                <div className="h-[1px] flex-1 bg-[#E5E7EB]" />
              </div>
              <p className="text-[9px] text-[#9CA3AF] uppercase tracking-widest leading-relaxed mt-4 text-center">
                Acesso restrito a funcionários autorizados.<br />
                Conexão criptografada de ponta a ponta.
              </p>
            </div>
          </div>
          
          <p className="md:hidden text-center text-[#9CA3AF] text-[9px] mt-8 uppercase tracking-[0.3em]">
            &copy; 2026 GH DUTOS - Manutenção Industrial
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
