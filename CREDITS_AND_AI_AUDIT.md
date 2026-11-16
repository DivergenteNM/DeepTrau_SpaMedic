# Auditoría de Inteligencia Artificial, Fuentes Científicas y Créditos de Terceros (`CREDITS_AND_AI_AUDIT.md`)

Este documento cumple estrictamente con los lineamientos de transparencia del hackatón **NASA Space Apps Challenge** y con las reglas de `skill.md`, `.agents/skills/free-open-source-minimal-deps`, `.agents/skills/design-system-governance` y `.agents/skills/ui-cursor-hover-motion`: toda la auditoría de IA, las citas científicas de agencias espaciales y el inventario de dependencias de código abierto para **DeepTrau** (*DeepTrau SpaMedic*) se mantienen documentados aquí, sin sobrecargar la interfaz operativa del astronauta.

---

## 1. Declaración de Uso y Auditoría de IA (AI Usage Audit Log)

### 1.1 Herramientas y Asistencia de IA en el Desarrollo
- **Entorno de desarrollo asistido:** Asistente agéntico de programación (Google Antigravity) utilizado para estructurar la arquitectura de **DeepTrau** en Next.js App Router, aplicar el sistema de diseño `deeptrau_design_system.md`, redactar la capa de datos clínicos simulados en español, implementar componentes interactivos en SVG nativo y validar la compilación TypeScript.
- **Generación de identidad visual (Logo e Ícono):** El logotipo oficial de la aplicación (`public/DeepTrau_logo.webp`) y el ícono/favicon del proyecto (`src/app/favicon.ico`, archivo original `DeepTrau_icono.ico`) fueron generados mediante **GPT (OpenAI)** bajo dirección creativa del equipo.
- **Supervisión humana:** El equipo del hackatón definió los requisitos del reto de la NASA, el nombre **DeepTrau**, el sistema de diseño base (`deeptrau_design_system.md`), la experiencia de usuario, los 4 escenarios operativos de misión y la lógica de cruce con historial clínico pre-misión.

