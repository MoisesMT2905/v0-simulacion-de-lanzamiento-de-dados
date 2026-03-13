// Linear Congruential Generator for pseudo-random numbers
class LCG {
  private seed: number;
  private a = 1664525;
  private c = 1013904223;
  private m = Math.pow(2, 32);

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }
}

export type ExperimentMode = 'coin' | 'die' | 'two-coins' | 'two-dice';

export interface SimulationResult {
  mode: ExperimentMode;
  totalThrows: number;
  lastResult: string;
  frequencies: Record<string, number>;
  theoreticalProbs: Record<string, number>;
}

export interface SimulationStats extends SimulationResult {
  relativeFrequencies: Record<string, number>;
  deviations: Record<string, number>;
  derivedValues: Record<string, number>; // For storing Suma/Valor for each result
}

class CoinDiceSimulator {
  private lcg: LCG;
  private currentResult: SimulationResult | null = null;

  constructor(seed?: number) {
    this.lcg = new LCG(seed);
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(this.lcg.next() * (max - min + 1)) + min;
  }

  private calculateDerivedValue(mode: ExperimentMode, result: string): number {
    if (mode === 'coin') {
      // Cara = 1, Cruz = 0
      return result === 'Cara' ? 1 : 0;
    } else if (mode === 'die') {
      // Valor = número del dado
      return parseInt(result, 10);
    } else if (mode === 'two-coins') {
      // Cara = 1, Cruz = 0, so we sum the values
      const coin1 = result[0] === 'C' ? 1 : 0;
      const coin2 = result[1] === 'C' ? 1 : 0;
      return coin1 + coin2;
    } else if (mode === 'two-dice') {
      // Two dice: sum the values
      const [die1, die2] = result.split('-').map(Number);
      return die1 + die2;
    }
    return 0;
  }

  private initializeResult(mode: ExperimentMode): SimulationResult {
    let frequencies: Record<string, number>;
    let theoreticalProbs: Record<string, number>;

    if (mode === 'coin') {
      frequencies = { Cara: 0, Cruz: 0 };
      theoreticalProbs = { Cara: 0.5, Cruz: 0.5 };
    } else if (mode === 'die') {
      frequencies = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      theoreticalProbs = { 1: 1/6, 2: 1/6, 3: 1/6, 4: 1/6, 5: 1/6, 6: 1/6 };
    } else if (mode === 'two-coins') {
      frequencies = { 'CC': 0, 'CX': 0, 'XC': 0, 'XX': 0 };
      theoreticalProbs = { 'CC': 0.25, 'CX': 0.25, 'XC': 0.25, 'XX': 0.25 };
    } else {
      // two-dice
      const faces = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6',
                     '2-1', '2-2', '2-3', '2-4', '2-5', '2-6',
                     '3-1', '3-2', '3-3', '3-4', '3-5', '3-6',
                     '4-1', '4-2', '4-3', '4-4', '4-5', '4-6',
                     '5-1', '5-2', '5-3', '5-4', '5-5', '5-6',
                     '6-1', '6-2', '6-3', '6-4', '6-5', '6-6'];
      frequencies = {};
      theoreticalProbs = {};
      faces.forEach(face => {
        frequencies[face] = 0;
        theoreticalProbs[face] = 1/36;
      });
    }

    return {
      mode,
      totalThrows: 0,
      lastResult: '',
      frequencies,
      theoreticalProbs,
    };
  }

  simulate(mode: ExperimentMode, numThrows: number, onProgress?: (progress: number) => void): SimulationResult {
    if (!this.currentResult || this.currentResult.mode !== mode) {
      this.currentResult = this.initializeResult(mode);
    }

    const batchSize = Math.max(100000, Math.floor(numThrows / 100));

    for (let i = 0; i < numThrows; i++) {
      let result: string;

      if (mode === 'coin') {
        result = this.lcg.next() < 0.5 ? 'Cara' : 'Cruz';
      } else if (mode === 'die') {
        result = String(this.getRandomInt(1, 6));
      } else if (mode === 'two-coins') {
        const coin1 = this.lcg.next() < 0.5 ? 'C' : 'X';
        const coin2 = this.lcg.next() < 0.5 ? 'C' : 'X';
        result = coin1 + coin2;
      } else {
        // two-dice
        const die1 = this.getRandomInt(1, 6);
        const die2 = this.getRandomInt(1, 6);
        result = `${die1}-${die2}`;
      }

      this.currentResult.frequencies[result]++;
      this.currentResult.lastResult = result;
      this.currentResult.totalThrows++;

      if ((i + 1) % batchSize === 0 && onProgress) {
        onProgress(((i + 1) / numThrows) * 100);
      }
    }

    if (onProgress) {
      onProgress(100);
    }

    return this.currentResult;
  }

  getStats(): SimulationStats {
    if (!this.currentResult) {
      throw new Error('No simulation data available');
    }

    const relativeFrequencies: Record<string, number> = {};
    const deviations: Record<string, number> = {};
    const derivedValues: Record<string, number> = {};

    Object.keys(this.currentResult.frequencies).forEach(key => {
      const freq = this.currentResult!.frequencies[key];
      const relative = this.currentResult!.totalThrows > 0 ? freq / this.currentResult!.totalThrows : 0;
      const theoretical = this.currentResult!.theoreticalProbs[key];
      
      relativeFrequencies[key] = relative;
      deviations[key] = Math.abs(relative - theoretical);
      derivedValues[key] = this.calculateDerivedValue(this.currentResult!.mode, key);
    });

    return {
      ...this.currentResult,
      relativeFrequencies,
      deviations,
      derivedValues,
    };
  }

  reset(): void {
    this.currentResult = null;
  }

  getCurrentResult(): SimulationResult | null {
    return this.currentResult;
  }
}

export default CoinDiceSimulator;
