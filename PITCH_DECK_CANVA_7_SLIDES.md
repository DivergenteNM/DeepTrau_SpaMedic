# Guía de Presentación de Lectura Autónoma en Canva (7 Diapositivas) — DeepTrau SpaMedic

> **Modo de evaluación:** **Lectura autónoma por el jurado (sin exposición oral).** Cada diapositiva es auto-explicativa: combina titulares con contexto completo, cápsulas de lectura rápida y capturas reales anotadas para que el jurado comprenda qué problema resuelve y cómo cumple el **100% de los objetivos de `NASA challenge.pdf`** en menos de 3 minutos de lectura.  
> **Estilo visual en Canva (Basado en `deeptrau_design_system.md`):**
> - **Fondo:** Mineral cálido (`#F7F5F0`) con tarjetas blancas (`#FFFFFF`) y bordes (`#D8D3C8`).
> - **Color Primario (Nominal / Clínico):** Verde forestal (`#2F5D46`) sobre salvia suave (`#DFECE4`).
> - **Semáforo de Triaje (Requisito NASA PDF):** Verde Óptimo (`#2F5D46`), Ámbar Precaución/Radiación (`#B54708`), Rojo Crítico/SOS (`#B42318`) y Azul Telemetría (`#2B5B6C`).
> - **Tipografías en Canva:** `IBM Plex Sans` (o `Space Grotesk`) para títulos y bloques de lectura; `IBM Plex Mono` para métricas (`mSv`, `mg/dL`, `SpO₂%`, `mmHg`, `ms`).

---

## Mapa de Peso según `NASA challenge.pdf` (Qué Busca el Jurado)

| Criterio explícito en `NASA challenge.pdf` | Dónde lo resuelve DeepTrau SpaMedic | Diapositiva donde debe brillar |
| :--- | :--- | :--- |
| **Autoevaluación en los 5 Peligros NASA HRP** (Radiación, Aislamiento, Distancia, Gravedad, Entornos Cerrados) | Motor autónomo *Local-First* que cruza entorno + signos vitales + acciones inmediatas | **Slides 1, 2 y 3** |
| **4 Entornos de misión** (*nave espacial, estación, rover explorador y base lunar/planetaria*) | Selector de 4 misiones con gravedad, retraso de señal y riesgos propios (`OnboardingFlow`) | **Slide 2** |
| **Figura humana interactiva + Codificación por colores** (Verde / Amarillo / Rojo de un vistazo) | Escáner anatómico SVG interactivo de 5 sistemas + Mini-mapa corporal SOS | **Slide 3 (Protagonista)** |
| **No asumir que el astronauta es médico** (Instrucciones sencillas: qué medir, por qué importa y qué hacer) | Guías de 4 pasos por sensor, modo manual sin hardware y tarjetas *"¿Por qué importa?"* | **Slides 3 y 4** |
| **Entradas multimodales** (*teclado, clics del ratón, cámara*) e indicadores (*PA, FC, glucosa `mg/dL`, temp `°C`, sueño, ánimo, ultrasonido*) | Hub de 6 sensores + Carga de Ultrasonido + Video-Diario con cámara/voz + Test PVT con clics | **Slides 4 y 6** |
| **Gráficos dinámicos en el tiempo + Recurso CSA de Radiación (`mSv`)** | Curvas SVG interactivas por día: Radiación CSA (`mSv`), Glucosa (`mg/dL`), Leucocitos, Hueso/Músculo y Sueño | **Slide 5** |
| **Avisos de rutina + Gamificación + Escalamiento a médicos en Tierra** | Briefing de riesgos, tareas Atrasadas/Urgentes, Racha/Puntos y Consola SOS con envío de paquete a Tierra | **Slides 3, 6 y 7** |

---

## Catálogo Maestro de Capturas de Pantalla (SS) que Debes Tomar

Antes de armar las láminas, abre tu app (`http://localhost:3000`) y toma estas **10 capturas exactas (SS)**:

