# 🗺️ MetrikGym — Master Roadmap & Technical Backlog

Documento de seguimiento arquitectónico, características completadas y backlog de funcionalidades futuras para **MetrikGym** (PWA Mobile-First + .NET 10 + PostgreSQL).

---

## 📊 Estado General del Proyecto

```
[█████████████████████░] 92% — Fase Core & Herramientas Tácticas Completadas
```

---

## ✅ 1. Módulos y Funcionalidades Completadas

### 🛡️ Backend & Seguridad (.NET 10 Web API + PostgreSQL 17)
- [x] **Arquitectura Limpia:** Estructura modular dividida en `Domain`, `Application`, `Infrastructure` y `Api`.
- [x] **Base de Datos Relacional:** PostgreSQL 17 en Podman con Entity Framework Core y migraciones automáticas.
- [x] **Autenticación Robusta:** JWT Bearer tokens con claims de usuario y rol (`Admin` / `User`).
- [x] **Seguridad Criptográfica:** Hashing de contraseñas con `BCrypt.Net-Next` (factor de costo 11).
- [x] **Primer Usuario como SuperAdmin:** Regla en base de datos para auto-asignar rol `Admin` a la primera cuenta registrada.
- [x] **Catálogo Oficial Sembrado:** 80 ejercicios pre-cargados categorizados en 11 grupos musculares con indicadores unilaterales.
- [x] **Aislamiento Multi-inquilino (BOLA/IDOR Defense):** Validación en todas las consultas por `UsuarioId`.
- [x] **Curaduría SuperAdmin:** Endpoint `POST /api/ejercicios/{id}/promover-global` para promover ejercicios de la comunidad al catálogo oficial.

### 📱 Frontend & UX (React 19 + Vite + Tailwind CSS v4 + Lucide Icons)
- [x] **Diseño 100% Responsivo:** Mobile thumb-zone, Bottom Navigation Bar de 4 pestañas, Sidebar para tablets y monitores 32"+.
- [x] **Cero Emojis en Código:** Uso exclusivo de iconografía vectorial profesional con `lucide-react`.
- [x] **Asistente de Rutinas en 2 Pasos (Wizard):**
  - *Paso 1:* Nombre, día sugerido, filtro muscular y selección a pantalla completa con 1-tap.
  - *Paso 2:* Ajuste táctico de orden ($\uparrow / \downarrow$), selector de series stepped `[-] 3 [+]` y chips de descanso (`45s`, `60s`, `90s`, `120s`, `180s`, `240s`).
- [x] **Biblioteca de Ejercicios con Anti-Duplicados:**
  - Algoritmo de similitud difusa (fuzzy matching) en tiempo real ($>40\%$) para evitar sobrecargar la base de datos con variantes repetidas.
  - Selector de variantes anatómicas sugeridas (*Agarre Neutro*, *Con Pausa 2s*, *Inclinado 30°*...).
- [x] **Sintetizador de Audio Web Audio API:** 5 tonos acústicos generados localmente sin MP3 externos (*Beep*, *Gong*, *Boxeo*, *Campana*, *Silencio*) con soporte para vibración háptica.
- [x] **Perfil & Preferencias:** Selector de avatares deportivos vectoriales con auto-guardado en tiempo real, unidad de medida (Kg / Lbs), selector de tonos y tiempos de descanso globales.
- [x] **Registro Serie por Serie & UX de Alta Velocidad:** Marcas previas ("Fantasma"), micro-incrementos (`-2.5`, `+1.25`, `+2.5`, `+5.0`), selector de RPE contextual.
- [x] **Auto-Foco Inteligente entre Series:** Al completar un set con Check ($\checkmark$), el foco activo pasa automáticamente a la siguiente serie.
- [x] **Registro Pareado Unilateral ($D / I$):** Checks independientes con colores distintivos (Cyan $D$ / Púrpura $I$), desmarcables en todo momento, con descanso disparado al completar ambos lados.
- [x] **Estado Visual de "Ejercicio Completado":** Badge de ejercicio finalizado con colapso opcional y auto-scroll suave hacia el siguiente ejercicio de la sesión.
- [x] **Rutina Sugerida del Día Dinámica:** Detección en tiempo real del día de la semana y tarjeta de recuperación activa en días de descanso.
- [x] **Historial Detallado:** Vista expandible con tablas completas por ejercicio, cálculo de volumen total y trofeos automáticos para mejores series.

### 🧮 Herramientas Tácticas en Entrenamiento en Vivo (Fase 1)
- [x] **Calculadora Gráfica de Discos (Plate Calculator):**
  - Modal táctil interactivo con manga de barra olímpica y discos reglamentarios coloreados (25, 20, 15, 10, 5, 2.5, 1.25 kg). Desglose exacto por lado y botón para aplicar el peso al set en 1 tap.
- [x] **Sustitución en Caliente ("Máquina Ocupada"):**
  - Modal inferior rápido que busca variantes del mismo grupo muscular y permite cambiar el ejercicio en vivo sin alterar la plantilla guardada de la rutina.
- [x] **Estimador de $1\text{RM}$ (Repetición Máxima) en Vivo:**
  - Cálculo instantáneo mediante la fórmula de Epley ($1\text{RM} = \text{Peso} \times [1 + \frac{\text{Reps}}{30}]$) en la barra de micro-ajustes del set activo.
- [x] **Traductor Contextual de RPE $\rightarrow$ RIR (Repeticiones en Reserva):**
  - Micro-banner informativo interactivo que traduce cada nivel de RPE a lenguaje humano ("RPE 8.0 = 2 reps en reserva").

---

## 🔮 2. Backlog de Mejoras Futuras (Roadmap de Producto)

### 📈 A. Analíticas & Sobrecarga Progresiva

### 💾 B. Resiliencia y Modo Offline PWA
1. **Persistencia Local con IndexedDB (Dexie.js):**
   - Almacenamiento local completo de rutinas, catálogo y entrenamientos en curso para operar en sótanos de gimnasios sin señal ni WiFi.
2. **Cola de Sincronización en Background (Background Sync):**
   - Envío automático de sesiones acumuladas al reconectar a internet.
3. **PWA Instalable (Manifest + Service Worker):**
   - Soporte nativo para agregar a la pantalla de inicio en iOS (Safari) y Android (Chrome).

### 📈 C. Analíticas & Sobrecarga Progresiva
1. **Gráficas de Volumen Semanal por Músculo:**
   - Gráfica de barras que muestra la distribución de series efectivas por semana (Pecho, Espalda, Cuádriceps...).
2. **Curva de Progresión de Fuerza:**
   - Gráfica temporal del $1\text{RM}$ estimado en ejercicios compuestos clave (Press de Banca, Sentadilla, Peso Muerto, Remo, Militar).
3. **Detección de Nuevos PRs:**
   - Animación de felicitación al superar el récord histórico de peso o volumen en un ejercicio.

### ☁️ D. Despliegue a Producción & Nube
1. **Migración a Supabase PostgreSQL:**
   - Configuración de cadena de conexión y migración de datos desde Podman.
2. **Confirmación de Correo Electrónico:**
   - Integración con Resend / SendGrid para validación de nuevos usuarios públicos mediante tokens temporales.
