
import { ChemicalPreset, DistributionType, DistributionParams } from './types';

export const PREDEFINED_CHEMICALS: Record<string, ChemicalPreset> = {
  // Insecticidas
  'chlorpyrifos': { adi: 0.01, unit: 'mg/kg·día', name: 'Clorpirifos' },
  'deltamethrin': { adi: 0.01, unit: 'mg/kg·día', name: 'Deltametrina' },
  'malathion': { adi: 0.3, unit: 'mg/kg·día', name: 'Malatión' },
  'fipronil': { adi: 0.0002, unit: 'mg/kg·día', name: 'Fipronil' },
  'imidacloprid': { adi: 0.06, unit: 'mg/kg·día', name: 'Imidacloprid' },
  'abamectin': { adi: 0.001, unit: 'mg/kg·día', name: 'Abamectina' },
  'cypermethrin': { adi: 0.02, unit: 'mg/kg·día', name: 'Cipermetrina' },
  'acetamiprid': { adi: 0.07, unit: 'mg/kg·día', name: 'Acetamiprid' },
  'thiamethoxam': { adi: 0.08, unit: 'mg/kg·día', name: 'Tiametoxam' },
  'lambda_cyhalothrin': { adi: 0.0025, unit: 'mg/kg·día', name: 'Lambda-cialotrina' },
  'dimethoate': { adi: 0.001, unit: 'mg/kg·día', name: 'Dimetoato (Insecticida)' },
  'permethrin': { adi: 0.05, unit: 'mg/kg·día', name: 'Permetrina (Insecticida)' },
  'spinosad': { adi: 0.02, unit: 'mg/kg·día', name: 'Spinosad (Insecticida)' },
  'methomyl': { adi: 0.025, unit: 'mg/kg·día', name: 'Metomilo (Insecticida)' },

  // Herbicidas
  'glyphosate': { adi: 0.5, unit: 'mg/kg·día', name: 'Glifosato' },
  'atrazine': { adi: 0.005, unit: 'mg/kg·día', name: 'Atrazina (Herbicida)' },
  '24_d': { adi: 0.01, unit: 'mg/kg·día', name: '2,4-D (Herbicida)' },
  'paraquat': { adi: 0.005, unit: 'mg/kg·día', name: 'Paraquat (Herbicida)' },
  'diuron': { adi: 0.007, unit: 'mg/kg·día', name: 'Diurón (Herbicida)' },
  'linuron': { adi: 0.003, unit: 'mg/kg·día', name: 'Linurón (Herbicida)' },
  'metribuzin': { adi: 0.013, unit: 'mg/kg·día', name: 'Metribuzina (Herbicida)' },
  'pendimethalin': { adi: 0.125, unit: 'mg/kg·día', name: 'Pendimetalina (Herbicida)' },
  'bentazone': { adi: 0.1, unit: 'mg/kg·día', name: 'Bentazona (Herbicida)' },

  // Fungicidas
  'tebuconazole': { adi: 0.03, unit: 'mg/kg·día', name: 'Tebuconazol' },
  'thiabendazole': { adi: 0.1, unit: 'mg/kg·día', name: 'Tiabendazol' },
  'carbendazim': { adi: 0.03, unit: 'mg/kg·día', name: 'Carbendazima' },
  'propiconazole': { adi: 0.07, unit: 'mg/kg·día', name: 'Propiconazol' },
  'boscalid': { adi: 0.04, unit: 'mg/kg·día', name: 'Boscalid' },
  'azoxystrobin': { adi: 0.2, unit: 'mg/kg·día', name: 'Azoxistrobina' },
  'chlorothalonil': { adi: 0.02, unit: 'mg/kg·día', name: 'Clorotalonil' },
  'cyprodinil': { adi: 0.03, unit: 'mg/kg·día', name: 'Ciprodinil' },
  'difenoconazole': { adi: 0.01, unit: 'mg/kg·día', name: 'Difenoconazol' },
  'captan': { adi: 0.1, unit: 'mg/kg·día', name: 'Captan (Fungicida)' },
  'mancozeb': { adi: 0.05, unit: 'mg/kg·día', name: 'Mancozeb (Fungicida)' },
  'metalaxyl': { adi: 0.08, unit: 'mg/kg·día', name: 'Metalaxil (Fungicida)' },
  'folpet': { adi: 0.1, unit: 'mg/kg·día', name: 'Folpet (Fungicida)' },
  'iprodione': { adi: 0.06, unit: 'mg/kg·día', name: 'Iprodiona (Fungicida)' },
  'pyrimethanil': { adi: 0.17, unit: 'mg/kg·día', name: 'Pirimetanil (Fungicida)' },

  // Micotoxinas y Metales
  'ochratoxin_a': { adi: 14.5, unit: 'μg/kg·día', name: 'Ocratoxina A' },
  'aflatoxin_b1': { adi: 8, unit: 'μg/kg·día', name: 'Aflatoxina B1' },
  'deoxynivalenol': { adi: 1, unit: 'μg/kg·día', name: 'Deoxinivalenol (DON)' },
  'patulin': { adi: 0.4, unit: 'μg/kg·día', name: 'Patulina' },
  'lead': { adi: 5, unit: 'μg/kg·día', name: 'Plomo' },
  'cadmium': { adi: 1, unit: 'μg/kg·día', name: 'Cadmio' },
  'mercury': { adi: 4, unit: 'μg/kg·día', name: 'Mercurio' },
  'methylmercury': { adi: 1.3, unit: 'μg/kg·día', name: 'Metilmercurio' },
  'arsenic': { adi: 4, unit: 'μg/kg·día', name: 'Arsénico' },
  
  // Otros
  'nitrates': { adi: 3.7, unit: 'mg/kg·día', name: 'Nitratos' },
  'bisphenol_a': { adi: 4, unit: 'μg/kg·día', name: 'Bisfenol A' },
  'acrylamide': { adi: 0.17, unit: 'μg/kg·día', name: 'Acrilamida' },
  
  // Veterinarios
  'ivermectin': { adi: 0.001, unit: 'mg/kg·día', name: 'Ivermectina' },
  'oxytetracycline': { adi: 0.03, unit: 'mg/kg·día', name: 'Oxitetraciclina' },
  'doxycycline': { adi: 0.003, unit: 'mg/kg·día', name: 'Doxiciclina' },
  'enrofloxacin': { adi: 0.002, unit: 'mg/kg·día', name: 'Enrofloxacina' }
};