- **📸 SS #1 (Centro de Comando Completo):** En `Centro de Comando` con `Cmdr. Elena Vance` en `Nave en Tránsito Profundo`. Que se vean los 4 KPIs superiores, el **Mapa Corporal Interactivo SVG** a la izquierda y la tarjeta de **Racha + Rutina del Día** a la derecha.
- **📸 SS #2 (Paso 1 Onboarding — Las 4 Misiones):** Abre `Pruebas ➔ Cambiar Misión / Astronauta`. Captura la cuadrícula con las **4 tarjetas de misión** (*Nave en Tránsito Profundo, Hábitat Planetario/Lunar, Estación Espacial en Órbita, Vehículo Explorador Presurizado*).
- **📸 SS #3 (Paso 2 Onboarding — Expediente Clínico e Inteligencia Cruzada):** Haz clic en el Paso 2 (*Astronauta e Historia Clínica*). Captura los 3 perfiles precargados arriba y el panel derecho **"Cruce Inteligente con Historia Clínica"** mostrando cómo se adaptan sangre `O-`, inmunidad y cirugía de rodilla.
- **📸 SS #4 (Briefing de Riesgos + Rutina con Atrasadas/Urgentes):** Recarga o pulsa el botón `Briefing de riesgos` en el Dashboard para capturar el modal **"Briefing de Riesgos y Prevención del Turno"** (o el modal `Enfoque` donde se ven las tareas enmarcadas como **Atrasadas de días anteriores** y **Prioridad urgente de hoy**).
- **📸 SS #5 (Hub de Sensores + Modal de Guía en 4 Pasos):** En `Conectar Herramientas`, haz clic sobre **Dosímetro CSA** o **Ultrasonido** para abrir el modal. Captura la sección **"Cómo tomar la medida · Protocolo del Astronauta (4 pasos + Protocolo clínico manual sin sensor)"** y el cargador de imagen de ultrasonido.
- **📸 SS #6 (Supervivencia y Radiación Acumulada CSA en `mSv`):** En `Monitoreo de Misión`, captura el bloque superior completo **"Supervivencia de Misión y Radiación Acumulada (mSv)"** pasando el cursor sobre el `Día 45` en la gráfica (para que se vea la barra de presupuesto, la autonomía en días y la línea de Límite Crítico).
- **📸 SS #7 (Glucosa `mg/dL` + Tendencia de Leucocitos e Inmunidad):** Justo debajo en `Monitoreo de Misión`, captura las dos tarjetas inferiores juntas: **Panel Detallado de Glucosa en Sangre (mg/dL)** y **Inmunidad y Sangre** con su micro-gráfica de leucocitos.
- **📸 SS #8 (Densidad Ósea y Muscular Adaptada por Cirugía):** En `Densidad Ósea y Músculo`, inicia el temporizador de un ejercicio (ej. *ARED Adaptado*) y captura el banner amarillo de **Adaptación Automática por Cirugías Previas**, el temporizador activo y la **Curva de Conservación Ósea vs. Sin Ejercicio**.
- **📸 SS #9 (Salud Mental: Test PVT + Respiración 4-4-4-4 + Video-Diario + Mi Ancla):** En `Salud Mental y Psicología`, captura el **Test Cognitivo PVT** (tras completar 5 clics para que muestre los `ms`), el **Video-Diario con pre-análisis local** y **Mi Ancla en la Tierra**.
- **📸 SS #10 (Consola SOS Emergencia en Código Rojo):** En la barra superior, pulsa `Simular Crisis ➔ 1. Síncope / Shock Hipoglucémico` (o `SOS EMERGENCIA`). Captura la consola SOS mostrando el **Mini-Mapa Anatómico**, el **Cronómetro de episodio**, las **Contraindicaciones personalizadas por alergia a Penicilina** y el botón de **Transmitir Paquete Crítico a Tierra**.

---

## Estructura Detallada Diapositiva por Diapositiva (Para Lectura del Jurado)

---

### Diapositiva 1: Portada — Autonomía Médica Cuando la Tierra Está Lejos
1. **Objetivo (< 5 segundos):** Presentar **DeepTrau SpaMedic** como el software visual de autoevaluación y respuesta médica autónoma para astronautas en misiones espaciales de larga duración.
2. **Texto exacto para la diapositiva (Auto-explicativo):**
   - **Etiqueta superior:** `NASA SPACE APPS CHALLENGE · SOFTWARE DE MONITORIZACIÓN DE SALUD ESPACIAL`
   - **Título principal:** **DeepTrau SpaMedic**
   - **Subtítulo explicativo:** Plataforma visual autónoma (*100% Local-First*) que permite a los astronautas detectar cambios fisiológicos y psicológicos en sí mismos, interpretar sus métricas sin depender de Tierra y actuar a tiempo ante los **5 Peligros de los Vuelos Espaciales de la NASA**.
   - **3 Píldoras de resumen al pie:**
     - `4 Entornos de Misión (Órbita, Tránsito, Luna/Marte, Rover)`
     - `Cruce con Historia Clínica Personal (EHR)`
     - `Triaje Visual + Protocolos SOS sin Internet`