### 1.2 Mapa de Uso de IA por Módulo y Comportamiento Simulado en el MVP
| Módulo de la Aplicación | Archivo Principal | Uso de IA durante el Desarrollo | Comportamiento de IA / Heurística dentro del MVP |
| :--- | :--- | :--- | :--- |
| **Motor de Estado y Triaje Clínico** | `src/context/MissionContext.tsx` | Diseño del estado reactivo global con `localStorage`, cálculo de puntajes de preparación y reglas de triaje Verde/Amarillo/Rojo. | **Heurística determinista local (sin API externa):** evalúa biomarcadores en tiempo real y cruza umbrales con inmunidad previa (`Defensas Bajas`) y cirugías registradas. |
| **Selector de Misión y Expediente (Onboarding)** | `src/components/onboarding/OnboardingFlow.tsx` | Generación de la interfaz en 2 pasos bajo el Design System de DeepTrau, tarjetas comparativas de entornos y vista previa del cruce clínico. | Muestra en vivo cómo el historial médico previo adapta el monitoreo inmunológico y muscular antes de iniciar la misión. |
| **Dashboard y Figura Humana Interactiva SVG** | `src/components/dashboard/InteractiveBodyMap.tsx` | Diseño vectorial SVG 100% propio de las 5 zonas anatómicas (Cerebro, Cardiovascular, Inmune, Metabólico y Musculoesquelético). | Colorea automáticamente cada sistema en Verde/Amarillo/Rojo y muestra explicaciones médicas en lenguaje claro (*"¿Por qué importa?"* y *"Qué hacer ahora"*). |
| **Hub de Sensores y Simulador** | `src/components/sensors/SensorHubTab.tsx` | Creación de interruptores Plug & Play y simulador de telemetría con carga de imagen de ultrasonido vía `FileReader`. | Cuando se desconecta un sensor, el motor adapta las rutinas del día a exámenes clínicos manuales sin hardware. |
| **Salud Mental, Video-Diario y Ancla Terrestre** | `src/components/psychology/MentalHealthTab.tsx` | Integración de cámara web (`getUserMedia`) con fallback simulado, pacer de respiración 4-4-4-4, gráfica SVG y audio bioacústico por `Web Audio API`. | **Evaluación psicológica simulada:** genera indicadores locales de tono emocional, fatiga vocal y estrés por confinamiento empaquetados para envío asíncrono a psicólogos en Tierra. |
| **Densidad Ósea y Muscular** | `src/components/musculoskeletal/BoneMuscleTab.tsx` | Adaptación de rutinas (ARED, T2, CEVIS) según gravedad y antecedentes quirúrgicos + gráfica SVG comparativa. | Sustituye automáticamente ejercicios de alto impacto por variantes articulares seguras cuando detecta cirugía previa de rodilla u hombro. |
| **Monitoreo de Radiación, Sangre y Glucosa** | `src/components/survival/MissionMonitorTab.tsx` | Gráficas SVG nativas de dosis acumulada ($\text{mSv}$), glucosa ($\text{mg/dL}$) y análisis inmunológico cruzado. | Dispara protocolos de refugio ante tormenta solar y alertas tempranas para perfiles con tendencia a leucopenia. |
| **Sistema de Emergencias Médicas (SOS), Triaje IA y Simulador de Crisis** | `src/components/emergency/SosCommandWorkspace.tsx`, `src/components/emergency/SosEmergencyOverlay.tsx`, `src/app/sos/page.tsx`, `src/components/emergency/EmergencyMiniBodyMap.tsx` y `src/data/emergencyProtocolsData.ts` | Generación del workspace editorial `/sos` y modal de alerta médica en vuelo, mini mapa SVG de revisión rápida, cronómetro de episodio, empaquetado crítico hacia Tierra y simulador de crisis en vivo con tonos por `Web Audio API`. | **Sistema experto determinista local (sin API externa):** cruza síntomas ingresados por teclado/clics con los signos vitales actuales y el expediente clínico (alergias, cirugías previas, tipo de sangre e inmunidad) para emitir urgencia Amarillo/Rojo y recomendar uno de los 6 protocolos médicos espaciales. |

---

## 2. Fuentes Científicas y Datos Abiertos Citados (NASA & CSA)

Todos los parámetros educativos, los 5 peligros espaciales, las tasas de pérdida ósea y los conceptos de dosimetría se basan en documentación científica de **Dominio Público / Acceso Abierto**:

