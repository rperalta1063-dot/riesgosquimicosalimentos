
export type DistributionType = 
  | 'deterministic' 
  | 'uniform' 
  | 'triangular' 
  | 'pert' 
  | 'normal' 
  | 'lognormal' 
  | 'weibull' 
  | 'exponential'
  | 'erlang' 
  | 'gamma' 
  | 'beta' 
  | 'gumbel' 
  | 'frechet' 
  | 'inverse_weibull';

export interface DistributionParams {
  type: DistributionType;
  value?: number;
  min?: number;
  max?: number;
  mode?: number;
  mean?: number;
  stdDev?: number;
  mu?: number;
  sigma?: number;
  shape?: number;
  scale?: number;
  rate?: number;
  alpha?: number;
  beta?: number;
  gamma?: number; // For PERT
  location?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  concentration: DistributionParams;
  concentrationUnit: string;
  consumption: DistributionParams;
  consumptionUnit: string;
  correlation: number;
  // Probabilistic Reduction Factor
  hasReduction: boolean;
  reductionName: string;
  reductionProb: number; // Probability of occurrence (0-100)
  reductionEff: number;  // Reduction efficiency (0-100)
  
  // Expert Parameters
  lod?: number;          // Limit of Detection
  loq?: number;          // Limit of Quantitation
  censoredMethod?: 'zero' | 'lod_half' | 'lod';
  processingFactor?: number; // Factor multiply concentration
}

export interface SimulationStats {
  mean: number;
  stdDev: number;
  median: number;
  p5: number;
  p25: number;
  p75: number;
  p90: number;
  p95: number;
  p975: number;
  p99: number;
  max: number;
  marginOfSafety?: number; // MOS = ADI / P95 Exposure
  hazardQuotient?: number;  // HQ = P95 Exposure / ADI
}

export interface UncertaintyStats {
  meanCI: [number, number];
  p95CI: [number, number];
  bootstrapCount: number;
}

export interface Contribution {
  name: string;
  exposure: number;
  percentage: number;
}

export interface SimulationResult {
  riskStats: SimulationStats;
  riskDistribution: number[];
  uncertainty?: UncertaintyStats;
  meanContributions: Contribution[];
  normalizedRefValue: number;
  isExpert: boolean;
  simulationData?: {
    foodInputs: { name: string; concSamples: number[]; consSamples: number[] }[];
    totalExposureSamples: number[];
  };
  allSimulationResults?: {
    p95: number;
    mean: number;
    p50: number;
    p99: number;
  }[];
}

export interface ChemicalPreset {
  adi: number;
  unit: string;
  name: string;
}

export interface SavedConfiguration {
  timestamp: number;
  chemicalKey: string;
  customChemicalName: string;
  adi: string;
  adiUnit: string;
  bwKey: string;
  bodyWeight: string;
  bwDistType: DistributionType;
  bwParams: DistributionParams;
  iterations: string;
  foodItems: FoodItem[];
  expertMode: boolean;
}

export type Language = 'es' | 'en' | 'fr';
