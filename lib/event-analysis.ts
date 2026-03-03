import { ExperimentMode, SimulationStats } from './simulator';

export interface EventAnalysis {
  eventName: string;
  mode: ExperimentMode;
  
  // Event Definition
  eventDefinition: string;
  variablesDescription: string;
  
  // Generación de Datos
  theoreticalProbability: number;
  absoluteFrequency: number;
  
  // Validación y Precisión
  relativeFrequency: number;
  confidenceInterval: {
    lower: number;
    upper: number;
    confidenceLevel: number; // 95%
  };
  deviation: number;
  deviationPercentage: number;
  
  // Interpretación
  interpretation: string;
  convergenceStatus: 'convergiendo' | 'convergido' | 'sin-convergencia';
}

// Calcula el intervalo de confianza (95%) usando la aproximación normal
function calculateConfidenceInterval(
  relativeFrequency: number,
  sampleSize: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number } {
  // Z-score para 95% de confianza
  const zScore = confidenceLevel === 0.95 ? 1.96 : 1.645;
  const marginOfError = zScore * Math.sqrt((relativeFrequency * (1 - relativeFrequency)) / sampleSize);
  
  return {
    lower: Math.max(0, relativeFrequency - marginOfError),
    upper: Math.min(1, relativeFrequency + marginOfError),
  };
}

// Genera la descripción del evento basada en el modo y el resultado
function getEventDefinition(mode: ExperimentMode, eventName: string): {
  definition: string;
  variables: string;
} {
  const definitions: Record<ExperimentMode, Record<string, { definition: string; variables: string }>> = {
    coin: {
      'Cara': {
        definition: 'El resultado del lanzamiento de una moneda es cara',
        variables: 'Moneda: Variable aleatoria binomial con p=0.5 (probabilidad de éxito)',
      },
      'Cruz': {
        definition: 'El resultado del lanzamiento de una moneda es cruz',
        variables: 'Moneda: Variable aleatoria binomial con p=0.5 (probabilidad de fracaso)',
      },
    },
    die: {
      '1': { definition: 'El dado muestra el número 1', variables: 'Dado: Variable aleatoria uniforme discreta en {1,2,3,4,5,6}' },
      '2': { definition: 'El dado muestra el número 2', variables: 'Dado: Variable aleatoria uniforme discreta en {1,2,3,4,5,6}' },
      '3': { definition: 'El dado muestra el número 3', variables: 'Dado: Variable aleatoria uniforme discreta en {1,2,3,4,5,6}' },
      '4': { definition: 'El dado muestra el número 4', variables: 'Dado: Variable aleatoria uniforme discreta en {1,2,3,4,5,6}' },
      '5': { definition: 'El dado muestra el número 5', variables: 'Dado: Variable aleatoria uniforme discreta en {1,2,3,4,5,6}' },
      '6': { definition: 'El dado muestra el número 6', variables: 'Dado: Variable aleatoria uniforme discreta en {1,2,3,4,5,6}' },
    },
    'two-coins': {
      'CC': { definition: 'Ambas monedas muestran cara', variables: 'Dos monedas independientes, cada una con p=0.5. Evento: intersección de dos caras' },
      'CX': { definition: 'Primera moneda cara, segunda cruz', variables: 'Moneda 1: Cara (p=0.5), Moneda 2: Cruz (p=0.5)' },
      'XC': { definition: 'Primera moneda cruz, segunda cara', variables: 'Moneda 1: Cruz (p=0.5), Moneda 2: Cara (p=0.5)' },
      'XX': { definition: 'Ambas monedas muestran cruz', variables: 'Dos monedas independientes, cada una con p=0.5. Evento: intersección de dos cruces' },
    },
    'two-dice': {
      // Dinámico - se genera en la función
      '_default': { 
        definition: 'Resultado específico del lanzamiento de dos dados',
        variables: 'Dos dados independientes, cada uno uniforme en {1,2,3,4,5,6}. Espacio muestral: 36 resultados equiprobables'
      },
    },
  };

  if (mode === 'two-dice' && !definitions[mode][eventName]) {
    return definitions[mode]['_default'];
  }

  return definitions[mode][eventName] || { 
    definition: `Evento: ${eventName}`,
    variables: 'Variable aleatoria con distribución teórica conocida'
  };
}

