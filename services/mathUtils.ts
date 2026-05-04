
import { DistributionParams, DistributionType } from '../types';

// Helper for standard normal distribution (Box-Muller)
function randomStandardNormal(): number {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

// Helper for random Gamma
function randomGamma(shape: number, rate: number): number {
  if (shape < 1) {
    return randomGamma(1 + shape, rate) * Math.pow(Math.random(), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  let x, v, u;
  while (true) {
    do {
      x = randomStandardNormal();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return (d * v) / rate;
    }
  }
}

// Helper for random Beta
function randomBeta(alpha: number, beta: number): number {
  const a = randomGamma(alpha, 1);
  const b = randomGamma(beta, 1);
  return a / (a + b);
}

export function getSample(params: DistributionParams): number {
  // Handle 'exponential' as a special case of Gamma or directly
  if (params.type === 'exponential') {
    return -Math.log(1 - Math.random()) / (params.rate ?? 1);
  }

  switch (params.type) {
    case 'deterministic':
      return params.value ?? 0;
    case 'uniform':
      return (params.min ?? 0) + Math.random() * ((params.max ?? 0) - (params.min ?? 0));
    case 'triangular': {
      const min = params.min ?? 0;
      const max = params.max ?? 0;
      const mode = params.mode ?? 0;
      const u = Math.random();
      const F = (mode - min) / (max - min);
      if (u < F) {
        return min + Math.sqrt(u * (max - min) * (mode - min));
      } else {
        return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
      }
    }
    case 'pert': {
      const min = params.min ?? 0;
      const max = params.max ?? 0;
      const mode = params.mode ?? 0;
      const gamma = params.gamma ?? 4;
      if (mode === min && mode === max) return mode;
      const alpha = 1 + gamma * (mode - min) / (max - min);
      const betaVal = 1 + gamma * (max - mode) / (max - min);
      const x = randomBeta(alpha, betaVal);
      return min + x * (max - min);
    }
    case 'normal':
      return Math.max(0, (params.mean ?? 0) + (params.stdDev ?? 0) * randomStandardNormal());
    case 'lognormal':
      return Math.exp((params.mu ?? 0) + (params.sigma ?? 0) * randomStandardNormal());
    case 'weibull':
      return (params.scale ?? 0) * Math.pow(-Math.log(1 - Math.random()), 1 / (params.shape ?? 1));
    case 'erlang':
    case 'gamma':
      return randomGamma(params.shape ?? 1, params.rate ?? 1);
    case 'beta':
      return (params.min ?? 0) + randomBeta(params.alpha ?? 1, params.beta ?? 1) * ((params.max ?? 0) - (params.min ?? 0));
    case 'gumbel':
      return (params.location ?? 0) - (params.scale ?? 0) * Math.log(-Math.log(Math.random()));
    case 'frechet':
    case 'inverse_weibull':
      return (params.location ?? 0) + (params.scale ?? 0) * Math.pow(-Math.log(Math.random()), -1 / (params.shape ?? 1));
    default:
      return 0;
  }
}

export function induceRankCorrelation(arrayA: number[], arrayB: number[], rho: number): { correlatedA: number[], correlatedB: number[] } {
  const n = arrayA.length;
  if (rho === 0) return { correlatedA: arrayA, correlatedB: arrayB };

  const sortedA = [...arrayA].sort((a, b) => a - b);
  const sortedB = [...arrayB].sort((a, b) => a - b);

  const c1 = new Array(n);
  const c2 = new Array(n);
  const sqrtRho = Math.sqrt(1 - rho * rho);

  for (let i = 0; i < n; i++) {
    const z1 = randomStandardNormal();
    const z2 = randomStandardNormal();
    c1[i] = z1;
    c2[i] = rho * z1 + sqrtRho * z2;
  }

  const getRanks = (arr: number[]) => {
    const sorted = [...arr].map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    const ranks = new Array(arr.length);
    for (let i = 0; i < sorted.length; i++) {
      ranks[sorted[i][1]] = i;
    }
    return ranks;
  };

  const ranksC1 = getRanks(c1);
  const ranksC2 = getRanks(c2);

  const correlatedA = new Array(n);
  const correlatedB = new Array(n);

  for (let i = 0; i < n; i++) {
    correlatedA[i] = sortedA[ranksC1[i]];
    correlatedB[i] = sortedB[ranksC2[i]];
  }

  return { correlatedA, correlatedB };
}

export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
}

export function validateDistribution(type: DistributionType, params: DistributionParams): string | null {
  const isNum = (v: number | undefined) => typeof v === 'number' && !isNaN(v);
  
  if (type === 'exponential') {
      if (!isNum(params.rate)) return 'Requiere Tasa (rate).';
      return null;
  }

  switch (type) {
    case 'deterministic':
      if (!isNum(params.value)) return 'Requiere un valor.';
      break;
    case 'uniform':
      if (!isNum(params.min) || !isNum(params.max)) return 'Requiere Mín y Máx.';
      if (params.min! >= params.max!) return 'Mín debe ser menor que Máx.';
      break;
    case 'triangular':
      if (!isNum(params.min) || !isNum(params.mode) || !isNum(params.max)) return 'Requiere todos los campos.';
      if (params.min! > params.mode!) return 'Mín no puede ser mayor que Moda.';
      if (params.mode! > params.max!) return 'Moda no puede ser mayor que Máx.';
      if (params.min! >= params.max!) return 'Mín debe ser menor que Máx.';
      break;
    case 'pert':
      if (!isNum(params.min) || !isNum(params.mode) || !isNum(params.max)) return 'Requiere Mín, Moda, Máx.';
      if (params.min! > params.mode!) return 'Mín > Moda.';
      if (params.mode! > params.max!) return 'Moda > Máx.';
      if (params.gamma !== undefined && params.gamma <= 0) return 'Gamma debe ser > 0.';
      break;
    case 'normal':
      if (!isNum(params.mean) || !isNum(params.stdDev)) return 'Requiere Media y Desv. Estándar.';
      if (params.stdDev! < 0) return 'Desv. Estándar no puede ser negativa.';
      break;
    case 'lognormal':
      if (!isNum(params.mu) || !isNum(params.sigma)) return 'Requiere Mu y Sigma.';
      if (params.sigma! <= 0) return 'Sigma debe ser > 0.';
      break;
    case 'weibull':
    case 'inverse_weibull':
      if (!isNum(params.shape) || !isNum(params.scale)) return 'Requiere Forma y Escala.';
      if (params.shape! <= 0) return 'Forma debe ser > 0.';
      if (params.scale! <= 0) return 'Escala debe ser > 0.';
      break;
    case 'erlang':
    case 'gamma':
      if (!isNum(params.shape) || !isNum(params.rate)) return 'Requiere Forma y Tasa.';
      if (params.shape! <= 0) return 'Forma debe ser > 0.';
      if (params.rate! <= 0) return 'Tasa debe ser > 0.';
      break;
    case 'beta':
      if (!isNum(params.min) || !isNum(params.max) || !isNum(params.alpha) || !isNum(params.beta)) return 'Requiere todos los campos.';
      if (params.min! >= params.max!) return 'Mín debe ser menor que Máx.';
      if (params.alpha! <= 0 || params.beta! <= 0) return 'Alpha y Beta deben ser > 0.';
      break;
    case 'gumbel':
      if (!isNum(params.location) || !isNum(params.scale)) return 'Requiere Ubicación y Escala.';
      if (params.scale! <= 0) return 'Escala debe ser > 0.';
      break;
    case 'frechet':
      if (!isNum(params.shape) || !isNum(params.scale) || !isNum(params.location)) return 'Requiere todos los campos.';
      if (params.shape! <= 0) return 'Forma debe ser > 0.';
      if (params.scale! <= 0) return 'Escala debe ser > 0.';
      break;
  }
  return null;
}