export const BODY_WEIGHT_PRESETS: Record<string, number | null> = {
  'adult_male': 75,
  'adult_female': 65,
  'child_1_3': 12,
  'child_4_8': 22,
  'child_9_13': 40,
  'child_14_18': 60,
  'custom': null
};

export const TOOLTIP_TEXTS: Record<string, string> = {
  deterministic: "Un valor único y fijo, sin variabilidad.",
  uniform: "Todos los valores entre un mínimo y un máximo tienen la misma probabilidad de ocurrir.",
  triangular: "El valor más probable es la 'moda', con valores menos probables hacia el mínimo y el máximo.",
  pert: "Similar a la triangular, pero con una curva más suave. Común en la gestión de proyectos.",
  normal: "La clásica 'curva de campana'. Definida por su media (promedio) y desviación estándar (dispersión).",
  lognormal: "Una distribución donde el logaritmo de la variable se distribuye normalmente. Útil para valores que no pueden ser negativos.",
  weibull: "Una distribución flexible utilizada en análisis de fiabilidad y supervivencia.",
  erlang: "Modela la suma de 'k' variables exponenciales independientes. Usado para tiempos de espera.",
  gamma: "Una distribución flexible para valores positivos. Generalización de Erlang y Exponencial.",
  beta: "Representa valores entre un mínimo y un máximo. Útil para modelar proporciones.",
  gumbel: "Distribución de valor extremo (Tipo I), usada para modelar el máximo (o mínimo) de un conjunto de muestras.",
  frechet: "Distribución de valor extremo (Tipo II), usada para 'eventos raros' con valores muy altos.",
  inverse_weibull: "También conocida como Fréchet. Adecuada para tasas de fallo que decrecen con el tiempo.",
};

export const PARAM_TOOLTIPS: Record<string, string> = {
  value: "El valor único y fijo.",
  min: "El valor más bajo posible.",
  max: "El valor más alto posible.",
  mode: "El valor más frecuente o probable.",
  mean: "El promedio o valor central.",
  stddev: "La desviación estándar. Mide la dispersión.",
  mu: "La media del logaritmo de la variable.",
  sigma: "La desviación estándar del logaritmo.",
  shape: "Parámetro de forma (k o α).",
  scale: "Parámetro de escala (λ, β o s).",
  rate: "Parámetro de tasa (λ o β).",
  alpha: "Primer parámetro de forma (α).",
  beta: "Segundo parámetro de forma (β).",
  gamma: "Parámetro de forma para PERT (std=4).",
  location: "Parámetro de ubicación (μ o m).",
};

