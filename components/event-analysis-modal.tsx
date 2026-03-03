'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventAnalysis, exportEventAnalysisCSV } from '@/lib/event-analysis';
import { Download, X } from 'lucide-react';

interface EventAnalysisModalProps {
  isOpen: boolean;
  analysis: EventAnalysis | null;
  onClose: () => void;
}

export function EventAnalysisModal({ isOpen, analysis, onClose }: EventAnalysisModalProps) {
  if (!analysis) return null;

  const handleExportEvent = () => {
    const csv = exportEventAnalysisCSV(analysis);
    const element = document.createElement('a');
    const file = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `analisis-evento-${analysis.eventName.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getConvergenceColor = () => {
    switch (analysis.convergenceStatus) {
      case 'convergido':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'convergiendo':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    }
  };

  const getConvergenceLabel = () => {
    switch (analysis.convergenceStatus) {
      case 'convergido':
        return 'Convergido';
      case 'convergiendo':
        return 'Convergiendo';
      default:
        return 'Sin Convergencia';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground flex items-center justify-between">
            <span>Análisis del Evento: {analysis.eventName}</span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pr-4">
          {/* 1. Definición del Evento */}
          <Card className="bg-secondary/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">1. Definición del Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground font-semibold">Descripción:</p>
                <p className="text-foreground mt-1">{analysis.eventDefinition}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold">Variables y Distribuciones:</p>
                <p className="text-foreground mt-1 text-sm">{analysis.variablesDescription}</p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Generación de Datos */}
          <Card className="bg-secondary/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">2. Generación de Datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground font-semibold">PROBABILIDAD TEÓRICA</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {(analysis.theoreticalProbability * 100).toFixed(4)}%
                  </p>
                </div>
                <div className="bg-background/50 p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground font-semibold">FRECUENCIA ABSOLUTA</p>
                  <p className="text-2xl font-bold text-accent mt-1">
                    {analysis.absoluteFrequency.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-semibold">FRECUENCIA RELATIVA (OBSERVADA)</p>
                <p className="text-xl font-semibold text-foreground mt-1">
                  {(analysis.relativeFrequency * 100).toFixed(6)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Validación y Precisión */}
          <Card className="bg-secondary/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">3. Validación y Precisión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-background/50 p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground font-semibold">INTERVALO DE CONFIANZA (95%)</p>
                  <p className="text-foreground mt-1">
                    [{(analysis.confidenceInterval.lower * 100).toFixed(4)}%, {(analysis.confidenceInterval.upper * 100).toFixed(4)}%]
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Con 95% de confianza, la verdadera probabilidad se encuentra dentro de este intervalo.
                  </p>
                </div>

                <div className="bg-background/50 p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground font-semibold">DESVIACIÓN</p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {(analysis.deviation * 100).toFixed(6)}% (desviación absoluta)
                  </p>
                  <p className="text-foreground mt-1">
                    Desviación porcentual: <span className="font-bold">{analysis.deviationPercentage.toFixed(2)}%</span>
                  </p>
                </div>

                <div className={`p-3 rounded-lg border ${getConvergenceColor()}`}>
                  <p className="text-xs font-semibold">ESTADO DE CONVERGENCIA</p>
                  <p className="text-lg font-bold mt-1">{getConvergenceLabel()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Interpretación */}
          <Card className="bg-secondary/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">4. Interpretación de Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed text-base">
                {analysis.interpretation}
              </p>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Button
            onClick={handleExportEvent}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Análisis a CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
