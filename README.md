# Simulador de Monedas y Dados

Una aplicación web interactiva para simular experimentos de lanzamiento de monedas y dados, demostrando la **Ley de los Grandes Números** con hasta **1 billón (10⁹) de simulaciones**.

## Características

### Experimentos Disponibles
- **Una Moneda**: Cara/Cruz (2 resultados posibles)
- **Un Dado**: Valores 1-6 (6 resultados posibles)
- **Dos Monedas**: Combinaciones de Cara-Cruz (4 resultados posibles)
- **Dos Dados**: Combinaciones ordenadas (36 resultados posibles)

### Funcionalidades

✅ **Simulación Masiva**: Hasta 1 billón de lanzamientos sin problemas  
✅ **Generador de Números Aleatorios**: Algoritmo Congruencial Lineal (LCG) con largo período  
✅ **Visualización en Tiempo Real**: 
- Gráfico de barras (frecuencias absolutas/relativas)
- Gráfico de pastel (distribución de resultados)
- Gráfico comparativo (resultados vs. probabilidad teórica)

✅ **Tabla de Frecuencias**: Muestra:
- Probabilidad teórica
- Frecuencia absoluta
- Frecuencia relativa
- Desviación respecto a la teoría

✅ **Análisis Individual de Eventos** (Nuevo):
- **Drill-down interactivo**: Haz clic en cualquier resultado (gráfico, tabla, selector)
- **Modal de análisis detallado** con 4 secciones:
  1. **Definición del Evento**: Descripción de variables y distribuciones
  2. **Generación de Datos**: Probabilidad teórica vs. frecuencia observada
  3. **Validación y Precisión**: 
     - Intervalo de confianza (95%)
     - Desviación absoluta y porcentual
     - Estado de convergencia (convergido/convergiendo/sin-convergencia)
  4. **Interpretación de Resultados**: Análisis cualitativo del comportamiento
- **Exportación CSV específica** del evento analizado

✅ **Exportación de Datos**: CSV descargable con toda la información estadística  
✅ **Controles de Simulación**:
- Botones rápidos: 100, 1K, 10K, 100K, 1M lanzamientos
- Entrada personalizada hasta 1 billón
- Barra de progreso en tiempo real
- Reinicio instantáneo

✅ **Tema Profesional**: Interfaz oscura moderna y responsiva

## Conceptos Matemáticos Implementados

### Ley de los Grandes Números
A medida que aumenta el número de simulaciones (N), las frecuencias relativas (probabilidad empírica) convergen a la probabilidad teórica.

**Probabilidades Teóricas:**
- Moneda: P(Cara) = P(Cruz) = 0.5
- Dado: P(1)...P(6) = 1/6 ≈ 0.1667
- Dos Monedas: P(cada resultado) = 0.25
- Dos Dados: P(cada par) = 1/36 ≈ 0.0278

### Generador de Números Pseudoaleatorios
Se implementó un **Generador Congruencial Lineal (LCG)**:
```
X(n+1) = (a * X(n) + c) mod m
```

Parámetros utilizados:
- a = 1664525
- c = 1013904223
- m = 2³² (4,294,967,296)

Período: m (muy largo para aplicaciones prácticas)

## Requisitos del Proyecto

Basado en el Capítulo 1 de "Simulación: Un enfoque práctico" de Raúl Coss Bu

### Etapas de Simulación Implementadas
1. **Definición del Sistema**: Especificación de monedas, dados y reglas
2. **Formulación del Modelo**: Definición de probabilidades teóricas
3. **Implementación**: Código de simulación eficiente
4. **Validación**: Comparación de resultados con probabilidades teóricas
5. **Experimentación**: Ejecución masiva y análisis de convergencia

## Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript
- **Gráficos**: Recharts
- **Styling**: Tailwind CSS, shadcn/ui
- **Simulación**: Algoritmo LCG puro en JavaScript
- **Exportación**: CSV nativo

## Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/MoisesMT2905/simulator-coins-dice.git
cd simulator-coins-dice

# Instalar dependencias
npm install
# o
pnpm install

# Ejecutar en desarrollo
npm run dev
# o
pnpm dev

# Abrir en navegador
open http://localhost:3000
```

## Build para Producción

```bash
npm run build
npm start
```

## Uso

1. **Selecciona un experimento** en las pestañas (Moneda, Dado, Dos Monedas, Dos Dados)
2. **Ingresa la cantidad de lanzamientos** o usa los botones rápidos
3. **Haz clic en "Lanzar"** para iniciar la simulación
4. **Observa los resultados**:
   - Tabla de frecuencias con probabilidades teóricas
   - Gráficos dinámicos de distribución
   - Estadísticas de desviación

5. **Analiza eventos individuales** (Nuevo):
   - Haz clic en cualquier barra del gráfico
   - O haz clic en cualquier fila de la tabla de frecuencias
   - Se abrirá un panel detallado con el análisis del evento:
     - Definición matemática del evento
     - Probabilidad teórica vs. observada
     - Intervalo de confianza al 95%
     - Estado de convergencia
     - Interpretación profesional
   - Exporta el análisis específico a CSV

6. **Exporta los datos** globales en formato CSV
7. **Reinicia** para cambiar de experimento o limpiar datos

## Ejemplos de Uso

### Verificar la Ley de los Grandes Números
1. Selecciona "Una Moneda"
2. Simula 100 lanzamientos → Verás variación en las frecuencias
3. Simula 1 millón → Las frecuencias se acercan a 50% cada una
4. Nota cómo la desviación disminuye conforme aumenta N

### Comparar Distribuciones
- **Un Dado**: Resultados tendencia a 1/6 (≈0.1667)
- **Dos Dados**: Visualiza el patrón de distribución triangular
- **Dos Monedas**: 4 resultados equiprobables (0.25 cada uno)

## Desempeño

- **100 lanzamientos**: < 1ms
- **1 millón de lanzamientos**: ~50-100ms
- **1 billón de lanzamientos**: ~30-40 segundos (con barra de progreso)

El código está optimizado para:
- No almacenar cada resultado individual
- Solo mantener contadores acumulados
- Procesamiento por lotes para actualización de interfaz

## Estructura del Proyecto

```
├── app/
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos globales
├── components/
│   ├── simulator.tsx       # Componente principal de simulación
│   ├── frequency-table.tsx # Tabla de frecuencias
│   └── simulation-charts.tsx # Gráficos
├── lib/
│   ├── simulator.ts        # Lógica de simulación
│   └── export.ts           # Funciones de exportación
└── public/                 # Assets estáticos
```

## Conceptos Aplicados del Capítulo 1

### 1. Definición de Simulación
> "Experimento numérico en computadora para estudiar sistemas reales"

Implementado: Simulamos procesos aleatorios (monedas y dados) sin ejecutarlos físicamente.

### 2. Generación de Variables Aleatorias
Uso de LCG para generar números pseudoaleatorios uniformes en [0,1], transformados a resultados discretos.

### 3. Tamaño de Muestra (N)
Demostración práctica de cómo N grande → precisión en estimación de parámetros.

### 4. Validación
Comparación constante entre:
- Probabilidad teórica (conocida)
- Frecuencia relativa (simulada)

### 5. Diseño de Experimentos
Permite reproducir resultados, variar N y observar convergencia.

## Licencia

MIT

## Autor

Moises M. - 2026

## Referencias

- Coss Bu, R. (2003). *Simulación: Un enfoque práctico*. Limusa.
- Capítulo 1: Simulación, conceptos básicos