3. **Elementos visuales y dónde pegar las SS en Canva:**
   - **Lado izquierdo (45%):** Logo oficial (`public/DeepTrau_logo.webp`), título, subtítulo explicativo y las 3 píldoras en verde clínico (`#2F5D46`).
   - **Lado derecho (55%):** Pega **📸 SS #1 (Centro de Comando Completo)** dentro de un marco de laptop grande e inclinado ligeramente, añadiendo 2 etiquetas flotantes (*callouts*) que apunten al **Mapa Corporal SVG** y a la **Racha/Gamificación**.
4. **Guía de diseño para lectura sin presentador:**
   - Añade un pequeño sello en la esquina superior derecha: *"Basado en datos abiertos de NASA Human Research Program (HRP) & Canadian Space Agency (CSA)"*.

---

### Diapositiva 2: El Problema y la Personalización por Misión (Los 4 Entornos)
1. **Objetivo (< 5 segundos):** Explicar por qué los astronautas necesitan autoevaluarse solos y mostrar cómo DeepTrau adapta todas las métricas según los **4 entornos espaciales** y el **expediente médico previo**.
2. **Texto exacto para la diapositiva (Auto-explicativo):**
   - **Título:** **Un Mismo Peligro No Afecta Igual a Cada Misión ni a Cada Cuerpo**
   - **Bloque 1 — El Reto en Espacio Profundo:** Hacia la Luna (Artemis) y Marte, los astronautas enfrentan **radiación cósmica, microgravedad (`0g`), aislamiento, entornos cerrados y hasta 40 min de retraso de comunicación**. Ellos mismos deben detectar y tratar anomalías antes de que se vuelvan críticas.
   - **Bloque 2 — Adaptación a 4 Entornos Operativos:** DeepTrau reconfigura automáticamente los límites de radiación (`mSv`), la pérdida ósea esperada, los sensores embarcados y las prioridades según la misión: **Nave en Tránsito Profundo**, **Estación Orbital**, **Hábitat Planetario/Lunar** o **Rover Explorador**.
   - **Bloque 3 — Cruce con Expediente Clínico (EHR):** Antes de despegar, el sistema cruza **tipo de sangre, estado inmune (defensas bajas), cirugías previas (rodilla/hombro/columna), alergias y signos vitales base** para personalizar umbrales y ejercicios.
3. **Elementos visuales y dónde pegar las SS en Canva:**
   - **Arriba a la derecha:** Pega **📸 SS #2 (Paso 1 Onboarding — Las 4 Misiones)** destacando con un recuadro verde cómo cambian la gravedad y la radiación en cada tarjeta.
   - **Abajo a la derecha:** Pega **📸 SS #3 (Paso 2 Onboarding — Cruce Inteligente con Historia Clínica)** señalando con una flecha la tarjeta donde el sistema detecta *Defensas Bajas* y *Cirugía de menisco*.

---

### Diapositiva 3: El Centro de Comando — Figura Humana Interactiva, Triaje y Gamificación
1. **Objetivo (< 5 segundos):** Mostrar el corazón visual pedido en `NASA challenge.pdf`: la **figura humana interactiva codificada por colores**, las explicaciones en lenguaje sencillo, los avisos de rutina y la gamificación.
2. **Texto exacto para la diapositiva (Auto-explicativo):**
   - **Título:** **Diagnóstico Visual de un Vistazo: Mapa Corporal, Rutinas y Gamificación**
   - **1. Figura Humana Interactiva SVG (5 Sistemas):** Cada órgano/zona anatómica (*Cerebro, Cardiovascular, Metabolismo, Inmunidad y Musculoesquelético*) cambia dinámicamente entre **Verde (Óptimo)**, **Amarillo (Precaución)** y **Rojo (Crítico)** al pasar el cursor o hacer clic.
   - **2. Lenguaje Claro para No-Médicos:** Cada alerta responde tres preguntas en español llano: **¿Qué se detectó?**, **¿Por qué importa en el espacio?** y **¿Qué acción tomar ahora mismo?**.
   - **3. Avisos de Rutina y Gamificación:** Al iniciar el turno, un **Briefing de Riesgos** prioriza controles **Atrasados** y **Urgentes**, mientras que el sistema de **Racha (días), Puntos de Salud e Índice de Preparación (%)** mantiene la adherencia de la tripulación.