// Genera interpretación basada en el análisis
function generateInterpretation(analysis: Partial<EventAnalysis>): string {
  const deviation = analysis.deviationPercentage || 0;
  const isConverging = deviation < 5;
  const sampleSize = analysis.absoluteFrequency ? analysis.absoluteFrequency * (1 / (analysis.relativeFrequency || 0.5)) : 0;

  let interpretation = '';

  if (deviation < 1) {
    interpretation = `El evento "${analysis.eventName}" muestra una excelente convergencia hacia su valor teórico. La simulación demuestra efectivamente la Ley de los Grandes Números.`;
  } else if (deviation < 5) {
    interpretation = `El evento "${analysis.eventName}" converge adecuadamente hacia el valor teórico. La desviación observada es normal para el tamaño de muestra actual.`;
  } else if (deviation < 10) {
    interpretation = `El evento "${analysis.eventName}" muestra desviación moderada. Se requieren más lanzamientos para una mejor convergencia.`;
  } else {
    interpretation = `El evento "${analysis.eventName}" aún no ha convergido completamente. Aumentar el número de lanzamientos mejorará la precisión.`;
  }

  if (analysis.confidenceInterval) {
    interpretation += ` Con 95% de confianza, la probabilidad real está entre ${(analysis.confidenceInterval.lower * 100).toFixed(2)}% y ${(analysis.confidenceInterval.upper * 100).toFixed(2)}%.`;
  }

  return interpretation;
}

export function analyzeEvent(
  stats: SimulationStats,
  eventName: string
): EventAnalysis {
  const theoreticalProb = stats.theoreticalProbs[eventName];
  const absoluteFreq = stats.frequencies[eventName];
  const relativeFreq = stats.relativeFrequencies[eventName];
  const deviation = stats.deviations[eventName];

  const { definition, variables } = getEventDefinition(stats.mode, eventName);
  const confidenceInterval = calculateConfidenceInterval(relativeFreq, stats.totalThrows);

  const deviationPercentage = deviation * 100;
  
  // Determinar estado de convergencia
  let convergenceStatus: 'convergiendo' | 'convergido' | 'sin-convergencia';
  if (deviationPercentage < 1) {
    convergenceStatus = 'convergido';
  } else if (deviationPercentage < 5) {
    convergenceStatus = 'convergiendo';
  } else {
    convergenceStatus = 'sin-convergencia';
  }

  const analysis: EventAnalysis = {
    eventName,
    mode: stats.mode,
    eventDefinition: definition,
    variablesDescription: variables,
    theoreticalProbability: theoreticalProb,
    absoluteFrequency: absoluteFreq,
    relativeFrequency: relativeFreq,
    confidenceInterval: {
      lower: confidenceInterval.lower,
      upper: confidenceInterval.upper,
      confidenceLevel: 95,
    },
    deviation,
    deviationPercentage,
    interpretation: '',
    convergenceStatus,
  };

  analysis.interpretation = generateInterpretation(analysis);

  return analysis;
}

const modeLabels: Record<ExperimentMode, string> = {
  coin: 'Una Moneda',
  die: 'Un Dado',
  'two-coins': 'Dos Monedas',
  'two-dice': 'Dos Dados',
};

export function exportEventAnalysisCSV(analysis: EventAnalysis): string {
  const lines: string[] = [];

  lines.push('ANÁLISIS INDIVIDUAL DE EVENTO');
  lines.push('');
  lines.push(`Evento: ${analysis.eventName}`);
  lines.push(`Modo: ${analysis.mode}`);
  lines.push('');
  
  lines.push('--- DEFINICIÓN DEL EVENTO ---');
  lines.push(analysis.eventDefinition);
  lines.push('Variables y distribuciones:');
  lines.push(analysis.variablesDescription);
  lines.push('');

  lines.push('--- GENERACIÓN DE DATOS ---');
  lines.push(`Probabilidad Teórica: ${(analysis.theoreticalProbability * 100).toFixed(4)}%`);
  lines.push(`Frecuencia Absoluta: ${analysis.absoluteFrequency}`);
  lines.push(`Frecuencia Relativa: ${(analysis.relativeFrequency * 100).toFixed(6)}%`);
  lines.push('');

  lines.push('--- VALIDACIÓN Y PRECISIÓN ---');
  lines.push(`Intervalo de Confianza (95%): [${(analysis.confidenceInterval.lower * 100).toFixed(4)}%, ${(analysis.confidenceInterval.upper * 100).toFixed(4)}%]`);
  lines.push(`Desviación Absoluta: ${(analysis.deviation * 100).toFixed(6)}%`);
  lines.push(`Desviación Porcentual: ${analysis.deviationPercentage.toFixed(2)}%`);
  lines.push(`Estado de Convergencia: ${analysis.convergenceStatus}`);
  lines.push('');

  lines.push('--- INTERPRETACIÓN DE RESULTADOS ---');
  lines.push(analysis.interpretation);

  return lines.join('\n');
}

