import React, { useState } from 'react';
import { Dumbbell, Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldCheck, Briefcase } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { PulseLoader } from '../common/PulseLoader';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (userData: { id: number; email: string; nombre: string; rol: string; tiempoDescansoDefectoSegundos: number; isGuest?: boolean }) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [email, setEmail] = useState('quirogamanuel21@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [loadingColor, setLoadingColor] = useState<'emerald' | 'cyan'>('emerald');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Acceso para Milo (Atleta Principal)
  const handleMiloLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Ingresa tu correo y contraseña.');
      return;
    }

    // Validación de acceso seguro para Milo
    if (cleanEmail === 'quirogamanuel21@gmail.com' && password === 'Milojr0307#') {
      setLoading(true);
      setLoadingColor('emerald');
      setLoadingLabel('Iniciando sesión segura & cargando catálogo local...');

      const userData = {
        id: 2,
        email: 'quirogamanuel21@gmail.com',
        nombre: 'Milo',
        rol: 'Admin',
        tiempoDescansoDefectoSegundos: 180,
        isGuest: false,
      };

      setTimeout(() => {
        storageService.saveAuthSession(userData);
        setLoading(false);
        onSuccess(userData);
      }, 700);
    } else {
      setErrorMessage('Credenciales incorrectas para el perfil de Milo.');
    }
  };

  // Acceso instantáneo para Reclutador / Invitado de Portafolio
  const handleGuestLogin = () => {
    setLoading(true);
    setLoadingColor('cyan');
    setLoadingLabel('Preparando entorno Demo para Reclutador...');

    const guestData = {
      id: 999,
      email: 'recruiter.demo@metrikgym.com',
      nombre: 'Reclutador Invitado',
      rol: 'Guest',
      tiempoDescansoDefectoSegundos: 90,
      isGuest: true,
    };

    setTimeout(() => {
      storageService.saveAuthSession(guestData);
      setLoading(false);
      onSuccess(guestData);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101724] border border-[#1F2C3F] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-950">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Metrik<span className="text-emerald-400">Gym</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Plataforma de Sobrecarga Progresiva & Registro de Fuerza
          </p>
        </div>

        {loading ? (
          <div className="py-8">
            <PulseLoader color={loadingColor} label={loadingLabel} />
          </div>
        ) : (
          <>
            {/* Botón Destacado: Modo Reclutador / Demo */}
            <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-300 mb-1">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>¿Estás evaluando mi perfil o portafolio?</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-3">
                Explora la interfaz interactiva, calculadora de placas y rutinas sin ingresar credenciales.
              </p>
              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Ingresar como Reclutador / Modo Demo</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-[#1F2C3F]"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-gray-500 tracking-wider">o acceso de Atleta</span>
              <div className="flex-grow border-t border-[#1F2C3F]"></div>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form para Milo */}
            <form onSubmit={handleMiloLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Correo Electrónico:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="quirogamanuel21@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Contraseña:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Iniciar Sesión (Milo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[11px] text-gray-500 text-center mt-4">
              La sesión se mantiene activa de forma segura durante 4 horas.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
