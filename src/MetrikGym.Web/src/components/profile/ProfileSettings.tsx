import React, { useState, useEffect } from 'react';
import { Volume2, Bell, Vibrate, Dumbbell, Play, Save, Check, Sparkles, LogOut } from 'lucide-react';
import { TONOS_DISPONIBLES, playRestAlert, type TonoAlerta } from '../../utils/audio';
import { AVATARES_PREDISEÑADOS } from '../../utils/avatars';

export interface UserPreferences {
  avatarId: string;
  nombre: string;
  email: string;
  rol: string;
  tonoAlerta: TonoAlerta;
  sonidoHabilitado: boolean;
  vibracionHabilitada: boolean;
  descansoDefectoSegundos: number;
  descansoCompuestosSegundos: number;
  descansoAislamientoSegundos: number;
  unidadPeso: 'kg' | 'lbs';
  pesoBarraDefectoKg: number;
}

interface ProfileSettingsProps {
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => void;
  onLogout?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  preferences,
  onSavePreferences,
  onLogout,
}) => {
  const [formState, setFormState] = useState<UserPreferences>(preferences);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setFormState(preferences);
  }, [preferences]);

  const updateAndSave = (partial: Partial<UserPreferences>) => {
    const updated = { ...formState, ...partial };
    setFormState(updated);
    onSavePreferences(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const selectedAvatar = AVATARES_PREDISEÑADOS.find((a) => a.id === formState.avatarId) || AVATARES_PREDISEÑADOS[0];

  const handleTestTone = (tone: TonoAlerta) => {
    playRestAlert(tone, formState.sonidoHabilitado);
  };

  const handleSave = () => {
    onSavePreferences(formState);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-5 pb-28 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Mi Perfil & Ajustes
          </h2>
          <p className="text-xs text-gray-400">
            Personaliza tu experiencia de entrenamiento y descansos
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-950 transition-all cursor-pointer"
        >
          {savedFeedback ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedFeedback ? '¡Guardado!' : 'Guardar Cambios'}</span>
        </button>
      </div>

      {/* 1. Selector de Avatar Deportivo */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#131B26] border border-[#1F2C3F] shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Avatar del Atleta</span>
        </h3>

        {/* Current Avatar Highlight */}
        <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#0F1622] border border-[#1C293C]">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedAvatar.bgGradient} border-2 ${selectedAvatar.borderColor} flex items-center justify-center font-black text-sm tracking-wider ${selectedAvatar.textColor} shadow-lg shrink-0`}>
            {selectedAvatar.symbol}
          </div>
          <div>
            <h4 className="text-base font-bold text-white">{formState.nombre}</h4>
            <p className="text-xs text-gray-400">{formState.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              Rol: {formState.rol}
            </span>
          </div>
        </div>

        {/* Avatar Grid Options */}
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-2">
            Elige tu estilo visual:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {AVATARES_PREDISEÑADOS.map((av) => {
              const isSelected = formState.avatarId === av.id;
              return (
                <button
                  key={av.id}
                  onClick={() => updateAndSave({ avatarId: av.id })}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-[#182333] border-[#25364D] hover:border-[#354B68]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${av.bgGradient} border ${av.borderColor} flex items-center justify-center font-bold text-xs ${av.textColor} mb-1.5 shadow`}>
                    {av.symbol}
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium truncate w-full text-center">
                    {av.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nombre Input */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">Nombre o Apodo:</label>
          <input
            type="text"
            value={formState.nombre}
            onChange={(e) => setFormState({ ...formState, nombre: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* 2. Configuración del Temporizador y Audio de Descansos */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#131B26] border border-[#1F2C3F] shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span>Tonos y Alertas de Descanso</span>
        </h3>

        {/* Tone Selector with Live Test Button */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 block">
            Tono de alarma al finalizar descanso:
          </label>

          <div className="space-y-1.5">
            {TONOS_DISPONIBLES.map((t) => {
              const isSelected = formState.tonoAlerta === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => updateAndSave({ tonoAlerta: t.id })}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/60'
                      : 'bg-[#182333] border-[#25364D] hover:bg-[#1E2C3F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-gray-500'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.label}</p>
                      <p className="text-[10px] text-gray-400">{t.descripcion}</p>
                    </div>
                  </div>

                  {t.id !== 'mute' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestTone(t.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#223145] hover:bg-cyan-500/30 border border-[#2D425E] text-xs font-bold text-cyan-300 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Play className="w-3 h-3 fill-cyan-300" />
                      <span>Probar</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Toggles: Audio & Vibración */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#1F2C3F]">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#182333] border border-[#25364D]">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Efectos de Sonido</p>
                <p className="text-[10px] text-gray-400">Audio sintetizado Web Audio</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateAndSave({ sonidoHabilitado: !formState.sonidoHabilitado })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                formState.sonidoHabilitado ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                formState.sonidoHabilitado ? 'left-5.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#182333] border border-[#25364D]">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-white">Vibración Háptica</p>
                <p className="text-[10px] text-gray-400">Vibra al terminar descanso</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateAndSave({ vibracionHabilitada: !formState.vibracionHabilitada })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                formState.vibracionHabilitada ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            >
              <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                formState.vibracionHabilitada ? 'left-5.5' : 'left-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Notificaciones en Pantalla Bloqueada (Sistema / Segundo Plano) */}
        <div className="p-3.5 rounded-xl bg-[#0F1622] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Alertas en Pantalla Bloqueada</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40">
                  Como WhatsApp
                </span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Suena y enciende tu pantalla al terminar el descanso aunque tu celular esté bloqueado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                const { requestNotificationPermission, sendImmediateTestNotification } = await import('../../utils/notifications');
                const permission = await requestNotificationPermission();
                if (permission === 'granted') {
                  sendImmediateTestNotification();
                } else {
                  alert('Para recibir alertas en pantalla bloqueada, permite las notificaciones en la configuración de tu navegador.');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950 cursor-pointer active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Activar / Probar Alerta</span>
            </button>
          </div>
        </div>

        {/* Tiempos de descanso por defecto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <div className="p-3 rounded-xl bg-[#0F1622] border border-[#1F2C3F]">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">General</span>
            <div className="flex items-center justify-between">
              <button
                onClick={() => updateAndSave({ descansoDefectoSegundos: Math.max(15, formState.descansoDefectoSegundos - 15) })}
                className="w-7 h-7 rounded-lg bg-[#1D293A] text-gray-300 font-bold"
              >
                -
              </button>
              <span className="font-black font-tabular text-sm text-white">{formState.descansoDefectoSegundos}s</span>
              <button
                onClick={() => updateAndSave({ descansoDefectoSegundos: formState.descansoDefectoSegundos + 15 })}
                className="w-7 h-7 rounded-lg bg-[#1D293A] text-emerald-400 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1622] border border-[#1F2C3F]">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Compuestos</span>
            <div className="flex items-center justify-between">
              <button
                onClick={() => updateAndSave({ descansoCompuestosSegundos: Math.max(30, formState.descansoCompuestosSegundos - 30) })}
                className="w-7 h-7 rounded-lg bg-[#1D293A] text-gray-300 font-bold"
              >
                -
              </button>
              <span className="font-black font-tabular text-sm text-amber-300">{formState.descansoCompuestosSegundos}s</span>
              <button
                onClick={() => updateAndSave({ descansoCompuestosSegundos: formState.descansoCompuestosSegundos + 30 })}
                className="w-7 h-7 rounded-lg bg-[#1D293A] text-amber-400 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1622] border border-[#1F2C3F]">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Aislamiento</span>
            <div className="flex items-center justify-between">
              <button
                onClick={() => updateAndSave({ descansoAislamientoSegundos: Math.max(15, formState.descansoAislamientoSegundos - 15) })}
                className="w-7 h-7 rounded-lg bg-[#1D293A] text-gray-300 font-bold"
              >
                -
              </button>
              <span className="font-black font-tabular text-sm text-cyan-300">{formState.descansoAislamientoSegundos}s</span>
              <button
                onClick={() => updateAndSave({ descansoAislamientoSegundos: formState.descansoAislamientoSegundos + 15 })}
                className="w-7 h-7 rounded-lg bg-[#1D293A] text-cyan-400 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Preferencias de Peso y Gimnasio */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#131B26] border border-[#1F2C3F] shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-amber-400" />
          <span>Equipamiento y Medidas</span>
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#182333] border border-[#25364D]">
          <div>
            <p className="text-xs font-bold text-white">Unidad de Carga</p>
            <p className="text-[10px] text-gray-400">Kilogramos o Libras</p>
          </div>
          <div className="flex items-center gap-1 bg-[#101724] p-1 rounded-lg border border-[#25364D]">
            <button
              onClick={() => updateAndSave({ unidadPeso: 'kg' })}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                formState.unidadPeso === 'kg' ? 'bg-emerald-500 text-black' : 'text-gray-400'
              }`}
            >
              KG
            </button>
            <button
              onClick={() => updateAndSave({ unidadPeso: 'lbs' })}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                formState.unidadPeso === 'lbs' ? 'bg-emerald-500 text-black' : 'text-gray-400'
              }`}
            >
              LBS
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#182333] border border-[#25364D]">
          <div>
            <p className="text-xs font-bold text-white">Peso Barra Olímpica Base</p>
            <p className="text-[10px] text-gray-400">Descuento automático en ejercicios de barra libre</p>
          </div>
          <span className="font-bold font-tabular text-sm text-white px-3 py-1 bg-[#101724] rounded-lg border border-[#25364D]">
            {formState.pesoBarraDefectoKg} kg
          </span>
        </div>
      </div>

      {/* 4. Cuenta y Sesión */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

    </div>
  );
};
