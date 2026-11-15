# AstroHealth Monitor — NASA Space Apps MVP

Software autónomo de monitorización integral de la salud para astronautas en misiones espaciales, diseñado bajo el marco científico de los **5 Peligros de los Vuelos Espaciales Tripulados (NASA Human Research Program)** y dosimetría operacional inspirada en la **Agencia Espacial Canadiense (CSA)**.

## Características Clave del MVP
- **100% En Español y Local-First:** Estado reactivo con `MissionContext` y persistencia en `localStorage`, sin barreras de inicio de sesión ni bases de datos externas.
- **Paso 1 — Selector de Misión (4 Entornos):** Nave en Tránsito Profundo, Hábitat Planetario/Lunar, Estación Espacial en Órbita y Rover Explorador Presurizado.
- **Paso 2 — Registro e Historia Clínica (EHR):** Perfiles precargados o editables (tipo de sangre, inmunología/defensas bajas, cirugías previas y signos vitales base) que personalizan alertas y ejercicios.
- **Paso 3 — Centro de Comando y Figura Humana Interactiva SVG:** Mapa anatómico interactivo codificado por triaje (Verde/Amarillo/Rojo), checklist dinámico de rutinas y gamificación por racha.
- **Paso 4 — Pestañas Especializadas:**
  - *Conectar Herramientas (Sensor Hub):* Interruptores Plug & Play y simulador de lecturas/anomalías en tiempo real.
  - *Salud Mental y Psicología:* Check-in emocional, Video-Diario con cámara web (y simulador), Muro de Inspiración con paisajes sonoros generados por Web Audio API y gráfica histórica.
  - *Densidad Ósea y Muscular:* Rutinas adaptadas por gravedad y cirugías previas, métricas de retención ósea (`BMD %`) y muscular.
  - *Monitoreo de Misión:* Curva de radiación acumulada (`mSv`), glucosa capilar (`mg/dL`) e inmunidad cruzada con historia clínica.

## Ejecución Rápida
```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador. Consulta `CREDITS_AND_AI_AUDIT.md` para ver el registro de auditoría de IA, licencias abiertas y citas científicas.