3. **Elementos visuales y dónde pegar las SS en Canva:**
   - **Centro / Izquierda (60%):** Pega un recorte grande y nítido del **Mapa Corporal Interactivo SVG** (tomado de **📸 SS #1**) mostrando el tooltip flotante sobre un órgano y el panel lateral con *"¿Por qué importa en el espacio?"* y *"Qué hacer ahora"*.
   - **Derecha (40%):** Pega **📸 SS #4 (Briefing de Riesgos / Rutina con Atrasadas y Urgentes)** + un recorte de la tarjeta de **Racha Activa y Puntos de Salud**.

---

### Diapositiva 4: Autoevaluación Guiada — Hub de Sensores, Ultrasonido y Modo Manual
1. **Objetivo (< 5 segundos):** Demostrar cómo el astronauta recopila sus propios indicadores médicos (incluso imágenes de ultrasonido) con instrucciones paso a paso, y qué pasa si una herramienta falla o no está disponible.
2. **Texto exacto para la diapositiva (Auto-explicativo):**
   - **Título:** **Cero Suposiciones: Guías de Medición Paso a Paso y Resiliencia sin Sensores**
   - **1. 6 Herramientas Biomédicas y Carga de Ultrasonido:** Monitoreo de **Presión Arterial (`mmHg`), Frecuencia Cardíaca (`bpm`), Oxigenación (`SpO₂%`), Temperatura (`°C`), Glucosa (`mg/dL`), Leucocitos (`cél/µL`), Dosimetría (`mSv`)** y carga de capturas de **Ultrasonido ocular/muscular (`SANS`)**.
   - **2. Instrucciones Clínicas en 4 Pasos:** Como el astronauta no siempre es médico, cada sensor incluye una guía numerada de **cómo tomar la muestra en microgravedad**, autodiagnóstico del equipo y rangos operativos.
   - **3. Resiliencia Automática (Fallback Manual):** Si un sensor se desconecta o no va embarcado (ej. en el Rover), DeepTrau transforma automáticamente la tarea de la rutina en un **examen físico manual guiado** (pulso radial, inspección de mucosas, rejilla visual Amsler).
3. **Elementos visuales y dónde pegar las SS en Canva:**
   - **Izquierda (50%):** Pega la vista de tarjetas de **Conectar Herramientas (`SensorHubTab`)** mostrando sensores `Conectados`, `Desconectados (Modo manual)` y `No embarcados`.
   - **Derecha (50%):** Pega **📸 SS #5 (Modal de Detalle del Sensor)** señalando con 3 etiquetas: `(A) Guía paso a paso del astronauta`, `(B) Protocolo clínico manual sin sensor`, y `(C) Simulador / Carga de imagen de ultrasonido`.

---

### Diapositiva 5: Gráficos Dinámicos — Dosimetría CSA (`mSv`), Sangre, Glucosa y Hueso
1. **Objetivo (< 5 segundos):** Resaltar las gráficas históricas interactivas y la integración de los recursos de la **Agencia Espacial Canadiense (CSA)** para radiación (`mSv`) junto con conservación ósea/muscular (`BMD %`).
2. **Texto exacto para la diapositiva (Auto-explicativo):**
   - **Título:** **Seguimiento en el Tiempo: Radiación CSA (`mSv`), Metabolismo y Conservación Ósea**
   - **1. Dosimetría CSA y Supervivencia de Misión (`mSv`):** Calcula el consumo del presupuesto seguro de radiación, los **días restantes de autonomía al ritmo actual** y dispara protocolos de **refugio blindado (agua/polietileno)** ante tormentas solares.
   - **2. Cruce de Glucosa (`mg/dL`) e Inmunidad (`cél/µL`):** Compara en vivo la glucosa frente a la línea base pre-misión (previniendo hipoglucemia en caminatas EVA) y grafica la caída de leucocitos por estrés radiativo.
   - **3. Protección Ósea y Articular (`BMD %`):** Compara la retención ósea/muscular real frente a la curva de deterioro sin ejercicio (`-1.5%/mes`), con **temporizador guiado (ARED/T2/CEVIS)** que sustituye automáticamente ejercicios si el astronauta tiene cirugías previas.
3. **Elementos visuales y dónde pegar las SS en Canva (Mosaico de 3 paneles):**
   - **Arriba (Ancho completo o 60%):** Pega **📸 SS #6 (Supervivencia y Radiación Acumulada CSA `mSv`)** mostrando la barra de presupuesto, proyección de fin de misión y gráfica con límite crítico.
   - **Abajo Izquierda:** Pega **📸 SS #7 (Glucosa `mg/dL` + Tendencia de Leucocitos)**.
   - **Abajo Derecha:** Pega **📸 SS #8 (Densidad Ósea y Muscular con Temporizador y Curva Comparativa)**.

---

### Diapositiva 6: Salud Mental en Confinamiento y Respuesta Autónoma SOS
1. **Objetivo (< 5 segundos):** Mostrar cómo DeepTrau recoge entradas por **clics, teclado y cámara** para proteger la mente del aislamiento, y cómo guía al astronauta paso a paso cuando un resultado exige **atención de emergencia o escalamiento a los médicos en Tierra**.
2. **Texto exacto para la diapositiva (Auto-explicativo):**
   - **Título:** **Psicología del Confinamiento y Protocolos Críticos SOS hacia la Tierra**
   - **1. Salud Mental Multimodal (Clics, Teclado y Cámara):**
     - **Clics de precisión:** Test de Vigilancia Psicomotora (**PVT en milisegundos**) que detecta fatiga circadiana objetiva.
     - **Cámara, micrófono y texto:** **Video-Diario** con análisis local de fatiga vocal/emocional y envío asíncrono a psicólogos en Tierra.
     - **Regulación autonómica:** Respiración guiada `4-4-4-4`, control de luz de cabina (`1800K`) y paisajes sonoros familiares (*"Mi Ancla en la Tierra"*).
   - **2. ¿Cuándo escalar a la tripulación o a Tierra? (Módulo SOS Emergencia):** Ante valores críticos o síntomas agudos (*Síncope, Convulsión 0g, Hipoxia, RCP Evetts-Russomano, Trauma FAST*), activa una consola paso a paso con **cronómetro de episodio**, **alertas de alergias del expediente** y **empaquetado crítico de telemetría hacia los médicos de vuelo en Tierra**.
3. **Elementos visuales y dónde pegar las SS en Canva:**
   - **Izquierda (48%):** Pega **📸 SS #9 (Salud Mental: Test PVT + Video-Diario + Mi Ancla)**.
   - **Derecha (52%):** Pega **📸 SS #10 (Consola SOS Emergencia en Código Rojo)** destacando con un borde rojo el **Cronómetro**, el **Mini-Mapa de revisión rápida**, la **alerta de alergia a Penicilina** y el **Envío de paquete a Tierra**.

---

### Diapositiva 7: Cierre, Impacto Dual (Espacio + Tierra) y Guía para Probar el MVP
1. **Objetivo (< 5 segundos):** Cerrar conectando el valor espacial con la medicina remota en la Tierra (como destaca el recurso de la CSA) y darle al jurado las instrucciones exactas para probar el MVP interactivo por su cuenta.
2. **Texto exacto para la diapositiva (Auto-explicativo):**
   - **Título:** **Diseñado para Marte. Vital para la Tierra. Pruébalo Ahora.**
   - **Impacto Dual (NASA & CSA):** La misma autonomía médica creada para proteger astronautas incomunicados en la Luna o Marte permite llevar triaje guiado, ultrasonido asistido y seguimiento clínico a **bases antárticas, submarinos, alta mar y comunidades rurales sin médicos ni internet en la Tierra**.
   - **Arquitectura Abierta y Auditable:** 100% código propio en español, gráficas SVG nativas, audio bioacústico por *Web Audio API* y cero licencias comerciales restrictivas.
   - **Guía de 3 pasos para el Jurado en la Demo Desplegada:**
     1. **Elige una de las 4 misiones y un astronauta** (o usa el botón superior `Pruebas ➔ Desde Portada` para reiniciar todo el recorrido).
     2. **Explora el Mapa Corporal SVG y desconecta sensores** en *Conectar Herramientas* para ver cómo cambian las rutinas a modo manual.
     3. **Pulsa `Simular Crisis` o `Pruebas ➔ Tormenta Solar`** en la barra superior para disparar las alertas rojas y el protocolo **SOS Emergencia**.
3. **Elementos visuales y dónde pegar las SS en Canva:**
   - **Izquierda:** Tarjeta con los **3 pasos para que el jurado pruebe la app** + recorte del menú superior mostrando los botones `Simular Crisis`, `SOS EMERGENCIA` y `Pruebas ➔ Desde Portada`.
   - **Derecha:** Tarjeta destacada con el **Código QR / Enlace directo al MVP desplegado** y el enlace al **Repositorio en GitHub** (`github.com/DivergenteNM/DeepTrau_SpaMedic`).
