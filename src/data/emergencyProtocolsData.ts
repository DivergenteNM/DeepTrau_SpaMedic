import { AstronautProfile } from './astronautsData';
import { BodySystemId } from './medicalKnowledge';
import { MissionType } from './missionsData';

export type EmergencyProtocolId =
  | 'seizure'
  | 'syncope'
  | 'cardiovascular_cpr'
  | 'hypoxia'
  | 'metabolic_thermal_shock'
  | 'internal_trauma_fast';

export type MiniBodyZoneId =
  | 'head'
  | 'airway_neck'
  | 'chest_heart'
  | 'abdomen_fast'
  | 'limbs_joints';

export type EmergencyVitalKey = 'bp' | 'hr' | 'spo2' | 'glucose' | 'temp';

export interface EmergencyZoneGuide {
  zoneId: MiniBodyZoneId;
  label: string;
  checkInstruction: string;
  criticalSign: string;
}

export interface EmergencyProtocol {
  id: EmergencyProtocolId;
  code: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  urgency: 'critical' | 'warning';
  relatedSystems: BodySystemId[];
  nasaReference: string;
  verifyNow: {
    vitalKeys: EmergencyVitalKey[];
    quickCheckSummary: string;
    zones: EmergencyZoneGuide[];
  };
  actionSteps: {
    zeroGSteps: string[];
    partialGravitySteps: string[];
    commonSteps: string[];
  };
  contraindications: string[];
  earthEscalation: string[];
}

export interface TriageVitalSnapshot {
  glucoseMgDl: number;
  spo2Percent: number;
  systolicBP: number;
  diastolicBP: number;
  heartRateBpm: number;
  bodyTempC: number;
  wbcCount: number;
}

export interface QuickSymptomTag {
  id: string;
  label: string;
  queryText: string;
}

export interface TriageRecommendation {
  possibleCause: string;
  urgency: 'critical' | 'warning';
  recommendedProtocolId: EmergencyProtocolId;
  immediateAction: string;
  ehrAlert: string;
  matchedSignals: string[];
}

export interface SimulatedCapturePreset {
  id: string;
  label: string;
  modality: 'Ultrasonido FAST' | 'Cámara Óptica';
  caption: string;
  findingSummary: string;
  dataUrl: string;
}

