import * as XLSX from 'xlsx';
import { SimulationStats } from './simulator';

export function generateCSV(stats: SimulationStats): string {
  return '';
}

export function downloadCSV(stats: SimulationStats): void {
  const data: any[][] = [];

  // ===== TÍTULO =====
  data.push(['ESTADÍSTICAS DE LA SIMULACIÓN']);
  data.push([]);

  // ===== RESUMEN =====
  data.push(['Modo', traducirModo(stats.mode)]);
  data.push(['Total de Lanzamientos', stats.totalThrows]);
  data.push(['Último Resultado', stats.lastResult]);
  data.push([]);

  // ===== ENCABEZADOS DE TABLA =====
  const headerRowIndex = data.length;
  data.push([
    'RESULTADO',
    'FRECUENCIA ABSOLUTA',
    'FRECUENCIA RELATIVA',
    'PROBABILIDAD TEÓRICA',
    'DESVIACIÓN'
  ]);

  // ===== DATOS =====
  Object.keys(stats.frequencies).forEach(key => {
    data.push([
      key,
      stats.frequencies[key],
      stats.relativeFrequencies[key],
      stats.theoreticalProbs[key],
      stats.deviations[key]
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);

  // ===== ANCHOS DE COLUMNA =====
  ws['!cols'] = [
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
    { wch: 26 },
    { wch: 18 }
  ];

  // ===== COMBINAR TÍTULO =====
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
  ];

  // ===== AUTOFILTRO (TABLA) =====
  ws['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: headerRowIndex, c: 0 },
      e: { r: data.length - 1, c: 4 }
    })
  };

  // ===== FORMATO NUMÉRICO =====
  aplicarFormato(ws, headerRowIndex + 1, data.length - 1);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Simulación');

  XLSX.writeFile(
    wb,
    `simulacion-${stats.mode}-${Date.now()}.xlsx`
  );
}

export function generatePDF(stats: SimulationStats): void {
  // Intencionalmente vacío
}

function traducirModo(modo: string): string {
  const map: Record<string, string> = {
    coin: 'Una moneda',
    die: 'Un dado',
    'two-coins': 'Dos monedas',
    'two-dice': 'Dos dados'
  };
  return map[modo] ?? modo;
}

function aplicarFormato(
  ws: XLSX.WorkSheet,
  startRow: number,
  endRow: number
) {
  for (let r = startRow; r <= endRow; r++) {
    const rel = XLSX.utils.encode_cell({ r, c: 2 });
    const prob = XLSX.utils.encode_cell({ r, c: 3 });
    const dev = XLSX.utils.encode_cell({ r, c: 4 });

    if (ws[rel]) ws[rel].z = '0.000';
    if (ws[prob]) ws[prob].z = '0.000';
    if (ws[dev]) ws[dev].z = '0.000';
  }
}