# Auditoría de IA, Fuentes Científicas y Créditos (`CREDITS_AND_AI_AUDIT.md`)

Documento de transparencia para la inscripción de **DeepTrau** (*DeepTrau SpaMedic*) en el **NASA Space Apps Challenge**. Resume el uso de inteligencia artificial, las fuentes científicas abiertas y las licencias empleadas.

---

## 1. Declaración y Auditoría de Uso de IA

### 1.1 Asistencia de IA en el Desarrollo y Contenidos
- **Código y arquitectura de la aplicación:** Todo el código fuente del MVP (arquitectura en Next.js App Router, interfaz bajo `deeptrau_design_system.md`, componentes vectoriales SVG, simuladores clínicos y validación en TypeScript) fue desarrollado con asistencia de IA mediante **Google Antigravity**, bajo dirección y revisión continua del equipo.
- **Presentación (Pitch Deck):** Asistencia de **Google Antigravity** para redactar, sintetizar y estructurar las diapositivas del proyecto (`PITCH_DECK_CANVA_7_SLIDES.md`).
- **Identidad visual:** El logotipo (`public/DeepTrau_logo.webp`) y el ícono/favicon (`src/app/favicon.ico`) fueron generados con **GPT (OpenAI)** bajo dirección creativa del equipo.
- **Recursos auditivos (Módulo de Bienestar Psicológico — Ancla Terrestre):** Los dos audios en inglés para mitigación del aislamiento fueron sintetizados en noviembre de 2026 mediante **Google Gemini** (modelos **Lyria / Lyria 3**, Google, 2026), a partir de guiones originales y especificaciones de diseño sonoro definidas por el equipo:
  - ***"Bridge Back Home"*** (`public/audio/carta_de_voz.mp3` — *Voice Letter: Ground Team & Friends*, pulso de 60 BPM, generado con **Lyria 3**).
  - ***"Breakfast at Home — Family Message"*** (`public/audio/video_familiar.mp3` — duración aprox. 90 s, generado con **Lyria** mediante *prompt* estructurado con guion en inglés, dirección vocal y *foley* ambiental de bosque, brisa y vajilla).
- **Supervisión humana:** El equipo definió los requisitos del reto de la NASA, el concepto **DeepTrau**, el sistema de diseño, la experiencia de usuario, los 4 escenarios de misión y el cruce con historial clínico pre-misión.

### 1.2 Comportamiento de IA dentro del MVP
- **Heurística local determinista (sin APIs externas):** Tanto el triaje clínico general, la adaptación de rutinas y sensores, el monitoreo de radiación/glucosa y el módulo de emergencias **SOS** operan localmente con reglas deterministas basadas en guías médicas de la NASA, cruzando signos vitales y síntomas con el expediente del astronauta. No emite diagnósticos médicos definitivos; prioriza la estabilización temprana y empaqueta la información para médicos de vuelo en Tierra.

---

## 2. Fuentes Científicas y Datos Abiertos (NASA, CSA y ESA)

Los parámetros fisiológicos, misiones y protocolos médicos del proyecto se fundamentan en documentación científica pública:

1. **NASA Human Research Program (HRP) — *5 Hazards of Human Spaceflight*** ([nasa.gov/hrp/hazards](https://www.nasa.gov/hrp/hazards/)): Marco de los 5 peligros espaciales (radiación, aislamiento, distancia, gravedad alterada y entornos cerrados) y biomarcadores críticos.
2. **NASA HRP — *Human Research Roadmap*** ([humanresearchroadmap.nasa.gov](https://humanresearchroadmap.nasa.gov/)): Pérdida ósea/muscular (equipos ARED, T2, CEVIS), síndrome neuro-ocular (SANS), intolerancia ortostática/síncope, desregulación inmune, resistencia insulínica y fatiga psicológica.
3. **NASA HRP (ExMC / ADUM) & ESA:** Guías de RCP en microgravedad (*Evetts-Russomano* y *Handstand Method*) y protocolo de ultrasonido diagnóstico rápido en órbita (*FAST / ADUM*).
4. **NASA ISS Integrated Medical Group — *ISS Medical Checklist (JSC-48522)*:** Protocolos de emergencia ante crisis convulsivas, hipoxia/atmósfera hostil y shock hipoglucémico o térmico.
5. **Canadian Space Agency (CSA) — *Radiation Monitoring*** ([asc-csa.gc.ca/eng/sciences/radiation.asp](https://www.asc-csa.gc.ca/eng/sciences/radiation.asp)): Modelado del dosímetro personal ($\text{mSv}$), tasas diarias por entorno espacial y refugio ante tormentas solares.

---

## 3. Stack Técnico, Licencias Abiertas y Recursos Propios

El proyecto cumple una política estricta de **cero licencias de paga o comerciales**, priorizando código propio y APIs nativas del navegador:

| Recurso / Librería | Licencia | Uso en el Proyecto |
| :--- | :--- | :--- |
| `next` (`^15.3.2`) & `react` / `react-dom` (`^19.1.0`) | **MIT** | Framework App Router e interfaz reactiva del MVP. |
| `tailwindcss` / `@tailwindcss/postcss` (`^4.1.7`) | **MIT** | Sistema de estilos conectado a los tokens de DeepTrau. |
| `lucide-react` (`^0.511.0`) | **ISC** | Íconos vectoriales ligeros para telemetría médica. |
| `typescript` (`^5.8.3`) | **Apache 2.0** | Tipado estático de modelos clínicos y misiones. |
| Fuentes `IBM Plex Sans` y `IBM Plex Mono` | **SIL OFL 1.1** | Tipografía editorial y numérica vía `next/font/google`. |

- **Implementación nativa y sin terceros:** Gráficas de telemetría y mapa anatómico construidos en `<svg>` propio; animaciones en CSS nativo; cámara, carga de archivos, persistencia y alertas sonoras resueltas con APIs nativas del navegador (`getUserMedia`, `FileReader`, `localStorage`, `Web Audio API`), más los dos `.mp3` originales generados con **Google Gemini (Lyria)** libres de derechos comerciales de terceros.