export const EMERGENCY_PROTOCOLS: EmergencyProtocol[] = [
  {
    id: 'seizure',
    code: 'PRO-01 · NEURO',
    title: 'Crisis Convulsiva / Epilepsia',
    shortTitle: 'Crisis Convulsiva',
    subtitle: 'Contención segura anti-impactos en cabina y control de vía aérea sin fuerza física.',
    urgency: 'critical',
    relatedSystems: ['brain', 'cardiovascular'],
    nasaReference: 'NASA ISS Medical Checklist (JSC-48522) · Manejo Neurológico en Microgravedad',
    verifyNow: {
      vitalKeys: ['spo2', 'hr', 'glucose', 'temp'],
      quickCheckSummary:
        'Inicia el cronómetro de episodio de inmediato, verifica si respira y descarta golpe craneal o hipoglucemia (<65 mg/dL).',
      zones: [
        {
          zoneId: 'head',
          label: 'Cráneo y Pupilas',
          checkInstruction:
            'Revisa si hubo impacto contra paneles o estructuras rígidas y observa si desvía la mirada.',
          criticalSign: 'Herida sangrante, pupilas desiguales o falta de respuesta tras ceder el temblor.',
        },
        {
          zoneId: 'airway_neck',
          label: 'Boca y Vía Aérea',
          checkInstruction:
            'Comprueba que el pecho sube y baja. No abras la boca por la fuerza mientras haya rigidez.',
          criticalSign: 'Labios azulados, gorgoteo por saliva/sangre o SpO₂ < 92%.',
        },
        {
          zoneId: 'limbs_joints',
          label: 'Brazos y Piernas',
          checkInstruction:
            'Acompaña suavemente extremidades lejos de consolas; en 0g protege articulaciones con historial previo.',
          criticalSign: 'Movimientos rítmicos que superan 5 minutos continuos.',
        },
      ],
    },
    actionSteps: {
      zeroGSteps: [
        'Activa el cronómetro de episodio para medir la duración exacta de la crisis desde el primer segundo.',
        'Sujeta suavemente el torso con una cincha elástica o brazo flotante en el centro del módulo, lejos de esquinas, interruptores y pasamanos.',
        'Coloca almohadillas o bolsas blandas alrededor del casco o cabeza flotante; guía su cuerpo sin inmovilizar a la fuerza brazos o piernas.',
      ],
      partialGravitySteps: [
        'Activa el cronómetro de episodio y acuesta al tripulante de lado (posición lateral de seguridad) sobre superficie acolchada.',
        'Despeja herramientas, cascos o cables alrededor de la cabeza y desliza un soporte blando bajo el cráneo.',
        'Afloja el cuello del traje o vestimenta y mantén la cabeza ligeramente inclinada para que drene la saliva.',
      ],
      commonSteps: [
        'Cuando cesen los movimientos, inclina suavemente la cabeza hacia un lado para mantener libre la garganta y limpia secreciones visibles.',
        'Coloca el oxímetro de pulso y toma una muestra rápida de glucosa capilar (mg/dL) para descartar convulsión por azúcar baja.',
        'Administra oxígeno suplementario si la SpO₂ baja de 94% y registra el estado de conciencia al despertar.',
      ],
    },
    contraindications: [
      'NUNCA introduzcas dedos, pañuelos ni objetos rígidos entre los dientes del tripulante.',
      'NUNCA sujetes con fuerza los brazos ni presiones el pecho contra el suelo o mamparo para detener el temblor.',
      'NO des líquidos, pastillas ni gel de glucosa por boca hasta que esté completamente despierto y trague con seguridad.',
    ],
    earthEscalation: [
      'Transmitir paquete crítico de inmediato si la convulsión dura más de 5 minutos (riesgo de estatus epiléptico).',
      'Escalar si ocurren 2 o más crisis seguidas sin recuperar la conciencia entre ellas.',
      'Escalar si es el primer episodio convulsivo registrado o si existe golpe craneal visible.',
    ],
  },
  {
    id: 'syncope',
    code: 'PRO-02 · ORTO',
    title: 'Síncope / Desmayo Súbito',
    shortTitle: 'Síncope / Desmayo',
    subtitle: 'Revisión rápida de presión arterial, pulso y glucosa por intolerancia ortostática o EVA.',
    urgency: 'warning',
    relatedSystems: ['cardiovascular', 'metabolic'],
    nasaReference: 'NASA HRP · Risk of Orthostatic Intolerance During Re-exposure to Gravity',
    verifyNow: {
      vitalKeys: ['bp', 'hr', 'glucose', 'spo2'],
      quickCheckSummary:
        'Mide presión arterial (mmHg), pulso y glucosa en sangre (mg/dL) al instante: distingue un bajón ortostático de un shock hipoglucémico.',
      zones: [
        {
          zoneId: 'head',
          label: 'Conciencia y Respuesta',
          checkInstruction:
            'Habla fuerte al tripulante y toca sus hombros para comprobar si abre los ojos o responde órdenes.',
          criticalSign: 'No despierta en menos de 60 segundos o presenta confusión severa al abrir los ojos.',
        },
        {
          zoneId: 'chest_heart',
          label: 'Pulso y Presión Arterial',
          checkInstruction:
            'Verifica presión sistólica (<90 mmHg indica caída crítica) y ritmo del pulso en muñeca o cuello.',
          criticalSign: 'Presión menor a 90/60 mmHg persistente o pulso irregular / mayor a 120 bpm.',
        },
        {
          zoneId: 'limbs_joints',
          label: 'Piernas y Retorno Venoso',
          checkInstruction:
            'Revisa palidez, sudor frío en piel y eleva las piernas si hay gravedad presente.',
          criticalSign: 'Piel muy fría y sudorosa acompañada de glucosa menor a 65 mg/dL.',
        },
      ],
    },
    actionSteps: {
      zeroGSteps: [
        'Asegura al astronauta en posición horizontal flotante con las rodillas ligeramente flexionadas hacia el torso para favorecer el flujo hacia la cabeza.',
        'Afloja arneses o cierres alrededor del cuello y tórax; ventila la cara si hay sudoración fría.',
      ],
      partialGravitySteps: [
        'Recuesta al tripulante boca arriba de inmediato y eleva ambas piernas unos 30 cm por encima del nivel del corazón.',
        'Retira casco o abre el cuello del traje en zona presurizada para mejorar la entrada de aire fresco.',
      ],
      commonSteps: [
        'Mide glucosa capilar (mg/dL), presión arterial y SpO₂% en los primeros 90 segundos.',
        'Si está despierto y la glucosa es <70 mg/dL, administra 15 g de carbohidratos rápidos (gel o jugo en bolsa) y repite medición a los 15 minutos.',
        'Si la glucosa es normal, ofrece 300-500 ml de solución con electrolitos en sorbos lentos y mantén reposo mínimo de 20 minutos.',
      ],
    },
    contraindications: [
      'NO intentes sentar o poner de pie al tripulante antes de estabilizar la presión arterial y desaparecer el mareo.',
      'NO administres bebidas ni geles si el tripulante sigue inconsciente o somnoliento (riesgo de asfixia).',
      'NO autorices retorno a caminata espacial (EVA) ni conducción de Rover tras un episodio sincopal.',
    ],
    earthEscalation: [
      'Transmitir paquete crítico si la presión sistólica sigue debajo de 90 mmHg tras 10 minutos de reposo e hidratación.',
      'Escalar de inmediato si el desmayo ocurrió acompañado de dolor en el pecho, palpitaciones fuertes o falta de aire.',
      'Escalar si no recupera lucidez completa dentro de los primeros 2 minutos.',
    ],
  },
  {
    id: 'cardiovascular_cpr',
    code: 'PRO-03 · RCP-0G',
    title: 'Evento Cardiovascular / RCP Espacial',
    shortTitle: 'RCP Espacial',
    subtitle: 'Reanimación cardiopulmonar adaptada a gravedad alterada (Evetts-Russomano / Handstand) y DEA.',
    urgency: 'critical',
    relatedSystems: ['cardiovascular', 'brain'],
    nasaReference: 'NASA ExMC & ESA Microgravity Resuscitation Guidelines (Evetts-Russomano & Handstand)',
    verifyNow: {
      vitalKeys: ['hr', 'bp', 'spo2'],
      quickCheckSummary:
        'Comprueba conciencia y respiración durante máximo 10 segundos. Si no responde ni respira con normalidad, inicia RCP espacial al instante.',
      zones: [
        {
          zoneId: 'head',
          label: 'Respuesta Neurológica',
          checkInstruction:
            'Sacude suavemente los hombros y pregunta en voz alta: "¿Me escuchas?". Verifica si hay respiración normal.',
          criticalSign: 'Ausencia total de respuesta y jadeo agónico o falta de respiración.',
        },
        {
          zoneId: 'chest_heart',
          label: 'Centro del Esternón y DEA',
          checkInstruction:
            'Ubica el centro del pecho entre los pezones para compresiones firmes y coloca los parches del desfibrilador (DEA).',
          criticalSign: 'Ausencia de pulso central o ritmo desfibrilable detectado por el DEA.',
        },
        {
          zoneId: 'airway_neck',
          label: 'Vía Aérea y Oxígeno',
          checkInstruction:
            'Comprueba pulso carotídeo máximo 10 s y conecta bolsa-válvula-mascarilla con O₂ si hay 2 reanimadores.',
          criticalSign: 'SpO₂ indetectable o caída rápida por debajo de 88%.',
        },
      ],
    },
    actionSteps: {
      zeroGSteps: [
        'TÉCNICA EVETTS-RUSSOMANO (1 reanimador): Coloca al paciente flotando sobre tus piernas cruzadas; rodea su torso enganchando tus pies alrededor de su espalda/hombros para generar contrapresión sin salir empujado.',
        'MÉTODO HANDSTAND (si hay techo bajo): Apoya los pies contra la pared superior del módulo sobre el pecho del paciente anclado al piso, usando tus piernas extendidas para comprimir el esternón en línea recta.',
        'Mantén ritmo continuo de 100 a 120 compresiones por minuto (5 a 6 cm de profundidad) iniciando el cronómetro de ciclos de 2 minutos.',
      ],
      partialGravitySteps: [
        'Ancla al paciente sobre una camilla rígida o suelo firme de la base y fija tus rodillas o cinturón para estabilizar el peso corporal en gravedad parcial.',
        'Realiza compresiones torácicas fuertes y rápidas en el centro del pecho (100-120/min) permitiendo que el tórax vuelva a expandirse por completo.',
        'Asegura la bolsa de oxígeno y prepara la camilla por si se requiere traslado a módulo médico.',
      ],
      commonSteps: [
        'Enciende el Desfibrilador Externo Automático (DEA) en cuanto llegue, seca el pecho si hay sudor y coloca los parches según el diagrama.',
        'Detén las compresiones solo mientras el DEA analiza el ritmo o indica aplicar una descarga ("¡Nadie toque al paciente!").',
        'Releva al reanimador que comprime cada 2 minutos (usando el cronómetro) para evitar fatiga en traje o cabina.',
      ],
    },
    contraindications: [
      'NUNCA intentes comprimir el pecho en 0g sin anclaje (Evetts-Russomano, Handstand o cinchas): el impulso te lanzará lejos del paciente.',
      'NO toques el cuerpo del astronauta ni estructuras metálicas conductoras cuando el DEA ordene descarga.',
      'NO interrumpas las compresiones más de 10 segundos al revisar pulso o cambiar de reanimador.',
    ],
    earthEscalation: [
      'ALERTA MÁXIMA INMEDIATA: Transmitir paquete crítico en el segundo 0 con registro de hora de inicio del paro y ciclos de DEA.',
      'Solicitar enlace prioritario con el cirujano de vuelo para autorización de medicación avanzada si el pulso no retorna tras 2 ciclos.',
    ],
  },
  {
    id: 'hypoxia',
    code: 'PRO-04 · ATMÓSFERA',
    title: 'Hipoxia / Atmósfera Hostil',
    shortTitle: 'Hipoxia / Aire',
    subtitle: 'Suministro de O₂ de emergencia, control de CO₂ y sellado de trajes o escotillas.',
    urgency: 'critical',
    relatedSystems: ['cardiovascular', 'brain'],
    nasaReference: 'NASA HRP · Hostile Closed Environments & ISS Atmospheric Emergency Checklist',
    verifyNow: {
      vitalKeys: ['spo2', 'hr', 'bp'],
      quickCheckSummary:
        'Valida SpO₂% de inmediato (<92% es emergencia), revisa presión parcial de O₂ / CO₂ en cabina y busca fugas o humo.',
      zones: [
        {
          zoneId: 'airway_neck',
          label: 'Respiración y Vía Aérea',
          checkInstruction:
            'Observa esfuerzo al inhalar, tos seca por polvo/regolito o irritación de garganta.',
          criticalSign: 'SpO₂ menor a 90%, labios azulados o incapacidad para completar frases.',
        },
        {
          zoneId: 'head',
          label: 'Estado Mental por Hipoxia',
          checkInstruction:
            'Evalúa desorientación, visión en túnel, mareo súbito o euforia inusual por falta de oxígeno.',
          criticalSign: 'Somnolencia aguda, confusión o pérdida de coordinación.',
        },
        {
          zoneId: 'chest_heart',
          label: 'Frecuencia Cardíaca y Tórax',
          checkInstruction:
            'Revisa si ambos lados del pecho se expanden por igual y vigila pulso acelerado (>115 bpm).',
          criticalSign: 'Respiración superficial muy rápida o dolor agudo al inhalar.',
        },
      ],
    },
    actionSteps: {
      zeroGSteps: [
        'Coloca mascarilla de oxígeno de emergencia al 100% sobre el astronauta afectado y fija su posición junto al panel de soporte vital.',
        'Verifica el flujo de aire en cabina (en 0g el CO₂ se acumula en bolsas estancadas si fallan los ventiladores).',
      ],
      partialGravitySteps: [
        'Si el episodio ocurrió tras volver de EVA, retira el casco con seguridad en esclusa presurizada y suministra O₂ al 100% sentado.',
        'Mantén al afectado lejos de esclusas polvorientas para evitar inhalación adicional de regolito abrasivo.',
      ],
      commonSteps: [
        'Cambia los cartuchos depuradores de CO₂ o activa el purificador auxiliar del módulo si el sensor marca exceso de dióxido de carbono.',
        'Comprueba que todos los sellos de traje, válvulas de suministro y escotillas del módulo estén herméticos.',
        'Monitorea SpO₂% y frecuencia cardíaca cada 2 minutos hasta superar sostenidamente el 95%.',
      ],
    },
    contraindications: [
      'NO permitas que el tripulante con hipoxia camine solo ni opere controles críticos de la nave o Rover.',
      'NO retires el oxígeno suplementario de golpe hasta confirmar lectura estable de SpO₂ >= 95% durante 10 minutos.',
      'NO ignores una caída lenta de SpO₂ acompañada de dolor de cabeza: puede indicar intoxicación silenciosa por CO₂.',
    ],
    earthEscalation: [
      'Transmitir paquete crítico si la SpO₂ no sube por encima de 92% tras 5 minutos con oxígeno al 100%.',
      'Escalar si existen múltiples tripulantes con dolor de cabeza o falta de aire (fallo sistémico de atmósfera cerrada).',
    ],
  },
  {
    id: 'metabolic_thermal_shock',
    code: 'PRO-05 · METAB/TERM',
    title: 'Shock Hipoglucémico o Térmico',
    shortTitle: 'Shock Glucosa/Térmico',
    subtitle: 'Intervención veloz ante valores críticos de glucosa (mg/dL) o temperatura corporal.',
    urgency: 'warning',
    relatedSystems: ['metabolic', 'cardiovascular'],
    nasaReference: 'NASA HRP · Metabolic Dysregulation & Thermal Loop Failure Countermeasures',
    verifyNow: {
      vitalKeys: ['glucose', 'temp', 'bp', 'hr'],
      quickCheckSummary:
        'Comprueba glucosa (<65 mg/dL crítico) y temperatura (<35.2 °C hipotermia o >=38.5 °C golpe de calor/fiebre).',
      zones: [
        {
          zoneId: 'head',
          label: 'Alerta Mental y Sudoración',
          checkInstruction:
            'Busca confusión, habla arrastrada, visión borrosa o sudor frío en la frente.',
          criticalSign: 'Glucosa <60 mg/dL con somnolencia o incapacidad para tragar.',
        },
        {
          zoneId: 'abdomen_fast',
          label: 'Tolerancia Oral y Control Térmico',
          checkInstruction:
            'Verifica si tiene náuseas antes de dar líquidos y revisa temperatura del núcleo corporal.',
          criticalSign: 'Vómitos persistentes o temperatura >=38.5 °C / <=35.2 °C.',
        },
        {
          zoneId: 'chest_heart',
          label: 'Pulso y Presión de Shock',
          checkInstruction:
            'Evalúa taquicardia compensatoria (>110 bpm) o caída de presión sistólica (<90 mmHg).',
          criticalSign: 'Presión arterial baja combinada con taquicardia rápida.',
        },
      ],
    },
    actionSteps: {
      zeroGSteps: [
        'Usa bolsas selladas con boquilla para administrar carbohidratos líquidos en microgravedad sin generar gotas flotantes.',
        'Si hay hipertermia por fallo del traje LCVG (refrigeración líquida), abre el torso del traje y aplica paños fríos en cuello, axilas e ingles.',
      ],
      partialGravitySteps: [
        'Si el tripulante está consciente en superficie, siéntalo en sombra o zona térmica controlada antes de hidratar.',
        'Retira capas aislantes del traje EVA si presenta calor extremo, o cubre con manta térmica reflectante si la temperatura es <35.5 °C.',
      ],
      commonSteps: [
        'HIPOGLUCEMIA (<65 mg/dL) consciente: administra 15 a 20 g de glucosa rápida (gel oral o tableta masticable) y vuelve a medir en 15 minutos.',
        'HIPOTERMIA (<35.5 °C): recalentamiento progresivo del torso con mantas térmicas y bebidas tibias si está despierto.',
        'HIPERTERMIA (>=38.3 °C): enfriamiento activo en cuello/axilas e hidratación fría con electrolitos; repite signos vitales cada 10 minutos.',
      ],
    },
    contraindications: [
      'NO des geles, agua ni alimentos por boca si el tripulante está inconsciente o convulsionando (usa vía intravenosa/glucagón si el equipo médico lo autoriza).',
      'NO apliques calor directo abrasivo ni frotes extremidades congeladas en hipotermia.',
      'NO administres medicamentos para bajar fiebre si existe alergia registrada en el expediente clínico.',
    ],
    earthEscalation: [
      'Transmitir paquete crítico si la glucosa permanece debajo de 65 mg/dL tras dos dosis de carbohidratos rápidos.',
      'Escalar de inmediato si el paciente pierde el conocimiento o la temperatura supera 39.0 °C / cae debajo de 35.0 °C.',
    ],
  },
  {
    id: 'internal_trauma_fast',
    code: 'PRO-06 · FAST-US',
    title: 'Trauma Interno / Escaneo Ultrasonido FAST',
    shortTitle: 'Trauma / Eco FAST',
    subtitle: 'Guía visual paso a paso de ultrasonido abdominal y torácico para descartar hemorragia.',
    urgency: 'critical',
    relatedSystems: ['abdomen_fast' as unknown as BodySystemId, 'cardiovascular', 'musculoskeletal'].filter(
      (s): s is BodySystemId => s === 'cardiovascular' || s === 'musculoskeletal'
    ),
    nasaReference: 'NASA HRP · Advanced Diagnostic Ultrasound in Microgravity (ADUM) — Protocolo FAST',
    verifyNow: {
      vitalKeys: ['bp', 'hr', 'spo2'],
      quickCheckSummary:
        'Ante golpe fuerte en cabina o EVA, vigila caída de presión + pulso acelerado y captura las 4 ventanas de ultrasonido FAST.',
      zones: [
        {
          zoneId: 'chest_heart',
          label: 'Ventana 1 · Pericardio y Tórax',
          checkInstruction:
            'Coloca la sonda justo debajo de la punta del esternón apuntando hacia el hombro izquierdo para ver el corazón.',
          criticalSign: 'Franja oscura (líquido) rodeando el corazón o ausencia de deslizamiento pulmonar.',
        },
        {
          zoneId: 'abdomen_fast',
          label: 'Ventanas 2, 3 y 4 · Abdomen y Pelvis',
          checkInstruction:
            'Escanea costado derecho (hígado/riñón), costado izquierdo (bazo/riñón) y bajo vientre sobre el pubis.',
          criticalSign: 'Zonas negras anecoicas (sangre o líquido libre) entre órganos o abdomen rígido y doloroso.',
        },
        {
          zoneId: 'limbs_joints',
          label: 'Estabilidad y Dolor Localizado',
          checkInstruction:
            'Revisa hematomas crecientes o deformidad en pelvis/extremidades y evita movilización innecesaria.',
          criticalSign: 'Dolor intenso progresivo acompañado de presión sistólica < 95 mmHg.',
        },
      ],
    },
    actionSteps: {
      zeroGSteps: [
        'Ancla con correas al tripulante herido y al operador del escáner antes de aplicar gel ecográfico para que la sonda mantenga contacto firme.',
        'En 0g recuerda que el líquido libre puede distribuirse de forma atípica: captura barridos lentos de 5 segundos en cada ventana.',
      ],
      partialGravitySteps: [
        'Mantén al tripulante recostado boca arriba e inmóvil en superficie firme; en gravedad parcial el líquido tiende a acumularse en zonas bajas.',
        'Aplica abundante gel conductor sobre cada ventana antes de apoyar la sonda sin presionar en exceso áreas dolorosas.',
      ],
      commonSteps: [
        'VENTANA 1 (Subxifoidea / Corazón): apoya la sonda bajo el esternón mirando hacia arriba; guarda captura.',
        'VENTANA 2 (Cuadrante Superior Derecho — Morrison): coloca la sonda en el costado derecho bajo las costillas mirando hacia la espalda.',
        'VENTANA 3 (Cuadrante Superior Izquierdo — Esplenorrenal): coloca la sonda en el costado izquierdo algo más arriba y atrás.',
        'VENTANA 4 (Suprapúbica): apoya la sonda justo encima del hueso púbico y adjunta la imagen al paquete de Tierra.',
      ],
    },
    contraindications: [
      'NO presiones con fuerza el abdomen si está duro, muy doloroso o distendido.',
      'NO des analgésicos, comida ni abundante agua hasta descartar hemorragia interna o lesión abdominal.',
      'NO movilices al paciente si existe sospecha de trauma en columna o pelvis sin inmovilización completa.',
    ],
    earthEscalation: [
      'Transmitir paquete crítico CON IMAGEN DE ULTRASONIDO ADJUNTA si detectas áreas oscuras libres o dolor abdominal en aumento.',
      'Escalar en código rojo si la presión sistólica cae de 95 mmHg mientras el pulso supera 110 bpm (signo temprano de hemorragia interna).',
    ],
  },
];

