import React, { useState } from 'react';
import { Dumbbell, Lock, Mail, User, Clock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (userData: { id: number; email: string; nombre: string; rol: string; tiempoDescansoDefectoSegundos: number }) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  
  // Form fields
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [descansoSegundos, setDescansoSegundos] = useState(90);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!nombre.trim() || !email.trim() || !password.trim()) {
          throw new Error('Por favor completa todos los campos requeridos.');
        }

        const data = await api.register(
          nombre.trim(),
          email.trim(),
          password.trim()
        );
        onSuccess(data);
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Ingresa tu correo y contraseña.');
        }

        const data = await api.login(
          email.trim(),
          password.trim()
        );
        onSuccess(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
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
            {mode === 'register' ? 'Crea tu cuenta de Atleta y comienza a registrar' : 'Inicia sesión para acceder a tu historial'}
          </p>
        </div>

        {/* Mode Selector Switch */}
        <div className="flex items-center gap-1 bg-[#0A0E17] p-1 rounded-xl border border-[#1F2C3F] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Crear Cuenta (Admin #1)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Tu Nombre o Apodo:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ej. Quiro"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Correo Electrónico:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="tu_email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Tiempo de descanso por defecto:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Clock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={15}
                    max={600}
                    step={15}
                    value={descansoSegundos}
                    onChange={(e) => setDescansoSegundos(parseInt(e.target.value) || 90)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm font-bold font-tabular outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-400">segundos</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Procesando...</span>
            ) : mode === 'register' ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Registrarme como Superusuario</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {onClose && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-300 underline"
            >
              Continuar en modo demostración local
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
