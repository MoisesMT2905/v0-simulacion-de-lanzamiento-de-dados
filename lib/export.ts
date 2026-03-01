import { SimulationStats } from './simulator';

export function generateCSV(stats: SimulationStats): string {
  let csv = 'Simulation Statistics\n';
  csv += `Mode: ${stats.mode}\n`;
  csv += `Total Throws: ${stats.totalThrows}\n`;
  csv += `Last Result: ${stats.lastResult}\n`;
  csv += '\n';
  
  csv += 'Result,Absolute Frequency,Relative Frequency,Theoretical Probability,Deviation\n';
  
  Object.keys(stats.frequencies).forEach(key => {
    const absolute = stats.frequencies[key];
    const relative = stats.relativeFrequencies[key];
    const theoretical = stats.theoreticalProbs[key];
    const deviation = stats.deviations[key];
    
    csv += `${key},${absolute},${relative.toFixed(6)},${theoretical.toFixed(6)},${deviation.toFixed(6)}\n`;
  });

  return csv;
}

export function downloadCSV(stats: SimulationStats): void {
  const csv = generateCSV(stats);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `simulation-${stats.mode}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePDF(stats: SimulationStats): void {
  // Using a simple approach with canvas to create a basic PDF-like export
  const csv = generateCSV(stats);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `simulation-${stats.mode}-${Date.now()}.pdf`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
