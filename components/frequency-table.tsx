'use client';

import { SimulationStats } from '@/lib/simulator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FrequencyTableProps {
  stats: SimulationStats;
  showRelative: boolean;
  onEventClick?: (eventName: string) => void;
}

export function FrequencyTable({ stats, showRelative, onEventClick }: FrequencyTableProps) {
  const results = Object.keys(stats.frequencies).sort();

  const getValueLabel = () => {
    if (stats.mode === 'two-dice') return 'Suma';
    if (stats.mode === 'two-coins') return 'Suma';
    return 'Valor';
  };

  const getValueTooltip = () => {
    if (stats.mode === 'two-dice') return 'Suma de los dos dados (2-12)';
    if (stats.mode === 'two-coins') return 'Suma de valores (Cara=1, Cruz=0)';
    if (stats.mode === 'coin') return 'Valor numérico (Cara=1, Cruz=0)';
    if (stats.mode === 'die') return 'Valor del dado (1-6)';
    return '';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Tabla de Frecuencias</CardTitle>
        <p className="text-xs text-muted-foreground mt-2">Haz clic en cualquier fila para ver el análisis detallado</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Resultado</TableHead>
                <TableHead className="text-muted-foreground cursor-help" title={getValueTooltip()}>
                  {getValueLabel()}
                </TableHead>
                <TableHead className="text-muted-foreground">Probabilidad Teórica</TableHead>
                {!showRelative ? (
                  <TableHead className="text-muted-foreground">Frecuencia Absoluta</TableHead>
                ) : (
                  <TableHead className="text-muted-foreground">Frecuencia Relativa</TableHead>
                )}
                <TableHead className="text-muted-foreground">Desviación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => {
                const theoretical = stats.theoreticalProbs[result];
                const absolute = stats.frequencies[result];
                const relative = stats.relativeFrequencies[result];
                const deviation = stats.deviations[result];
                const derivedValue = stats.derivedValues[result];

                return (
                  <TableRow 
                    key={result}
                    className="cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => onEventClick?.(result)}
                  >
                    <TableCell className="font-medium text-foreground">{result}</TableCell>
                    <TableCell className="text-foreground font-semibold text-accent">{derivedValue}</TableCell>
                    <TableCell className="text-foreground">{theoretical.toFixed(6)}</TableCell>
                    <TableCell className="text-foreground">
                      {!showRelative ? absolute : relative.toFixed(6)}
                    </TableCell>
                    <TableCell className="text-foreground">{deviation.toFixed(6)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
