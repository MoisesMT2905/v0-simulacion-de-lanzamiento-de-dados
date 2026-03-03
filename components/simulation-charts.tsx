'use client';

import { SimulationStats } from '@/lib/simulator';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SimulationChartsProps {
  stats: SimulationStats;
  showRelative: boolean;
  onEventClick?: (eventName: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4'];

export function SimulationCharts({ stats, showRelative, onEventClick }: SimulationChartsProps) {
  const results = Object.keys(stats.frequencies).sort();

  const barData = results.map(result => ({
    name: result,
    value: showRelative ? stats.relativeFrequencies[result] : stats.frequencies[result],
    theoretical: stats.theoreticalProbs[result],
  }));

  const pieData = results.map((result, idx) => ({
    name: result,
    value: showRelative ? stats.relativeFrequencies[result] : stats.frequencies[result],
    color: COLORS[idx % COLORS.length],
  }));

  const handleBarClick = (data: any) => {
    onEventClick?.(data.name);
  };

  const handlePieClick = (data: any) => {
    onEventClick?.(data.name);
  };

  return (
    <Card className="bg-card border-border col-span-full">
      <CardHeader>
        <CardTitle className="text-foreground">Visualización de Datos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="bar" className="text-foreground">Gráfico de Barras</TabsTrigger>
            <TabsTrigger value="pie" className="text-foreground">Gráfico de Pastel</TabsTrigger>
            <TabsTrigger value="comparison" className="text-foreground">Comparación</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }} onClick={(state) => {
                if (state?.activeTooltipIndex !== undefined && barData[state.activeTooltipIndex]) {
                  handleBarClick(barData[state.activeTooltipIndex]);
                }
              }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fill: '#cbd5e1' }}
                />
                <YAxis tick={{ fill: '#cbd5e1' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                  labelStyle={{ color: '#cbd5e1' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  name={showRelative ? 'Frecuencia Relativa' : 'Frecuencia Absoluta'}
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => handleBarClick(data)}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">Haz clic en una barra para ver el análisis detallado</p>
          </TabsContent>

          <TabsContent value="pie" className="mt-4">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${(value * 100).toFixed(1)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handlePieClick(data)}
                  style={{ cursor: 'pointer' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                  labelStyle={{ color: '#cbd5e1' }}
                  formatter={(value: number) => (value * 100).toFixed(2) + '%'}
                />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">Haz clic en una sección para ver el análisis detallado</p>
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fill: '#cbd5e1' }}
                />
                <YAxis tick={{ fill: '#cbd5e1' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }}
                  labelStyle={{ color: '#cbd5e1' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  name={showRelative ? 'Frecuencia Relativa' : 'Frecuencia Absoluta'}
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => handleBarClick(data)}
                  style={{ cursor: 'pointer' }}
                />
                <Bar 
                  dataKey="theoretical" 
                  fill="#10b981" 
                  name="Probabilidad Teórica"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">Haz clic en una barra azul para ver el análisis detallado</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