export const QUICK_SYMPTOM_TAGS: QuickSymptomTag[] = [
  {
    id: 'tag-faint-sweat',
    label: 'Se desmayó y tiene sudor frío',
    queryText: 'se desmayó y tiene sudor frío con mareo',
  },
  {
    id: 'tag-eva-breath',
    label: 'No respira bien tras caminata espacial',
    queryText: 'no respira bien tras caminata espacial y tiene falta de aire',
  },
  {
    id: 'tag-seizure-0g',
    label: 'Convulsión / sacudidas en microgravedad',
    queryText: 'tiene convulsión y sacudidas involuntarias en microgravedad',
  },
  {
    id: 'tag-chest-pain',
    label: 'Dolor de pecho y pulso muy rápido o ausente',
    queryText: 'dolor opresivo en el pecho sin respuesta o pulso inestable rcp',
  },
  {
    id: 'tag-glucose-temp',
    label: 'Temblor, confusión o golpe de calor/frío',
    queryText: 'temblor intenso confusión glucosa baja o temperatura extrema',
  },
  {
    id: 'tag-trauma-fast',
    label: 'Golpe fuerte en abdomen / trauma interno',
    queryText: 'golpe fuerte en abdomen trauma interno dolor abdominal ultrasonido fast',
  },
];