1. **NASA Human Research Program (HRP) — *5 Hazards of Human Spaceflight***
   - Fuente: [https://www.nasa.gov/hrp/hazards/](https://www.nasa.gov/hrp/hazards/)
   - Aplicación en el MVP: Estructura las 4 misiones alrededor de los 5 peligros oficiales (*Radiación Espacial*, *Aislamiento y Confinamiento*, *Distancia de la Tierra*, *Campos Gravitatorios* y *Entornos Cerrados Hostiles*).
2. **NASA Human Research Program (HRP) — *Risks of Human Spaceflight & Countermeasures***
   - Fuente: [https://humanresearchroadmap.nasa.gov/](https://humanresearchroadmap.nasa.gov/)
   - Aplicación en el MVP:
     - Desmineralización ósea estimada sin ejercicio ($1\%$ a $1.5\%$ mensual en microgravedad $0\text{ g}$) y uso de equipos ARED, cinta T2 y cicloergómetro CEVIS.
     - Síndrome Neuro-Ocular Asociado al Vuelo Espacial (SANS) por desplazamiento cefálico de fluidos y monitoreo con ultrasonido portátil.
     - Desregulación inmunológica, reactivación viral latente, resistencia insulínica en microgravedad y fatiga psicológica del *"tercer cuarto de misión"*.
3. **Canadian Space Agency (CSA) — *Radiation Monitoring for Astronaut Health & Space Science Experiments on the ISS***
   - Fuente: [https://www.asc-csa.gc.ca/eng/sciences/radiation.asp](https://www.asc-csa.gc.ca/eng/sciences/radiation.asp)
   - Aplicación en el MVP: Modelado conceptual del Dosímetro Personal de Radiación CSA en milisieverts ($\text{mSv}$), tasas diarias según entorno (órbita vs. espacio profundo fuera de la magnetosfera), cálculo de margen de supervivencia y protocolo de refugio ante eventos de partículas solares.

### 2.1 Fuentes Científicas y Protocolos Médicos de Emergencia Espacial

Los protocolos clínicos, umbrales de triaje y maniobras de soporte vital incluidos en el módulo **SOS Emergencia y Triaje Asistido por IA** están fundamentados en publicaciones oficiales de medicina espacial y documentación técnica de agencias espaciales:

1. **Documento Base del Reto y Evaluación de Riesgos Fisiológicos:**
   - **Fuente:** *NASA Human Research Program (HRP) – 5 Hazards of Human Spaceflight* (Documentación oficial del reto NASA Space Apps Challenge).
   - **Aplicación en el MVP:** Define los cinco peligros principales que desencadenan emergencias en vuelo (radiación espacial, aislamiento y confinamiento, distancia de la Tierra, campos gravitatorios alterados y entornos cerrados hostiles), así como los biomarcadores críticos de autoevaluación: presión arterial, frecuencia cardíaca, nivel de glucosa en sangre ($\text{mg/dL}$), temperatura corporal e imágenes de ultrasonido.

2. **Reanimación Cardiopulmonar (RCP) en Microgravedad y Eventos Cardiovasculares:**
   - **Fuente:** *NASA Human Research Program (HRP) – Exploration Medical Capability (ExMC)* & *European Space Agency (ESA) Microgravity Resuscitation Guidelines* (Técnicas *Evetts-Russomano* y *Handstand Method*).
   - **Aplicación en el MVP:** Fundamenta el protocolo de **Evento Cardiovascular / RCP Espacial**, explicando por qué en entornos de microgravedad ($0\text{ g}$) las compresiones torácicas convencionales empujan al reanimador lejos del paciente y requieren técnicas de sujeción con piernas/arnés o postura invertida apoyada en la estructura de la cabina.

3. **Síncope Espacial e Intolerancia Ortostática:**
   - **Fuente:** *NASA HRP – Risk of Orthostatic Intolerance During Re-exposure to Gravity* (Human Research Roadmap).
   - **Aplicación en el MVP:** Respalda el protocolo de **Síncope / Desmayo Súbito**, vinculando el desplazamiento cefálico de fluidos en microgravedad y el desacondicionamiento cardiovascular con episodios de mareo, hipotensión y desmayos al transicionar hacia campos gravitatorios parciales (Luna $0.16\text{ g}$ o Marte $0.38\text{ g}$).

4. **Trauma Interno y Diagnóstico por Ultrasonido en el Espacio (Protocolo FAST):**
   - **Fuente:** *NASA HRP – Advanced Diagnostic Ultrasound in Microgravity (ADUM)* y protocolos médicos de la Estación Espacial Internacional (ISS).
   - **Aplicación en el MVP:** Sustenta el módulo **Trauma Interno / Escaneo FAST**, diseñado bajo el principio operativo de la NASA mediante el cual astronautas sin formación médica previa realizan exploraciones de ultrasonido guiadas paso a paso para descartar hemorragias internas y transmitir imágenes a los médicos de vuelo en Tierra.

5. **Emergencias Neurológicas (Convulsiones), Hipoxia y Shock Metabólico/Térmico:**
   - **Fuente:** *NASA ISS Integrated Medical Group (IMG) – ISS Medical Checklist (JSC-48522)* & *NASA HRP – Risk of Adverse Health Outcomes and Decrements in Performance Due to In-Flight Medical Conditions*.
   - **Aplicación en el MVP:** Fundamenta las guías paso a paso para **Crisis Convulsiva / Epilepsia** (protección contra colisiones en cabina sin restricción física forzada), **Hipoxia / Atmósfera Hostil** (gestión de suministro de $\text{O}_2$ y acumulación de $\text{CO}_2$ en entornos cerrados) y **Shock Hipoglucémico o Térmico** (intervención ante valores críticos de glucosa en $\text{mg/dL}$ y termorregulación).

6. **Auditoría del Copiloto IA de Triaje (Alcance en el MVP):**
   - **Naturaleza del Sistema:** En esta versión MVP de hackatón, el motor de triaje por síntomas opera mediante un **sistema experto determinista basado en reglas clínicas de la NASA** combinado con heurísticas asistidas por IA que cruzan los síntomas ingresados por teclado/clics con el expediente clínico pre-cargado del astronauta (tipo de sangre, alergias, cirugías previas y signos vitales simulados). No emite diagnósticos médicos definitivos y prioriza la estabilización temprana y el empaquetado de datos para los médicos de vuelo en Tierra.

---

## 3. Librerías de Terceros, Tipografías Abiertas, Política de Cero Licencias de Paga y Código Propio

En cumplimiento estricto de la regla de **minimización de dependencias de terceros y prohibición absoluta de licencias de paga o comerciales**, este proyecto evita paquetes pesados o restrictivos y prioriza **APIs web nativas y código propio**:

### 3.1 Dependencias de Código Abierto Utilizadas (Todas Licencias Permisivas Gratuitas)
| Paquete / Recurso | Versión (aprox.) | Tipo de Licencia | Propósito y Justificación |
| :--- | :--- | :--- | :--- |
| `next` | `^15.3.2` | **MIT** | Framework React App Router para renderizado rápido, `next/font/google` y enrutamiento local del MVP. |
| `react` / `react-dom` | `^19.1.0` | **MIT** | Biblioteca base de interfaz reactiva declarativa. |
| `lucide-react` | `^0.511.0` | **ISC** | Conjunto liviano de íconos vectoriales de código abierto para telemetría médica. |
| `tailwindcss` / `@tailwindcss/postcss` | `^4.1.7` | **MIT** | Sistema utilitario de estilos CSS conectado a los tokens de `deeptrau_design_system.md` en `globals.css`. |
| `typescript` | `^5.8.3` | **Apache 2.0** | Tipado estático estricto para modelos médicos, misiones y sensores. |
| Fuentes `IBM Plex Sans` y `IBM Plex Mono` | Google Fonts (`next/font`) | **SIL Open Font License 1.1** | Tipografía editorial principal y telemetría numérica especificada en `deeptrau_design_system.md`. |

### 3.2 Módulos Construidos 100% con Código Propio (Cero Librerías Externas)
Para mantener el software auditable, liviano y completamente libre de licencias comerciales:
- **Sistema de Diseño y Tokens CSS (`deeptrau_design_system.md` + `src/app/globals.css`):** Paleta mineral cálida (`#F7F5F0`, `#FFFFFF`, `#2F5D46`), jerarquía tonal y tokens semánticos propios sin kits de UI comerciales.
- **Gráficas de Telemetría (Radiación $\text{mSv}$, Glucosa $\text{mg/dL}$, Salud Mental y Retención Ósea):** Implementadas 100% con elementos `<svg>` nativos de React (sin `recharts`, `chart.js` ni librerías comerciales).
- **Figura Humana Interactiva y Mini Mapa de Emergencias:** Ilustraciones anatómicas vectoriales `<svg>` diseñadas a medida con zonas clicables y resaltado dinámico.
- **Animaciones y Biofeedback Visual:** Implementadas con transiciones nativas de CSS (`180ms cubic-bezier(0.2, 0, 0, 1)`) y Tailwind (sin `framer-motion`).
- **Paisajes Sonoros y Alertas de Cabina SOS:** Sintetizados en tiempo real mediante la `Web Audio API` nativa del navegador (sin archivos `.mp3` con copyright ni SDKs de audio de terceros).
- **Video-Diario y Carga de Imágenes:** Implementados con `navigator.mediaDevices.getUserMedia`, `FileReader` y `window.localStorage` nativos del navegador.
