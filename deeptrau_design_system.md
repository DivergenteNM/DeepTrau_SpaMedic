---
name: "DeepTrau SpaMedic"
description: "Sistema de diseño oficial para DeepTrau: telemetría médica espacial autónoma, psicología de misión y contramedidas fisiológicas."
---

## Overview

**DeepTrau** es una interfaz autónoma de telemetría médica aeroespacial y planificación de misiones creada para el reto **NASA Space Apps**. Combina un lienzo mineral cálido de alta legibilidad (`surface: #F7F5F0`), superficies elevadas limpias (`#FFFFFF`), verde clínico forestal (`primary: #2F5D46`) y acentos semánticos de alto contraste para que tripulación y cirujanos de vuelo evalúen riesgos fisiológicos, radiación e inmunidad sin fatiga visual.

---

## Colors

### Paleta Base del Sistema (Tokens Canónicos)

```yaml
colors:
  # Marca y Acción Primaria (Verde Clínico / Estado Nominal)
  primary: "#2F5D46"
  primary-hover: "#1D3D2D"            # Reutiliza on-primary-container
  on-primary: "#F7F5F0"
  primary-container: "#DFECE4"
  on-primary-container: "#1D3D2D"
  secondary: "#4A7C64"
  on-secondary: "#FFFFFF"

  # Superficies y Jerarquía Tonal (Light Mode Mineral)
  surface: "#F7F5F0"
  surface-container-low: "#EFECE4"
  surface-container: "#FFFFFF"
  surface-container-high: "#E5E0D5"
  on-surface: "#1A241E"
  on-surface-variant: "#55635B"
  outline: "#D8D3C8"
  outline-variant: "#E6E2D8"

  # Triaje Crítico / Error / Tipo de Sangre
  danger: "#B42318"
  danger-hover: "#7A271A"             # Reutiliza on-danger-container
  danger-container: "#FEE4E2"
  on-danger-container: "#7A271A"

  # Triaje Precaución / Radiación / Racha
  warning: "#B54708"
  warning-hover: "#7A2E0E"            # Reutiliza on-warning-container
  warning-container: "#FEF0C7"
  on-warning-container: "#7A2E0E"

  # Información y Estado Nominal (Mapeado a Primary)
  info: "#2F5D46"
  info-container: "#DFECE4"
  on-info-container: "#1D3D2D"
  nominal: "#2F5D46"                  # Alias semántico de primary
  nominal-container: "#DFECE4"        # Alias semántico de primary-container
  on-nominal-container: "#1D3D2D"     # Alias semántico de on-primary-container
```

### Tokens Adicionales Estrictamente Necesarios para Componentes Especializados

Estos tokens solo se utilizan cuando la paleta base no permite diferenciar series simultáneas en gráficas o visores ópticos:

```yaml
component-colors:
  # Serie Secundaria de Telemetría (ej. Horas de Sueño, Masa Muscular, Glucosa Capilar, Enlace Tierra)
  # Necesaria para evitar colisión visual entre dos verdes en gráficas multi-línea.
  telemetry: "#2B5B6C"
  telemetry-container: "#DCE9EE"
  on-telemetry-container: "#183945"

  # Visor Óptico Oscuro (Preview de cámara en Video-Diario; reutiliza on-surface y surface)
  viewport-surface: "#1A241E"
  on-viewport: "#F7F5F0"
  viewport-border: "#2F5D46"

  # Rellenos Translúcidos Derivados (Mapa Corporal SVG, Corredores de Gráfica y Anillos Focus)
  nominal-fill: "rgba(47, 93, 70, 0.20)"
  warning-fill: "rgba(181, 71, 8, 0.20)"
  danger-fill: "rgba(180, 35, 24, 0.22)"
  telemetry-fill: "rgba(43, 91, 108, 0.14)"
  focus-ring: "rgba(47, 93, 70, 0.24)"
```

---

## Typography

```yaml
typography:
  display-hero:
    fontFamily: "IBM Plex Sans"
    fontSize: "clamp(40px, 5vw, 72px)"
    fontWeight: 500
    lineHeight: "0.98"
    letterSpacing: "-0.035em"
  display-md:
    fontFamily: "IBM Plex Sans"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: "34px"
    letterSpacing: "-0.025em"
  headline-lg:
    fontFamily: "IBM Plex Sans"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: "28px"
    letterSpacing: "-0.02em"
  headline-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "-0.01em"
  title-md:
    fontFamily: "IBM Plex Sans"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "22px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "IBM Plex Sans"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "IBM Plex Sans"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.06em"
  label-sm:
    fontFamily: "IBM Plex Mono"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "14px"
    letterSpacing: "0.04em"
```

---

## Layout & Spacing