export const SIMULATED_CAPTURES: SimulatedCapturePreset[] = [
  {
    id: 'sim-fast-morrison',
    label: 'Eco FAST · Ventana Hepatorrenal',
    modality: 'Ultrasonido FAST',
    caption: 'Captura simulada ADUM — Cuadrante Superior Derecho (Morrison)',
    findingSummary: 'Sin colección líquida libre evidente en espacio de Morrison; monitoreo preventivo sugerido.',
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220">
          <rect width="360" height="220" fill="#1A241E"/>
          <path d="M180 22 L328 192 C230 212 130 212 32 192 Z" fill="#23332A" stroke="#2F5D46" stroke-width="2"/>
          <ellipse cx="165" cy="112" rx="68" ry="34" fill="#2F5D46" fill-opacity="0.45" stroke="#4A7C64" stroke-width="1.5"/>
          <ellipse cx="212" cy="136" rx="34" ry="20" fill="#1A241E" stroke="#D8D3C8" stroke-dasharray="4 3" stroke-width="1.5"/>
          <line x1="180" y1="22" x2="180" y2="202" stroke="#4A7C64" stroke-opacity="0.4" stroke-dasharray="3 4"/>
          <text x="16" y="24" fill="#F7F5F0" font-family="monospace" font-size="11" font-weight="bold">ADUM FAST · VENTANA 2 (MORRISON)</text>
          <text x="16" y="40" fill="#DFECE4" font-family="monospace" font-size="10">3.5 MHz · SIMULADO</text>
          <rect x="14" y="186" width="234" height="22" rx="4" fill="#1A241E" fill-opacity="0.85" stroke="#2F5D46"/>
          <text x="22" y="201" fill="#F7F5F0" font-family="monospace" font-size="9">[SI / TELEMETRÍA SIMULADA — DEEPTRAU]</text>
        </svg>`
      ),
  },
  {
    id: 'sim-optical-airway',
    label: 'Cámara Cabina · Control Pupilar / O₂',
    modality: 'Cámara Óptica',
    caption: 'Captura óptica de evaluación neurológica y mascarilla de oxígeno',
    findingSummary: 'Pupilas simétricas reactivas a la luz; verificación visual de sellado facial en cabina.',
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220">
          <rect width="360" height="220" fill="#1A241E"/>
          <circle cx="122" cy="108" r="36" fill="#2B5B6C" fill-opacity="0.35" stroke="#DCE9EE" stroke-width="1.5"/>
          <circle cx="122" cy="108" r="14" fill="#0F1713" stroke="#F7F5F0" stroke-width="1.5"/>
          <circle cx="238" cy="108" r="36" fill="#2B5B6C" fill-opacity="0.35" stroke="#DCE9EE" stroke-width="1.5"/>
          <circle cx="238" cy="108" r="14" fill="#0F1713" stroke="#F7F5F0" stroke-width="1.5"/>
          <path d="M96 48 L96 36 L108 36 M264 48 L264 36 L252 36 M96 168 L96 180 L108 180 M264 168 L264 180 L252 180" fill="none" stroke="#4A7C64" stroke-width="2"/>
          <text x="16" y="24" fill="#F7F5F0" font-family="monospace" font-size="11" font-weight="bold">CÁMARA MÉDICA · REFLEJO PUPILAR 3.2 mm</text>
          <rect x="14" y="186" width="234" height="22" rx="4" fill="#1A241E" fill-opacity="0.85" stroke="#2F5D46"/>
          <text x="22" y="201" fill="#F7F5F0" font-family="monospace" font-size="9">[SI / TELEMETRÍA SIMULADA — DEEPTRAU]</text>
        </svg>`
      ),
  },
];

