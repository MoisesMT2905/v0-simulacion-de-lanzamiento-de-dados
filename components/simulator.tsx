'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import CoinDiceSimulator, { ExperimentMode, SimulationStats } from '@/lib/simulator';
import { FrequencyTable } from './frequency-table';
import { SimulationCharts } from './simulation-charts';
import { downloadCSV } from '@/lib/export';
import { AlertCircle, Download, RotateCcw, Play, Pause } from 'lucide-react';

export function Simulator() {
  const [mode, setMode] = useState<ExperimentMode>('coin');
  const [numThrows, setNumThrows] = useState<string>('1000');
  const [stats, setStats] = useState<SimulationStats | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showRelative, setShowRelative] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string>('');

  const simulatorRef = useRef<CoinDiceSimulator>(new CoinDiceSimulator());
  const abortRef = useRef<boolean>(false);

  const modeLabels: Record<ExperimentMode, string> = {
    coin: 'Una Moneda',
    die: 'Un Dado',
    'two-coins': 'Dos Monedas',
    'two-dice': 'Dos Dados',
  };

  const handleModeChange = (newMode: ExperimentMode) => {
    if (!isSimulating) {
      setMode(newMode);
      simulatorRef.current.reset();
      setStats(null);
      setProgress(0);
      setError('');
    }
  };

  const validateInput = (value: string): boolean => {
    const num = parseInt(value);
    if (isNaN(num)) {
      setError('Ingrese un número válido');
      return false;
    }
    if (num <= 0) {
      setError('El número debe ser mayor a 0');
      return false;
    }
    if (num > 1e9) {
      setError('El máximo es 1 billón (1×10⁹)');
      return false;
    }
    setError('');
    return true;
  };

  const runSimulation = useCallback(async (throws: number) => {
    if (!validateInput(throws.toString())) return;

    setIsSimulating(true);
    setProgress(0);
    abortRef.current = false;

    try {
      const result = simulatorRef.current.simulate(
        mode,
        throws,
        (progress) => setProgress(Math.min(progress, 99))
      );

      const statsData = simulatorRef.current.getStats();
      setStats(statsData);
      setProgress(100);
    } catch (err) {
      setError('Error durante la simulación');
      console.error(err);
    } finally {
      setIsSimulating(false);
      setIsPaused(false);
    }
  }, [mode]);

  const handleSimulate = () => {
    const throws = parseInt(numThrows);
    if (validateInput(numThrows)) {
      runSimulation(throws);
    }
  };

  const handleQuickSimulation = (throws: number) => {
    setNumThrows(throws.toString());
    runSimulation(throws);
  };

  const handleReset = () => {
    simulatorRef.current.reset();
    setStats(null);
    setProgress(0);
    setError('');
    setIsPaused(false);
  };

  const handleExport = () => {
    if (stats) {
      downloadCSV(stats);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground text-balance">
            Simulador de Monedas y Dados
          </h1>
          <p className="text-muted-foreground text-lg">
            Explora la Ley de los Grandes Números con simulaciones de hasta 1 billón de lanzamientos
          </p>
        </div>

        {/* Mode Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Seleccionar Experimento</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => handleModeChange(v as ExperimentMode)}>
              <TabsList className="grid w-full grid-cols-4 bg-secondary">
                {Object.entries(modeLabels).map(([key, label]) => (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    disabled={isSimulating}
                    className="text-foreground"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Simulation Controls */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="throws" className="text-foreground">
                  Número de Lanzamientos (máx: 1×10⁹)
                </Label>
                <Input
                  id="throws"
                  type="number"
                  value={numThrows}
                  onChange={(e) => setNumThrows(e.target.value)}
                  disabled={isSimulating}
                  placeholder="Ej: 1000"
                  min="1"
                  max="1000000000"
                  className="bg-input text-foreground border-border"
                />
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <Button
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isSimulating ? `Simulando... ${progress.toFixed(0)}%` : 'Lanzar'}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {isSimulating && (
              <div className="space-y-2">
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {progress.toFixed(1)}% completado
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Quick Buttons */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {[100, 1000, 10000, 100000, 1000000].map((throws) => (
                <Button
                  key={throws}
                  onClick={() => handleQuickSimulation(throws)}
                  disabled={isSimulating}
                  variant="outline"
                  className="text-xs border-border text-foreground hover:bg-secondary"
                >
                  {throws >= 1e6 ? `${(throws / 1e6).toFixed(0)}M` : `${throws / 1e3}K`}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-border text-foreground hover:bg-secondary"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>

              {stats && (
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              )}

              <div className="flex items-center space-x-2 ml-auto">
                <Checkbox
                  id="relative"
                  checked={showRelative}
                  onCheckedChange={(checked) => setShowRelative(checked as boolean)}
                  className="border-border"
                />
                <Label htmlFor="relative" className="text-foreground cursor-pointer">
                  Mostrar frecuencias relativas
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Lanzamientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalThrows.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Último Resultado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">
                  {stats.lastResult}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Modo Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {modeLabels[stats.mode]}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Desviación Máxima
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {Math.max(...Object.values(stats.deviations)).toFixed(4)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        {stats && (
          <SimulationCharts stats={stats} showRelative={showRelative} />
        )}

        {/* Frequency Table */}
        {stats && (
          <FrequencyTable stats={stats} showRelative={showRelative} />
        )}

        {/* Empty State */}
        {!stats && (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-muted-foreground mb-4">
                Selecciona un experimento y haz clic en "Lanzar" para comenzar la simulación.
              </p>
              <p className="text-sm text-muted-foreground">
                Puedes simular desde 1 hasta 1 billón (10⁹) de lanzamientos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