- Retícula espacial de `8px` con padding generoso (`px-4 sm:px-6 lg:px-8 py-6`) y `gap-6` entre bloques principales.
- Radios estandarizados: `rounded-2xl` (`16px`) para tarjetas y módulos contenedores exteriores; `rounded-xl` (`12px`) para sub-tarjetas métricas, botones principales y campos de formulario; `rounded-lg` (`8px`) para píldoras y botones compactos.

---

## Elevation & Borders

DeepTrau se apoya en **escalonamiento tonal de superficies** (`surface` `#F7F5F0` → `surface-container` `#FFFFFF` → `surface-container-low` `#EFECE4` → `surface-container-high` `#E5E0D5`) y bordes nítidos de `1px` (`outline` `#D8D3C8` / `outline-variant` `#E6E2D8`) en lugar de sombras pesadas.

- **Tarjetas seleccionadas / activas:** Borde `primary` (`#2F5D46`) con anillo exterior sutil `0 0 0 3px rgba(47, 93, 70, 0.14)` (`focus-ring`) y fondo `surface-container` (`#FFFFFF`) o `primary-container` (`#DFECE4`).
- **Tarjetas de alerta:** Fondo `warning-container` (`#FEF0C7`) con borde `warning` (`#B54708`) o fondo `danger-container` (`#FEE4E2`) con borde `danger` (`#B42318`).

---

## Motion

```yaml
motion:
  standard:
    duration: "180ms"
    delay: "0ms"
    timingFunction: "cubic-bezier(0.2, 0, 0, 1)"
  entrance:
    duration: "260ms"
    delay: "0ms"
    timingFunction: "cubic-bezier(0.16, 1, 0.3, 1)"
  press:
    duration: "120ms"
    scale: "0.985"
```

- **Cursor y Micro-interacciones:** Todo botón, tarjeta clicable, selector, tab y zona SVG interactiva usa `cursor-pointer` (`disabled:cursor-not-allowed`), elevación sutil en hover (`-1px` / `-2px` según jerarquía), respuesta táctil al clic (`active:scale-[0.985]`) y anillo `focus-visible` basado en `focus-ring`.
- **Transiciones Suaves:** Cambios de pestaña (`.dt-animate-enter`), paneles/banners dinámicos (`.dt-animate-panel`) y barras de progreso (`transition-[width]`) respetan `@media (prefers-reduced-motion: reduce)`.

---

## Component Token Mapping (Cobertura Completa de la App)

| Componente | Superficie / Fondo | Texto | Borde / Acento |
| :--- | :--- | :--- | :--- |
| **Lienzo Global (`body`)** | `surface` (`#F7F5F0`) | `on-surface` (`#1A241E`) | Scrollbar `outline` / `primary` |
| **TopTelemetryBar & SidebarNav** | `surface-container` (`#FFFFFF`) | `on-surface` / `on-surface-variant` | `outline`; ítem activo en `primary-container` + texto `on-primary-container` |
| **Tarjetas KPI y Paneles** | `surface-container` (`#FFFFFF`) | `on-surface` / `on-surface-variant` | `outline`; sub-cajas en `surface-container-low` (`#EFECE4`) |
| **Botón Primario / CTA** | `primary` (`#2F5D46`), hover `primary-hover` | `on-primary` (`#F7F5F0`) | Sin borde o `primary` |
| **Botón Secundario / Ghost** | `surface-container-low` (`#EFECE4`) | `on-surface` (`#1A241E`) | `outline` (`#D8D3C8`) |
| **Inputs / Selects / Textareas** | `surface` (`#F7F5F0`) o `surface-container` | `on-surface` (`#1A241E`) | `outline`, focus `primary` (`#2F5D46`) |
| **Figura Humana SVG** | Fondo `surface-container-low`, silueta `surface-container` | `on-surface-variant` | Zonas: `nominal-fill` + `primary`, `warning-fill` + `warning`, `danger-fill` + `danger` |
| **Gráficas Multi-Serie SVG** | Fondo `surface-container`, grilla `outline-variant` | Ejes `on-surface-variant` | Serie 1: `primary` (`#2F5D46`), Serie 2: `telemetry` (`#2B5B6C`), Serie 3: `warning` (`#B54708`) / `danger` (`#B42318`) |
| **Video-Diario (Visor Cámara)** | `viewport-surface` (`#1A241E`) | `on-viewport` (`#F7F5F0`) | `viewport-border` (`#2F5D46`), badge REC en `danger` (`#B42318`) |
| **Muro de Inspiración ("Mi Ancla")** | Contenedores `primary-container`, `telemetry-container`, `warning-container`, `danger-container` | Respectivos `on-*-container` | `outline` |
| **Gamificación (Racha & Puntos)** | Racha en `warning-container`; Puntos en `primary-container` | `on-warning-container` / `on-primary-container` | Barra de progreso `primary` sobre `surface-container-high` |