export function buildDynamicContraindications(
  protocol: EmergencyProtocol,
  astronaut: AstronautProfile
): { baseRules: string[]; ehrRules: string[] } {
  const ehrRules: string[] = [];
  const allergies = astronaut.clinicalHistory.allergies.filter(
    (a) => !a.toLowerCase().includes('ninguna')
  );
  if (allergies.length > 0) {
    ehrRules.push(
      `ALERGIA REGISTRADA (${allergies.join(', ')}): Evita fármacos, guantes o parches que contengan este alérgeno antes de administrar cualquier soporte.`
    );
  }

  const surgeries = astronaut.clinicalHistory.priorSurgeries.filter(
    (s) => !s.toLowerCase().includes('sin cirug')
  );
  if (surgeries.length > 0) {
    ehrRules.push(
      `ANTECEDENTE QUIRÚRGICO (${surgeries[0]}): No fuerces torsiones ni compresiones bruscas sobre la articulación operada durante la contención o traslado.`
    );
  }

  if (astronaut.clinicalHistory.immuneStatus !== 'Normal') {
    ehrRules.push(
      `DEFENSAS BAJAS (Leucopenia/Reactivación viral): Usa mascarilla estéril y desinfecta manos antes de manipular vía aérea o mucosas.`
    );
  }

  ehrRules.push(
    `TIPO DE SANGRE ${astronaut.bloodType}: Verifica compatibilidad en reserva de cabina antes de reposición sanguínea o paquete de emergencia.`
  );

  return {
    baseRules: protocol.contraindications,
    ehrRules,
  };
}

