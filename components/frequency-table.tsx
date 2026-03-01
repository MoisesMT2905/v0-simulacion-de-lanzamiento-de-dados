'use client';

import { SimulationStats } from '@/lib/simulator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FrequencyTableProps {
  stats: SimulationStats;
  showRelative: boolean;
}

export function FrequencyTable({ stats, showRelative }: FrequencyTableProps) {
  const results = Object.keys(stats.frequencies).sort();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Tabla de Frecuencias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Resultado</TableHead>
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

                return (
                  <TableRow key={result}>
                    <TableCell className="font-medium text-foreground">{result}</TableCell>
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
