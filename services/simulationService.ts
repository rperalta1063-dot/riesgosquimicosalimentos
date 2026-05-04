
import { FoodItem, SimulationResult, SimulationStats, UncertaintyStats, Contribution, DistributionParams } from '../types';
import { getSample, induceRankCorrelation } from './mathUtils';

function normalizeUnit(value: number, unit: string, type: 'concentration' | 'consumption' | 'exposure'): number {
  if (type === 'concentration') {
    return (unit === 'μg/kg' || unit === 'μg/L') ? value * 0.001 : value;
  }
  if (type === 'consumption') {
    return (unit === 'g/día' || unit === 'mL/día') ? value * 0.001 : value;
  }
  if (type === 'exposure') {
    return unit === 'μg/kg·día' ? value * 0.001 : value;
  }
  return value;
}

/**
 * Performs bootstrapping to estimate uncertainty (Confidence Intervals)
 * for the Mean and the 95th Percentile using non-parametric resampling.
 */
async function calculateUncertainty(
  distribution: number[],
  bootstrapCount: number = 200,
  onProgress?: (p: number) => void
): Promise<UncertaintyStats> {
  const n = distribution.length;
  const bootstrapMeans: number[] = [];
  const bootstrapP95s: number[] = [];

  // Subset for speed if n is very large, keeping it representative for bootstrap
  const maxN = 50000;
  const dataForBootstrap = n > maxN 
    ? Array.from({ length: maxN }, () => distribution[Math.floor(Math.random() * n)])
    : distribution;
  const sampleN = dataForBootstrap.length;

  const chunkSize = 20; 
  for (let b = 0; b < bootstrapCount; b++) {
    if (b % chunkSize === 0 && onProgress) {
      onProgress(Math.floor((b / bootstrapCount) * 100));
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    let sum = 0;
    const resampled: number[] = new Array(sampleN);
    for (let i = 0; i < sampleN; i++) {
      const val = dataForBootstrap[Math.floor(Math.random() * sampleN)];
      resampled[i] = val;
      sum += val;
    }
    bootstrapMeans.push(sum / sampleN);
    
    // Calculate P95 for this bootstrap sample
    resampled.sort((a, b) => a - b);
    const p95Idx = Math.floor(sampleN * 0.95);
    bootstrapP95s.push(resampled[Math.min(sampleN - 1, p95Idx)]);
  }

  if (onProgress) onProgress(100);

  bootstrapMeans.sort((a, b) => a - b);
  bootstrapP95s.sort((a, b) => a - b);

  const lowIdx = Math.floor(bootstrapCount * 0.025);
  const highIdx = Math.floor(bootstrapCount * 0.975);

  return {
    meanCI: [bootstrapMeans[lowIdx], bootstrapMeans[highIdx]],
    p95CI: [bootstrapP95s[lowIdx], bootstrapP95s[highIdx]],
    bootstrapCount
  };
}

export async function runSimulation(
  iterations: number,
  refValue: number,
  refUnit: string,
  bodyWeightParams: DistributionParams,
  foodItems: FoodItem[],
  isExpert: boolean,
  bwKey: string,
  onProgress?: (phase: 'main' | 'bootstrap', p: number) => void
): Promise<SimulationResult> {
  const normalizedRefValue = refUnit === 'μg/kg·día' ? refValue * 0.001 : refValue;
  const totalExposureSamples = new Array(iterations).fill(0);
  const foodExposures = foodItems.map(() => new Array(iterations).fill(0));
  const foodInputs: { name: string; concSamples: number[]; consSamples: number[] }[] = [];

  // Pre-generate body weight samples for all iterations
  const bodyWeightSamples = new Array(iterations);
  
  // Truncation logic for body weight based on category
  let minBW = 0.1;
  if (bwKey === 'adult_male') minBW = 45;
  else if (bwKey === 'adult_female') minBW = 40;
  else if (bwKey === 'child_1_3') minBW = 0.5;
  else if (bwKey === 'child_4_8') minBW = 3;
  else if (bwKey === 'child_9_13') minBW = 8;
  else if (bwKey === 'child_14_18') minBW = 13;

  for (let i = 0; i < iterations; i++) {
    bodyWeightSamples[i] = Math.max(minBW, getSample(bodyWeightParams));
  }

  // Pre-generate raw samples for all foods
  for (let fIdx = 0; fIdx < foodItems.length; fIdx++) {
    const food = foodItems[fIdx];
    let concSamples = new Array(iterations);
    let consSamples = new Array(iterations);
    
    // Sampling loop
    for (let i = 0; i < iterations; i++) {
        concSamples[i] = getSample(food.concentration);
        consSamples[i] = getSample(food.consumption);
    }

    // Apply Rank Correlation if specified
    if (food.correlation !== 0) {
        const correlated = induceRankCorrelation(concSamples, consSamples, food.correlation);
        concSamples = correlated.correlatedA;
        consSamples = correlated.correlatedB;
    }

    foodInputs.push({ name: food.name, concSamples, consSamples });

    // Calculate exposures for this food across all iterations
    const chunkSize = Math.max(5000, Math.floor(iterations / 10));
    for (let i = 0; i < iterations; i++) {
      if (i % chunkSize === 0 && onProgress) {
        // Progress based on total food items and iterations
        const progress = ((fIdx * iterations + i) / (foodItems.length * iterations)) * 100;
        onProgress('main', Math.floor(progress));
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const normConcValue = normalizeUnit(concSamples[i], food.concentrationUnit, 'concentration');
      const normCons = normalizeUnit(consSamples[i], food.consumptionUnit, 'consumption');
      
      let normConc = normConcValue;

      // Censored Data Handling (LOD/LOQ)
      if (food.lod !== undefined && normConc < normalizeUnit(food.lod, food.concentrationUnit, 'concentration')) {
        const normLod = normalizeUnit(food.lod, food.concentrationUnit, 'concentration');
        if (food.censoredMethod === 'zero') normConc = 0;
        else if (food.censoredMethod === 'lod_half') normConc = normLod / 2;
        else if (food.censoredMethod === 'lod') normConc = normLod;
      }

      // Apply Processing Factor
      if (food.processingFactor !== undefined && food.processingFactor !== 1) {
        normConc *= food.processingFactor;
      }
      
      let exposure = (normConc * normCons) / bodyWeightSamples[i];
      
      // Apply Probabilistic Reduction Factor
      if (food.hasReduction) {
        if (Math.random() < (food.reductionProb / 100)) {
          exposure *= (1 - (food.reductionEff / 100));
        }
      }
      
      foodExposures[fIdx][i] = exposure;
      totalExposureSamples[i] += exposure;
    }
  }

  if (onProgress) onProgress('main', 100);

  const totalMeanExposure = totalExposureSamples.reduce((a, b) => a + b, 0) / iterations;
  const meanContributions = foodItems.map((food, index) => {
    const foodMean = foodExposures[index].reduce((a, b) => a + b, 0) / iterations;
    return {
      name: food.name,
      exposure: foodMean,
      percentage: totalMeanExposure > 0 ? (foodMean / totalMeanExposure) * 100 : 0
    };
  });

  const riskResults = totalExposureSamples.map(exp => (normalizedRefValue > 0 ? (exp / normalizedRefValue) * 100 : Infinity));
  const sortedRisks = new Float64Array(riskResults).sort();
  const sum = riskResults.reduce((a, b) => a + b, 0);
  const mean = sum / iterations;
  const stdDev = Math.sqrt(riskResults.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / iterations);

  const getP = (p: number) => {
    const idx = Math.floor(iterations * (p / 100));
    return sortedRisks[Math.min(iterations - 1, idx)];
  };

  const p95Exposure = (getP(95) / 100) * normalizedRefValue;

  const riskStats: SimulationStats = {
    mean,
    stdDev,
    median: getP(50),
    p5: getP(5),
    p25: getP(25),
    p75: getP(75),
    p90: getP(90),
    p95: getP(95),
    p975: getP(97.5),
    p99: getP(99),
    max: sortedRisks[iterations - 1],
    marginOfSafety: p95Exposure > 0 ? normalizedRefValue / p95Exposure : undefined,
    hazardQuotient: normalizedRefValue > 0 ? p95Exposure / normalizedRefValue : undefined
  };

  let uncertainty = undefined;
  if (isExpert) {
    uncertainty = await calculateUncertainty(riskResults, 200, (p) => {
      if (onProgress) onProgress('bootstrap', p);
    });
  }

  return {
    riskStats,
    riskDistribution: riskResults, 
    uncertainty,
    meanContributions,
    normalizedRefValue,
    isExpert,
    simulationData: { totalExposureSamples, foodInputs }
  };
}
