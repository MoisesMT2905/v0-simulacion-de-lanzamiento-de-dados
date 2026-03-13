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

  /* CALCULAR SUMAS DE DOS DADOS */

  const diceSumStats: Record<number, number> = {};

  if (stats.mode === 'two-dice') {

    Object.entries(stats.relativeFrequencies).forEach(([result, rel]) => {

      const [d1, d2] = result.split('-').map(Number);
      const sum = d1 + d2;

      if (!diceSumStats[sum]) diceSumStats[sum] = 0;

      diceSumStats[sum] += rel;

    });

  }

  const theoreticalSums: Record<number, number> = {
    2: 1 / 36,
    3: 2 / 36,
    4: 3 / 36,
    5: 4 / 36,
    6: 5 / 36,
    7: 6 / 36,
    8: 5 / 36,
    9: 4 / 36,
    10: 3 / 36,
    11: 2 / 36,
    12: 1 / 36
  };

  /* ENCONTRAR SUMA MAS PROBABLE */

  let mostLikelySum = null;
  let maxProb = 0;

  Object.entries(theoreticalSums).forEach(([sum, prob]) => {

    if (prob > maxProb) {
      maxProb = prob;
      mostLikelySum = sum;
    }

  });

  return (
    <>

      {/* CARTA CON VALOR MAS PROBABLE */}

      {stats.mode === 'two-dice' && (

        <Card className="bg-card border-border mb-4">

          <CardHeader>
            <CardTitle className="text-foreground">
              Valor con Mayor Probabilidad
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-lg font-semibold">
              La suma con mayor probabilidad de salir es: <b>{mostLikelySum}</b>
            </p>

            <p className="text-sm text-muted-foreground">
              Probabilidad teórica: {maxProb.toFixed(6)}
            </p>

            <p className="text-sm text-muted-foreground">
              Probabilidad relativa observada: {(diceSumStats[Number(mostLikelySum)] || 0).toFixed(6)}
            </p>
          </CardContent>

        </Card>

      )}

      {/* TABLA ORIGINAL */}

      <Card className="bg-card border-border">

        <CardHeader>

          <CardTitle className="text-foreground">
            Tabla de Frecuencias
          </CardTitle>

          <p className="text-xs text-muted-foreground mt-2">
            Haz clic en cualquier fila para ver el análisis detallado
          </p>

        </CardHeader>

        <CardContent className="space-y-3">

          <div className="overflow-x-auto">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead className="text-muted-foreground">
                    Resultado
                  </TableHead>

                  <TableHead
                    className="text-muted-foreground cursor-help"
                    title={getValueTooltip()}
                  >
                    {getValueLabel()}
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    Probabilidad Teórica
                  </TableHead>

                  {!showRelative ? (
                    <TableHead className="text-muted-foreground">
                      Frecuencia Absoluta
                    </TableHead>
                  ) : (
                    <TableHead className="text-muted-foreground">
                      Frecuencia Relativa
                    </TableHead>
                  )}

                  <TableHead className="text-muted-foreground">
                    Desviación
                  </TableHead>

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

                      <TableCell className="font-medium text-foreground">
                        {result}
                      </TableCell>

                      <TableCell className="font-semibold text-black">
                        {derivedValue}
                      </TableCell>

                      <TableCell className="text-foreground">
                        {theoretical.toFixed(6)}
                      </TableCell>

                      <TableCell className="text-foreground">
                        {!showRelative ? absolute : relative.toFixed(6)}
                      </TableCell>

                      <TableCell className="text-foreground">
                        {deviation.toFixed(6)}
                      </TableCell>

                    </TableRow>

                  );

                })}

              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>

      {/* TABLA DE SUMAS */}

      {stats.mode === 'two-dice' && (

        <Card className="bg-card border-border mt-4">

          <CardHeader>
            <CardTitle className="text-foreground">
              Distribución de Sumas (Dos Dados)
            </CardTitle>
          </CardHeader>

          <CardContent>

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>Suma</TableHead>
                  <TableHead>Probabilidad Teórica</TableHead>
                  <TableHead>Frecuencia Observada</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {Object.keys(theoreticalSums).map((sum) => (

                  <TableRow key={sum}>

                    <TableCell className="font-semibold">
                      {sum}
                    </TableCell>

                    <TableCell>
                      {theoreticalSums[Number(sum)].toFixed(6)}
                    </TableCell>

                    <TableCell>
                      {(diceSumStats[Number(sum)] || 0).toFixed(6)}
                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </CardContent>

        </Card>

      )}

    </>
  );
}