export function evaluateSymptomTriage(
  rawQuery: string,
  vitals: TriageVitalSnapshot,
  astronaut: AstronautProfile,
  mission: MissionType
): TriageRecommendation {
  const query = rawQuery.toLowerCase().trim();
  const matchedSignals: string[] = [];

  if (vitals.glucoseMgDl < 65) {
    matchedSignals.push(`Glucosa crítica: ${vitals.glucoseMgDl} mg/dL`);
  }
  if (vitals.systolicBP <= 90 || vitals.diastolicBP <= 55) {
    matchedSignals.push(`Hipotensión: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`);
  }
  if (vitals.spo2Percent < 92) {
    matchedSignals.push(`Oxígeno bajo: ${vitals.spo2Percent}% SpO₂`);
  }
  if (vitals.heartRateBpm >= 115 || vitals.heartRateBpm <= 45) {
    matchedSignals.push(`Pulso alterado: ${vitals.heartRateBpm} bpm`);
  }
  if (vitals.bodyTempC >= 38.5 || vitals.bodyTempC <= 35.2) {
    matchedSignals.push(`Temperatura crítica: ${vitals.bodyTempC.toFixed(1)} °C`);
  }

  const hasAllergy = astronaut.clinicalHistory.allergies.some(
    (a) => !a.toLowerCase().includes('ninguna')
  );
  const ehrAlert = hasAllergy
    ? `Precaución EHR: Alergia a ${astronaut.clinicalHistory.allergies.join(', ')} · Sangre ${astronaut.bloodType}.`
    : `Expediente EHR: Sangre ${astronaut.bloodType} · ${astronaut.clinicalHistory.priorSurgeries[0] ?? 'Sin cirugías'}.`;

  // 1. Seizure / neurological match
  if (
    query.includes('convul') ||
    query.includes('epilep') ||
    query.includes('sacud') ||
    query.includes('temblor involunt') ||
    query.includes('espasm')
  ) {
    return {
      possibleCause:
        'Crisis convulsiva aguda en cabina (posible origen neurológico, hipoxia o descenso brusco de glucosa).',
      urgency: 'critical',
      recommendedProtocolId: 'seizure',
      immediateAction:
        'Inicia el cronómetro de episodio, protege la cabeza contra impactos en ' +
        mission.gravityLabel +
        ' y NO sujetes brazos ni piernas a la fuerza.',
      ehrAlert,
      matchedSignals:
        matchedSignals.length > 0 ? matchedSignals : ['Evento neurológico agudo reportado'],
    };
  }

  // 2. Cardiac arrest / severe chest pain / CPR
  if (
    query.includes('rcp') ||
    query.includes('paro') ||
    query.includes('no tiene pulso') ||
    query.includes('sin pulso') ||
    query.includes('pecho') ||
    query.includes('corazón') ||
    query.includes('corazon') ||
    query.includes('desfibril')
  ) {
    return {
      possibleCause:
        'Compromiso cardiovascular agudo o sospecha de paro cardiorrespiratorio que exige soporte vital inmediato.',
      urgency: 'critical',
      recommendedProtocolId: 'cardiovascular_cpr',
      immediateAction:
        mission.gravityG === 0
          ? 'Prepara técnica Evetts-Russomano o Handstand en 0g, enciende el DEA y transmite paquete crítico a Tierra.'
          : 'Asegura superficie firme, inicia compresiones torácicas (100-120/min) y conecta el DEA.',
      ehrAlert,
      matchedSignals:
        matchedSignals.length > 0 ? matchedSignals : ['Sospecha de evento cardiovascular mayor'],
    };
  }

  // 3. Hypoxia / EVA breathing difficulty
  if (
    query.includes('respir') ||
    query.includes('ahog') ||
    query.includes('aire') ||
    query.includes('oxíg') ||
    query.includes('oxig') ||
    query.includes('co2') ||
    query.includes('caminata') ||
    query.includes('eva') ||
    query.includes('traje') ||
    vitals.spo2Percent < 92
  ) {
    return {
      possibleCause:
        vitals.spo2Percent < 92
          ? `Hipoxia confirmada (${vitals.spo2Percent}% SpO₂) por posible fallo de O₂, exceso de CO₂ o irritación post-EVA.`
          : 'Dificultad respiratoria aguda compatible con hipoxia, acumulación de CO₂ o inhalación de polvo de regolito tras EVA.',
      urgency: 'critical',
      recommendedProtocolId: 'hypoxia',
      immediateAction:
        'Suministra oxígeno de emergencia al 100% de inmediato, revisa sellado de escotillas/traje y depuradores de CO₂.',
      ehrAlert,
      matchedSignals:
        matchedSignals.length > 0 ? matchedSignals : [`SpO₂ actual: ${vitals.spo2Percent}%`],
    };
  }

  // 4. Internal trauma / FAST ultrasound
  if (
    query.includes('golpe') ||
    query.includes('trauma') ||
    query.includes('abdomen') ||
    query.includes('sangr') ||
    query.includes('hemorrag') ||
    query.includes('ultrasonido') ||
    query.includes('fast') ||
    query.includes('impacto')
  ) {
    return {
      possibleCause:
        'Sospecha de trauma cerrado torácico o abdominal con posible riesgo de sangrado interno oculto.',
      urgency: 'critical',
      recommendedProtocolId: 'internal_trauma_fast',
      immediateAction:
        'Mantén al astronauta inmóvil, realiza las 4 ventanas de escaneo Ultrasonido FAST y adjunta la captura para Tierra.',
      ehrAlert,
      matchedSignals:
        matchedSignals.length > 0 ? matchedSignals : ['Mecanismo de trauma / impacto reportado'],
    };
  }

  // 5. Syncope / fainting / cold sweat / orthostatic hypotension
  if (
    query.includes('desmay') ||
    query.includes('síncop') ||
    query.includes('sincop') ||
    query.includes('mareo') ||
    query.includes('sudor') ||
    query.includes('desvane') ||
    (vitals.systolicBP <= 90 && vitals.glucoseMgDl < 65)
  ) {
    const isCritical = vitals.systolicBP <= 90 || vitals.glucoseMgDl < 65;
    return {
      possibleCause:
        vitals.glucoseMgDl < 65 || vitals.systolicBP <= 90
          ? `Síncope asociado a hipotensión (${vitals.systolicBP}/${vitals.diastolicBP} mmHg) y/o hipoglucemia (${vitals.glucoseMgDl} mg/dL).`
          : 'Síncope vasovagal o intolerancia ortostática por redistribución de fluidos y deshidratación en misión.',
      urgency: isCritical ? 'critical' : 'warning',
      recommendedProtocolId: 'syncope',
      immediateAction:
        'Recuesta al tripulante, mide presión arterial y glucosa en mg/dL al instante, y corrige hipoglucemia si está consciente.',
      ehrAlert,
      matchedSignals:
        matchedSignals.length > 0
          ? matchedSignals
          : [`PA: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg · Glucosa: ${vitals.glucoseMgDl} mg/dL`],
    };
  }

  // 6. Metabolic / thermal shock
  if (
    query.includes('gluc') ||
    query.includes('azúcar') ||
    query.includes('azucar') ||
    query.includes('temblor') ||
    query.includes('calor') ||
    query.includes('frío') ||
    query.includes('frio') ||
    query.includes('fiebre') ||
    query.includes('hipoterm') ||
    query.includes('confusi') ||
    vitals.glucoseMgDl < 70 ||
    vitals.bodyTempC >= 38.0 ||
    vitals.bodyTempC <= 35.5
  ) {
    const isCritical =
      vitals.glucoseMgDl < 65 || vitals.bodyTempC >= 38.5 || vitals.bodyTempC <= 35.2;
    return {
      possibleCause:
        vitals.glucoseMgDl < 70
          ? `Descompensación metabólica por hipoglucemia (${vitals.glucoseMgDl} mg/dL vs base ${astronaut.clinicalHistory.baselineGlucose} mg/dL).`
          : 'Estrés térmico o alteración metabólica aguda en cabina/traje presurizado.',
      urgency: isCritical ? 'critical' : 'warning',
      recommendedProtocolId: 'metabolic_thermal_shock',
      immediateAction:
        'Valida glucosa capilar y temperatura corporal; administra 15 g de glucosa si está consciente o activa control térmico.',
      ehrAlert,
      matchedSignals:
        matchedSignals.length > 0
          ? matchedSignals
          : [`Glucosa: ${vitals.glucoseMgDl} mg/dL · Temp: ${vitals.bodyTempC.toFixed(1)} °C`],
    };
  }

  // Default fallback based on live vital signs
  if (vitals.systolicBP <= 90 || vitals.glucoseMgDl < 65) {
    return {
      possibleCause: `Descompensación aguda detectada en telemetría (PA ${vitals.systolicBP}/${vitals.diastolicBP} mmHg, Glucosa ${vitals.glucoseMgDl} mg/dL).`,
      urgency: 'critical',
      recommendedProtocolId: 'syncope',
      immediateAction:
        'Estabiliza al astronauta en posición horizontal y sigue el protocolo de Síncope / Shock Hipoglucémico.',
      ehrAlert,
      matchedSignals,
    };
  }

  return {
    possibleCause:
      'Síntomas inespecíficos en revisión: se recomienda verificación estructurada de signos vitales y protocolo de síncope/control metabólico.',
    urgency: 'warning',
    recommendedProtocolId: 'syncope',
    immediateAction:
      'Describe un síntoma más específico o pulsa una etiqueta rápida para afinar la recomendación.',
    ehrAlert,
    matchedSignals: [
      `PA ${vitals.systolicBP}/${vitals.diastolicBP} mmHg · SpO₂ ${vitals.spo2Percent}% · Glucosa ${vitals.glucoseMgDl} mg/dL`,
    ],
  };
}