export async function exportEventAnalysisPDF(analysis: EventAnalysis): Promise<void> {
  // Importar jsPDF dinámicamente para evitar problemas de SSR
  const { jsPDF } = await import('jspdf');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const addText = (text: string, options: any = {}) => {
    const fontSize = options.fontSize || 11;
    const color = options.color || [0, 0, 0];
    const isBold = options.bold || false;
    
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    if (isBold) pdf.setFont(undefined, 'bold');
    
    const splitText = pdf.splitTextToSize(text, contentWidth);
    pdf.text(splitText, margin, yPos);
    yPos += (splitText.length * fontSize * 0.35) + (options.spacing || 3);
    
    if (isBold) pdf.setFont(undefined, 'normal');
  };

  const addSection = (title: string) => {
    yPos += 3;
    pdf.setDrawColor(59, 130, 246); // Color azul
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;
    addText(title, { fontSize: 13, bold: true, color: [59, 130, 246] });
  };

  const addKeyValue = (key: string, value: string) => {
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${key}:`, margin, yPos);
    
    pdf.setFont(undefined, 'normal');
    const valueLines = pdf.splitTextToSize(value, contentWidth - 50);
    pdf.text(valueLines, margin + 60, yPos);
    yPos += Math.max(5, valueLines.length * 3.5) + 2;
  };

  // Título
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(30, 41, 59); // slate-900
  pdf.text('Análisis del Evento: ' + analysis.eventName, margin, yPos);
  yPos += 8;

  // Información del evento
  addKeyValue('Modo de Simulación', modeLabels[analysis.mode]);
  addKeyValue('Fecha', new Date().toLocaleString('es-ES'));
  yPos += 3;

  // Sección 1: Definición del Evento
  addSection('1. Definición del Evento');
  addKeyValue('Descripción', analysis.eventDefinition);
  addKeyValue('Variables y Distribuciones', analysis.variablesDescription);

  // Verificar si necesitamos nueva página
  if (yPos > pageHeight - 50) {
    pdf.addPage();
    yPos = margin;
  }

  // Sección 2: Generación de Datos
  addSection('2. Generación de Datos');
  addKeyValue('Probabilidad Teórica', `${(analysis.theoreticalProbability * 100).toFixed(4)}%`);
  addKeyValue('Frecuencia Absoluta', analysis.absoluteFrequency.toLocaleString());
  addKeyValue('Frecuencia Relativa (Observada)', `${(analysis.relativeFrequency * 100).toFixed(6)}%`);

  if (yPos > pageHeight - 50) {
    pdf.addPage();
    yPos = margin;
  }

  // Sección 3: Validación y Precisión
  addSection('3. Validación y Precisión');
  addKeyValue(
    'Intervalo de Confianza (95%)',
    `[${(analysis.confidenceInterval.lower * 100).toFixed(4)}%, ${(analysis.confidenceInterval.upper * 100).toFixed(4)}%]`
  );
  addKeyValue('Desviación Absoluta', `${(analysis.deviation * 100).toFixed(6)}%`);
  addKeyValue('Desviación Porcentual', `${analysis.deviationPercentage.toFixed(2)}%`);
  
  const convergenceStatusLabel: Record<string, string> = {
    'convergido': 'Convergido',
    'convergiendo': 'Convergiendo',
    'sin-convergencia': 'Sin Convergencia',
  };
  addKeyValue('Estado de Convergencia', convergenceStatusLabel[analysis.convergenceStatus]);

  if (yPos > pageHeight - 50) {
    pdf.addPage();
    yPos = margin;
  }

  // Sección 4: Interpretación
  addSection('4. Interpretación de Resultados');
  addText(analysis.interpretation, { fontSize: 10, spacing: 5 });

  // Pie de página
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    'Simulador de Monedas y Dados - Generado el ' + new Date().toLocaleString('es-ES'),
    margin,
    pageHeight - 10
  );

  // Descargar
  pdf.save(`analisis-evento-${analysis.eventName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
}
