import React, { useState } from 'react';
import { Shield, FileText, Lock, HeartPulse, X, CheckCircle, Database } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy' | 'health';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="bg-[#101724] border border-[#1F2C3F] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1F2C3F] flex items-center justify-between bg-[#0E141F]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight">
                Centro Legal & Privacidad
              </h2>
              <p className="text-[11px] text-gray-400">
                MetrikGym • Arquitectura Local-First & Protección del Atleta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar ventana legal"
            className="w-8 h-8 rounded-xl bg-[#182333] hover:bg-[#223145] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 bg-[#0A0E17] border-b border-[#1F2C3F] overflow-x-auto">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950'
                : 'text-gray-400 hover:text-white hover:bg-[#141C29]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Términos y Condiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950'
                : 'text-gray-400 hover:text-white hover:bg-[#141C29]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Política de Privacidad</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'health'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950'
                : 'text-gray-400 hover:text-white hover:bg-[#141C29]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Deslinde Médico & Legal</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed">
          
          {/* TAB 1: TÉRMINOS Y CONDICIONES */}
          {activeTab === 'terms' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong>Acuerdo de Uso:</strong> Al utilizar MetrikGym en formato web o PWA instalada, aceptas estos términos diseñados para garantizar un entrenamiento ordenado y seguro.
                </span>
              </div>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider">1. Objeto de la Plataforma</h3>
              <p>
                MetrikGym es una Progressive Web App (PWA) de alto rendimiento orientada al registro cronometrado de levantamiento de pesas, progresión de sobrecarga progresiva y gestión de descansos entre series.
              </p>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Modalidades de Uso</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li><strong>Modo Atleta Registrado:</strong> Diseñado para persistencia personal, sincronización segura con base de datos y control continuo de récords personales.</li>
                <li><strong>Modo Portafolio / Reclutador Invitado:</strong> Acceso demostrativo de solo lectura y prueba técnica en memoria. Los datos generados en sesión demo no se persisten en base de datos.</li>
              </ul>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider">3. Propiedad Intelectual</h3>
              <p>
                El código fuente, arquitectura, diseño visual, sintetizador Web Audio, logotipos y catálogo estructurado de ejercicios son propiedad de su creador, desarrollados bajo estándares de Clean Architecture y PWA Local-First.
              </p>
            </div>
          )}

          {/* TAB 2: POLÍTICA DE PRIVACIDAD */}
          {activeTab === 'privacy' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-start gap-2">
                <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong>Privacidad Local-First:</strong> Tus datos de entrenamiento residen principalmente en tu propio dispositivo mediante almacenamiento local encriptado y seguro.
                </span>
              </div>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider">1. Datos Recopilados</h3>
              <p>
                MetrikGym únicamente almacena los datos necesarios para cuantificar tus entrenamientos: series, repeticiones, cargas (kg/lb), RPE, tiempos de descanso y preferencias de interfaz. <strong>No recopilamos ubicación en tiempo real, contactos ni datos biométricos invasivos.</strong>
              </p>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Almacenamiento Local vs. Servidor</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li><strong>En tu navegador/celular:</strong> Se utiliza <code>localStorage</code> y caché de Service Worker para permitir el funcionamiento 100% offline en sótanos y zonas sin cobertura.</li>
                <li><strong>En la nube (Supabase):</strong> Cuando el usuario registrado cuenta con conexión a internet, los registros se transmiten protegidos bajo protocolos SSL/TLS y políticas de seguridad a nivel de fila (Row Level Security - RLS).</li>
              </ul>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider">3. Aviso sobre Cookies y Rastreos de Terceros</h3>
              <p>
                <strong>MetrikGym NO utiliza cookies de terceros, píxeles de publicidad ni herramientas de rastreo comercial.</strong> Solo se hace uso de almacenamiento técnico estrictamente indispensable para mantener la sesión activa durante tu jornada deportiva.
              </p>
            </div>
          )}

          {/* TAB 3: DESLINDE MÉDICO */}
          {activeTab === 'health' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <HeartPulse className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong>Aviso de Salud Importante:</strong> El levantamiento de pesas y entrenamiento de fuerza implican exigencia física.
                </span>
              </div>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider">1. No Constituye Asesoría Médica</h3>
              <p>
                MetrikGym es una herramienta de software cuantitativo para registrar marcas personales y tiempos de descanso. No es un sustituto de diagnóstico médico, prescripción deportiva profesional ni terapia de rehabilitación física.
              </p>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Responsabilidad del Atleta</h3>
              <p>
                Se recomienda consultar con un médico certificado antes de iniciar programas intensivos de fuerza. La ejecución de técnicas con barra libre, máquinas o mancuernas, así como la selección de cargas y descansos, es responsabilidad exclusiva del atleta.
              </p>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider">3. Seguridad en el Gimnasio</h3>
              <p>
                Respeta siempre las medidas de seguridad del recinto deportivo, utiliza seguros en las barras olímpicas y atiende a las señales de fatiga muscular extrema o dolor articular para prevenir lesiones.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1F2C3F] bg-[#0E141F] flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Versión 1.0 • Actualizado Octubre 2026
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md shadow-emerald-950 cursor-pointer active:scale-95"
          >
            Entendido y Acepto
          </button>
        </div>

      </div>
    </div>
  );
};