export const REDUCTION_TOOLTIPS: Record<string, string> = {
  name: "Nombre identificador del proceso de reducción (ej: Lavado, Cocción, Pelado).",
  prob: "Probabilidad (0-100%) de que este factor se aplique en un evento de consumo determinado (Distribución de Bernoulli).",
  eff: "Porcentaje (0-100%) de reducción de la concentración química si el factor se aplica."
};

interface FoodPreset {
  concentration: { type: DistributionType } & DistributionParams;
  concentrationUnit: string;
  consumption: { type: DistributionType } & DistributionParams;
  consumptionUnit: string;
  reduction?: {
    name: string;
    prob: number;
    eff: number;
  };
}

// Datos de ejemplo genéricos para pre-llenar el formulario
export const PREDEFINED_FOOD_DATA: Record<string, FoodPreset> = {
  // Cereales y Tubérculos
  'Arroz': {
    concentration: { type: 'normal', mean: 0.05, stdDev: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 150, stdDev: 30 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Cocción', prob: 100, eff: 35 }
  },
  'Maíz': {
    concentration: { type: 'lognormal', mu: -3, sigma: 0.5 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 50, mode: 100, max: 200 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Procesamiento', prob: 100, eff: 20 }
  },
  'Trigo': {
    concentration: { type: 'uniform', min: 0.01, max: 0.08 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 200, stdDev: 40 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Molienda/Cocción', prob: 100, eff: 40 }
  },
  'Avena': {
    concentration: { type: 'triangular', min: 0.01, mode: 0.03, max: 0.06 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'uniform', min: 20, max: 60 },
    consumptionUnit: 'g/día'
  },
  'Cebada': {
    concentration: { type: 'uniform', min: 0.01, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 10 },
    consumptionUnit: 'g/día'
  },
  'Centeno': {
    concentration: { type: 'lognormal', mu: -3.5, sigma: 0.4 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 30, stdDev: 8 },
    consumptionUnit: 'g/día'
  },
  'Patata': {
    concentration: { type: 'normal', mean: 0.02, stdDev: 0.005 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 120, stdDev: 25 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado/Cocción', prob: 95, eff: 75 }
  },
  'Yuca': {
    concentration: { type: 'uniform', min: 0.005, max: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 50, mode: 100, max: 250 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado/Lavado/Cocción', prob: 100, eff: 80 }
  },
  'Pan': {
    concentration: { type: 'normal', mean: 0.03, stdDev: 0.008 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 100, stdDev: 20 },
    consumptionUnit: 'g/día'
  },
  'Pasta': {
    concentration: { type: 'uniform', min: 0.01, max: 0.04 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 80, stdDev: 15 },
    consumptionUnit: 'g/día'
  },

  // Verduras y Legumbres
  'Frijoles': {
    concentration: { type: 'lognormal', mu: -4, sigma: 0.6 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 30, mode: 60, max: 100 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Remojo/Cocción', prob: 100, eff: 45 }
  },
  'Lentejas': {
    concentration: { type: 'uniform', min: 0.01, max: 0.03 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 10 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Cocción', prob: 100, eff: 35 }
  },
  'Soja': {
    concentration: { type: 'normal', mean: 0.04, stdDev: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'uniform', min: 10, max: 50 },
    consumptionUnit: 'g/día'
  },
  'Tomate': {
    concentration: { type: 'triangular', min: 0.005, mode: 0.02, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 60, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 95, eff: 40 }
  },
  'Zanahoria': {
    concentration: { type: 'uniform', min: 0.01, max: 0.03 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 30, stdDev: 8 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado/Lavado', prob: 85, eff: 65 }
  },
  'Lechuga': {
    concentration: { type: 'uniform', min: 0.05, max: 0.2 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 10, mode: 30, max: 60 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 45 }
  },
  'Espinaca': {
    concentration: { type: 'normal', mean: 0.1, stdDev: 0.03 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 25, stdDev: 10 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Cocción', prob: 100, eff: 55 }
  },
  'Cebolla': {
    concentration: { type: 'lognormal', mu: -4, sigma: 0.5 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 20, stdDev: 5 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado de capas', prob: 100, eff: 90 }
  },
  'Ajo': {
    concentration: { type: 'uniform', min: 0.01, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 3, stdDev: 1 },
    consumptionUnit: 'g/día'
  },
  'Brócoli': {
    concentration: { type: 'triangular', min: 0.01, mode: 0.05, max: 0.15 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 45, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Cocción', prob: 95, eff: 50 }
  },
  'Pepino': {
    concentration: { type: 'uniform', min: 0.02, max: 0.08 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 50, stdDev: 20 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado/Lavado', prob: 80, eff: 60 }
  },
  'Pimiento': {
    concentration: { type: 'triangular', min: 0.02, mode: 0.08, max: 0.2 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 30, stdDev: 10 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 90, eff: 35 }
  },
  'Repollo': {
    concentration: { type: 'uniform', min: 0.01, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Eliminación capas', prob: 100, eff: 80 }
  },
  'Coliflor': {
    concentration: { type: 'uniform', min: 0.01, max: 0.04 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 35, stdDev: 10 },
    consumptionUnit: 'g/día'
  },
  'Berenjena': {
    concentration: { type: 'normal', mean: 0.03, stdDev: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 50, stdDev: 15 },
    consumptionUnit: 'g/día'
  },
  'Calabacín': {
    concentration: { type: 'normal', mean: 0.02, stdDev: 0.008 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 60, stdDev: 20 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado/Lavado', prob: 70, eff: 45 }
  },
  'Champiñón': {
    concentration: { type: 'lognormal', mu: -3, sigma: 0.6 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'exponential', rate: 0.04 }, // Avg ~25g
    consumptionUnit: 'g/día'
  },
  'Calabaza': {
    concentration: { type: 'lognormal', mu: -3.5, sigma: 0.4 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 30, mode: 80, max: 150 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado/Cocción', prob: 100, eff: 90 }
  },
  'Guisantes': {
    concentration: { type: 'normal', mean: 0.02, stdDev: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 35, stdDev: 10 },
    consumptionUnit: 'g/día'
  },
  'Garbanzos': {
    concentration: { type: 'uniform', min: 0.01, max: 0.04 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 50, stdDev: 15 },
    consumptionUnit: 'g/día'
  },
  'Espárrago': {
    concentration: { type: 'uniform', min: 0.01, max: 0.03 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 30, stdDev: 10 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Cocción', prob: 100, eff: 40 }
  },
  'Alcachofa': {
    concentration: { type: 'normal', mean: 0.02, stdDev: 0.005 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 12 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Cocción', prob: 100, eff: 30 }
  },
  'Apio': {
    concentration: { type: 'uniform', min: 0.05, max: 0.15 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 20, stdDev: 5 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 45 }
  },
  'Rábano': {
    concentration: { type: 'uniform', min: 0.01, max: 0.04 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 15, stdDev: 5 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 30 }
  },
  'Remolacha': {
    concentration: { type: 'normal', mean: 0.03, stdDev: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado/Cocción', prob: 100, eff: 70 }
  },
  'Acelga': {
    concentration: { type: 'uniform', min: 0.05, max: 0.2 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 30, stdDev: 10 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Cocción', prob: 100, eff: 50 }
  },
  'Puerro': {
    concentration: { type: 'uniform', min: 0.02, max: 0.06 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 25, stdDev: 8 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Cocción', prob: 100, eff: 40 }
  },
  'Col de Bruselas': {
    concentration: { type: 'triangular', min: 0.01, mode: 0.04, max: 0.1 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 35, stdDev: 12 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Cocción', prob: 100, eff: 45 }
  },
  'Habas': {
    concentration: { type: 'uniform', min: 0.01, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 45, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Cocción', prob: 100, eff: 35 }
  },
  'Judías Verdes': {
    concentration: { type: 'normal', mean: 0.04, stdDev: 0.015 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 50, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Cocción', prob: 100, eff: 45 }
  },

  // Frutas
  'Manzana': {
    concentration: { type: 'uniform', min: 0.01, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 100, stdDev: 20 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Pelado', prob: 85, eff: 55 }
  },
  'Banano': {
    concentration: { type: 'uniform', min: 0.005, max: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 120, stdDev: 30 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 95 }
  },
  'Naranja': {
    concentration: { type: 'triangular', min: 0.01, mode: 0.03, max: 0.08 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 150, stdDev: 40 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 98 }
  },
  'Uva': {
    concentration: { type: 'normal', mean: 0.05, stdDev: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'uniform', min: 50, max: 150 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 95, eff: 45 }
  },
  'Fresa': {
    concentration: { type: 'lognormal', mu: -2.5, sigma: 0.7 }, // Tiende a tener residuos más altos
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 60, stdDev: 20 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 40 }
  },
  'Piña': {
    concentration: { type: 'uniform', min: 0.01, max: 0.04 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 100, stdDev: 40 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 95 }
  },
  'Sandía': {
    concentration: { type: 'uniform', min: 0.005, max: 0.03 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 100, mode: 250, max: 500 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 99 }
  },
  'Melón': {
    concentration: { type: 'uniform', min: 0.005, max: 0.03 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 100, mode: 200, max: 400 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 99 }
  },
  'Melocotón': {
    concentration: { type: 'normal', mean: 0.04, stdDev: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 120, stdDev: 30 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado/Lavado', prob: 90, eff: 60 }
  },
  'Pera': {
    concentration: { type: 'normal', mean: 0.03, stdDev: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 130, stdDev: 35 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado/Lavado', prob: 80, eff: 65 }
  },
  'Limón': {
    concentration: { type: 'triangular', min: 0.02, mode: 0.05, max: 0.1 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'lognormal', mu: 2, sigma: 0.5 }, // Consumo bajo (zumo/garnish)
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado (solo zumo)', prob: 90, eff: 95 }
  },
  'Cereza': {
    concentration: { type: 'triangular', min: 0.02, mode: 0.06, max: 0.15 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 80, stdDev: 20 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 40 }
  },
  'Kiwi': {
    concentration: { type: 'uniform', min: 0.01, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 70, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 95 }
  },
  'Mango': {
    concentration: { type: 'uniform', min: 0.01, max: 0.04 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 150, stdDev: 40 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 95 }
  },
  'Aguacate': {
    concentration: { type: 'uniform', min: 0.005, max: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 80, stdDev: 30 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 98 }
  },
  'Arándano': {
    concentration: { type: 'normal', mean: 0.05, stdDev: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 10 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 35 }
  },
  'Frambuesa': {
    concentration: { type: 'normal', mean: 0.06, stdDev: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 10 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 35 }
  },
  'Mora': {
    concentration: { type: 'normal', mean: 0.05, stdDev: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 35, stdDev: 10 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 35 }
  },
  'Granada': {
    concentration: { type: 'uniform', min: 0.01, max: 0.03 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 60, stdDev: 20 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 98 }
  },
  'Higo': {
    concentration: { type: 'uniform', min: 0.01, max: 0.04 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 50, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 30 }
  },
  'Papaya': {
    concentration: { type: 'uniform', min: 0.005, max: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 150, stdDev: 40 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 95 }
  },
  'Guayaba': {
    concentration: { type: 'normal', mean: 0.03, stdDev: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 80, stdDev: 25 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 40 }
  },
  'Maracuyá': {
    concentration: { type: 'uniform', min: 0.01, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 50, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado (solo pulpa)', prob: 100, eff: 98 }
  },
  'Pitaya': {
    concentration: { type: 'uniform', min: 0.005, max: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 100, stdDev: 30 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 95 }
  },
  'Albaricoque': {
    concentration: { type: 'normal', mean: 0.04, stdDev: 0.015 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 60, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado/Pelado', prob: 90, eff: 55 }
  },
  'Ciruela': {
    concentration: { type: 'normal', mean: 0.03, stdDev: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 70, stdDev: 20 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 40 }
  },
  'Nectarina': {
    concentration: { type: 'normal', mean: 0.04, stdDev: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 100, stdDev: 25 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Lavado', prob: 100, eff: 40 }
  },
  'Coco': {
    concentration: { type: 'uniform', min: 0, max: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 15 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Pelado', prob: 100, eff: 99 }
  },
  'Dátiles': {
    concentration: { type: 'uniform', min: 0.01, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 30, stdDev: 10 },
    consumptionUnit: 'g/día'
  },

  // Frutos Secos
  'Almendra': {
    concentration: { type: 'uniform', min: 0.01, max: 0.05 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 30, stdDev: 10 },
    consumptionUnit: 'g/día'
  },
  'Nuez': {
    concentration: { type: 'uniform', min: 0.01, max: 0.06 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 25, stdDev: 8 },
    consumptionUnit: 'g/día'
  },
  'Cacahuete': {
    concentration: { type: 'triangular', min: 0.01, mode: 0.05, max: 0.2 }, // Aflatoxins risk
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 35, stdDev: 15 },
    consumptionUnit: 'g/día'
  },
  'Pistacho': {
    concentration: { type: 'uniform', min: 0.01, max: 0.1 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 20, stdDev: 8 },
    consumptionUnit: 'g/día'
  },

  // Origen Animal
  'Leche': {
    concentration: { type: 'lognormal', mu: -5, sigma: 0.4 },
    concentrationUnit: 'mg/L',
    consumption: { type: 'normal', mean: 250, stdDev: 50 },
    consumptionUnit: 'mL/día'
  },
  'Carne Res': {
    concentration: { type: 'normal', mean: 0.02, stdDev: 0.005 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 50, mode: 100, max: 200 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Cocción', prob: 100, eff: 25 }
  },
  'Carne Pollo': {
    concentration: { type: 'uniform', min: 0.01, max: 0.04 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 100, stdDev: 25 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Cocción', prob: 100, eff: 30 }
  },
  'Carne Cerdo': {
    concentration: { type: 'normal', mean: 0.02, stdDev: 0.005 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 50, mode: 100, max: 200 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Cocción', prob: 100, eff: 25 }
  },
  'Carne Cordero': {
    concentration: { type: 'uniform', min: 0.01, max: 0.03 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 80, stdDev: 20 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Cocción', prob: 100, eff: 25 }
  },
  'Huevo': {
    concentration: { type: 'uniform', min: 0.005, max: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 55, stdDev: 10 },
    consumptionUnit: 'g/día'
  },
  'Pescado': {
    concentration: { type: 'lognormal', mu: -2, sigma: 0.8 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'triangular', min: 50, mode: 120, max: 250 },
    consumptionUnit: 'g/día',
    reduction: { name: 'Cocción/Limpieza', prob: 100, eff: 20 }
  },
  'Marisco': {
    concentration: { type: 'lognormal', mu: -1.5, sigma: 0.7 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'exponential', rate: 0.02 },
    consumptionUnit: 'g/día'
  },
  'Queso': {
    concentration: { type: 'uniform', min: 0.02, max: 0.1 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 10 },
    consumptionUnit: 'g/día'
  },
  'Yogur': {
    concentration: { type: 'normal', mean: 0.01, stdDev: 0.003 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 125, stdDev: 25 },
    consumptionUnit: 'g/día'
  },
  'Mantequilla': {
    concentration: { type: 'lognormal', mu: -3, sigma: 0.5 }, // Lipophilic compounds
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 15, stdDev: 5 },
    consumptionUnit: 'g/día'
  },

  // Otros
  'Agua': {
    concentration: { type: 'uniform', min: 0, max: 0.005 },
    concentrationUnit: 'mg/L',
    consumption: { type: 'normal', mean: 2000, stdDev: 500 },
    consumptionUnit: 'mL/día',
    reduction: { name: 'Filtrado', prob: 60, eff: 80 }
  },
  'Aceite': {
    concentration: { type: 'uniform', min: 0.01, max: 0.1 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 30, stdDev: 10 },
    consumptionUnit: 'g/día'
  },
  'Café': {
    concentration: { type: 'normal', mean: 0.08, stdDev: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'lognormal', mu: 4.5, sigma: 0.5 }, // aprox 100-200ml
    consumptionUnit: 'mL/día',
    reduction: { name: 'Tostado/Preparación', prob: 100, eff: 90 }
  },
  'Té': {
    concentration: { type: 'uniform', min: 0.05, max: 0.2 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'lognormal', mu: 4.8, sigma: 0.4 }, // ~200ml
    consumptionUnit: 'mL/día',
    reduction: { name: 'Infusión', prob: 100, eff: 85 }
  },
  'Chocolate': {
    concentration: { type: 'normal', mean: 0.05, stdDev: 0.02 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'exponential', rate: 0.05 }, 
    consumptionUnit: 'g/día'
  },
  'Miel': {
    concentration: { type: 'uniform', min: 0.001, max: 0.01 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'exponential', rate: 0.1 }, // Avg ~10g
    consumptionUnit: 'g/día'
  },
  'Azúcar': {
    concentration: { type: 'deterministic', value: 0.005 },
    concentrationUnit: 'mg/kg',
    consumption: { type: 'normal', mean: 40, stdDev: 10 },
    consumptionUnit: 'g/día'
  },
  'Vino': {
    concentration: { type: 'uniform', min: 0, max: 0.05 },
    concentrationUnit: 'mg/L',
    consumption: { type: 'gamma', shape: 2, rate: 0.01 }, // Occasional consumption model
    consumptionUnit: 'mL/día'
  },
  'Cerveza': {
    concentration: { type: 'uniform', min: 0, max: 0.02 },
    concentrationUnit: 'mg/L',
    consumption: { type: 'gamma', shape: 3, rate: 0.01 },
    consumptionUnit: 'mL/día'
  }
};
