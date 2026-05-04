
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ReferenceArea,
  AreaChart, Area, LineChart, Line, CartesianGrid, PieChart, Pie, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { Minimize2, Maximize2, Download, FileText } from 'lucide-react';
import { SimulationResult, Language, SimulationStats, UncertaintyStats } from '../types';
import { calculatePearsonCorrelation } from '../services/mathUtils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { TRANSLATIONS } from '../locales';
import RiskCard from './RiskCard';

interface Props {
  results: SimulationResult | null;
  onRunCorrelation?: (correlations: { name: string; value: number }[]) => void;
  inputSummary?: {
    chemical: string;
    adi: string;
    bw: string;
    iterations: string;
  };
  language: Language;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  totalSamples?: number;
  language: Language;
  riskStats: SimulationStats | null;
}

const kernelGaussian = (u: number) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);

const CONTRIB_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'];

const RiskLegend = ({ language }: { language: Language }) => {
  const t = TRANSLATIONS[language].results.riskLevels;
  const zones = [
    { label: `${t.veryLow} (<25%)`, color: '#10b981' },
    { label: `${t.low} (25-75%)`, color: '#34d399' },
    { label: `${t.moderate} (75-100%)`, color: '#fbbf24' },
    { label: `${t.high} (100-200%)`, color: '#f87171' },
    { label: `${t.veryHigh} (>200%)`, color: '#ef4444' }
  ];
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4 p-3 bg-gray-50/50 dark:bg-slate-900/30 rounded-xl border border-gray-100 dark:border-slate-800/50 backdrop-blur-sm">
      {zones.map(z => (
        <div key={z.label} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: z.color }}></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{z.label}</span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, totalSamples, language, riskStats }: CustomTooltipProps) => {
  const t = TRANSLATIONS[language];
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data) return null;

    const isCDF = data.prob !== undefined;
    const isDensity = data.density !== undefined;
    const isScatter = data.xVal !== undefined && data.yVal !== undefined;
    const isSensitivity = data.pearson !== undefined;
    
    const countPercentage = totalSamples && data.count 
      ? ((data.count / totalSamples) * 100).toFixed(1) 
      : null;

    if (isSensitivity) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-sm z-50 ring-1 ring-black/5">
                <p className="font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-slate-800 pb-2 mb-2">{data.foodName}</p>
                <div className="space-y-1.5">
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{t.results.variableType}:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {data.type === 'conc' ? t.results.concentration : t.results.consumption}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{t.results.pearsonFull}:</span>
                        <span className={`font-mono font-bold ${data.pearson >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {data.pearson.toFixed(3)}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{t.results.strength}:</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {Math.abs(data.pearson) > 0.5 ? t.results.high : Math.abs(data.pearson) > 0.1 ? t.results.moderate : t.results.low}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const statsInBin = [];
    if (!isCDF && !isDensity && !isScatter && riskStats && data.valStart !== undefined && data.valEnd !== undefined) {
        const { mean, median, p25, p75, p95 } = riskStats;
        const s = data.valStart;
        const e = data.valEnd;
        
        if (s <= mean && mean < e) statsInBin.push({ label: t.results.meanRisk, val: mean, color: 'text-blue-600 dark:text-blue-400' });
        if (s <= median && median < e) statsInBin.push({ label: t.results.median, val: median, color: 'text-emerald-600 dark:text-emerald-400' });
        if (s <= p25 && p25 < e) statsInBin.push({ label: 'P25', val: p25, color: 'text-gray-500' });
        if (s <= p75 && p75 < e) statsInBin.push({ label: 'P75', val: p75, color: 'text-gray-500' });
        if (s <= p95 && p95 < e) statsInBin.push({ label: 'P95', val: p95, color: 'text-amber-600 dark:text-amber-400' });
    }
    
    const isSimulations = data.index !== undefined && data.risk !== undefined;

    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-sm z-50 min-w-[200px] ring-1 ring-black/5" data-html2canvas-ignore="true">
        <p className="font-bold text-gray-900 dark:text-gray-100 mb-2 border-b border-gray-100 dark:border-slate-800 pb-2">
          {isCDF ? t.results.cdf : isDensity ? t.results.density : isScatter ? t.results.scatter : isSimulations ? t.results.simulations : label}
        </p>
        <div className="space-y-2.5">
          {isCDF ? (
            <>
               <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{t.results.risk}:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{data.risk?.toFixed(1)}% Ref.</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{t.results.prob}:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{data.prob?.toFixed(1)}%</span>
               </div>
            </>
          ) : isDensity ? (
            <>
               <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{t.results.risk}:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{data.x?.toFixed(1)}% Ref.</span>
               </div>
               <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{t.results.density}:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{data.density?.toExponential(2)}</span>
               </div>
            </>
          ) : isScatter ? (
            <>
               <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px] mb-0.5 uppercase font-bold tracking-wider">{t.results.inputVal}:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-base">{data.xVal?.toFixed(4)}</span>
               </div>
               <div className="flex flex-col mt-1">
                  <span className="text-gray-500 text-[10px] mb-0.5 uppercase font-bold tracking-wider">{t.results.totalRisk}:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-base">{data.yVal?.toFixed(1)}%</span>
               </div>
            </>
          ) : isSimulations ? (
            <>
               <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Simulación:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">#{data.index}</span>
               </div>
               <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">P95:</span>
                  <span className="font-bold text-indigo-600">{data.risk?.toFixed(1)}%</span>
               </div>
               <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Media:</span>
                  <span className="font-bold text-emerald-600">{data.mean?.toFixed(1)}%</span>
               </div>
               <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Mediana:</span>
                  <span className="font-bold text-amber-600">{data.p50?.toFixed(1)}%</span>
               </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-baseline gap-4">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{t.results.freq}:</span>
                <div className="text-right">
                    <span className="font-bold text-gray-900 dark:text-gray-100 block">{data.count}</span>
                    {countPercentage && (
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-tighter">({countPercentage}% total)</span>
                    )}
                </div>
              </div>
              
              {data.midPoint !== undefined && (
                 <div className="flex justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t.results.range}:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-xs font-bold bg-gray-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {data.valStart?.toFixed(1)}% - {data.valEnd?.toFixed(1)}%
                    </span>
                 </div>
              )}

              {statsInBin.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t.results.contains}:</p>
                      {statsInBin.map((stat, i) => (
                          <div key={i} className={`text-xs font-bold flex justify-between ${stat.color}`}>
                              <span>{stat.label}</span>
                              <span>{stat.val.toFixed(1)}%</span>
                          </div>
                      ))}
                  </div>
              )}

              {data.valStart <= 100 && data.valEnd > 100 && (
                <div className="mt-2 p-1.5 bg-red-50 dark:bg-red-900/20 rounded text-center">
                    <p className="text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-1">
                    ⚠️ {t.results.refVal}
                    </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const fmtExp = (val: number) => {
    if (val === 0) return '0';
    return val.toFixed(5);
};

interface SensitivityItem {
    foodName: string;
    type: 'conc' | 'cons';
    pearson: number;
    name: string; // Display name for charts
}

const ResultsPanel: React.FC<Props> = ({ results, onRunCorrelation, inputSummary, language }) => {
  const t = TRANSLATIONS[language];
  const [showDetails, setShowDetails] = useState(false);
  const [chartView, setChartView] = useState<'histogram' | 'density' | 'cdf' | 'comparison' | 'scatter' | 'sensitivity' | 'simulations'>('histogram');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [scatterVariable, setScatterVariable] = useState<string>('');

  useEffect(() => {
    if (results?.simulationData?.foodInputs && results.simulationData.foodInputs.length > 0 && !scatterVariable) {
      setScatterVariable(`${results.simulationData.foodInputs[0].name}|conc`);
    }
  }, [results, scatterVariable]);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const riskCardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const { chartData, cdfData, densityData, refBin, safeRiskStats, safeRefValue, totalSamples, sensitivityData, simulationsData, contributionData } = useMemo(() => {
    if (!results || !results.riskDistribution || results.riskDistribution.length === 0) {
      return { chartData: [], cdfData: [], densityData: [], refBin: null, safeRiskStats: null, safeRefValue: 0, totalSamples: 0, sensitivityData: [], simulationsData: [], contributionData: [] };
    }

    const safeDistribution = results.riskDistribution.filter(n => Number.isFinite(n));
    if (safeDistribution.length === 0) {
       return { chartData: [], cdfData: [], densityData: [], refBin: null, safeRiskStats: results.riskStats, safeRefValue: results.normalizedRefValue, totalSamples: 0, sensitivityData: [], simulationsData: [], comparisonData: [] };
    }

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < safeDistribution.length; i++) {
        const val = safeDistribution[i];
        if (val < min) min = val;
        if (val > max) max = val;
    }
    const range = max - min === 0 ? 1 : max - min;
    const n = safeDistribution.length;

    const iqr = (results.riskStats.p75 || 0) - (results.riskStats.p25 || 0);
    let numBins = iqr > 0 ? Math.ceil(range / (2 * iqr / Math.pow(n, 1/3))) : Math.ceil(1 + Math.log2(n));
    if (!numBins || !Number.isFinite(numBins) || numBins <= 0) numBins = 10;
    numBins = Math.max(5, Math.min(80, numBins));

    const step = range / numBins;
    const bins = Array.from({ length: numBins }, (_, i) => {
        const valStart = min + i * step;
        const valEnd = min + (i + 1) * step;
        return {
            name: `${valStart.toFixed(0)}-${valEnd.toFixed(0)}%`,
            valStart,
            valEnd,
            midPoint: (valStart + valEnd) / 2,
            count: 0
        };
    });

    safeDistribution.forEach(val => {
      let idx = Math.floor((val - min) / step);
      idx = Math.min(idx, numBins - 1);
      if (idx >= 0 && bins[idx]) bins[idx].count++;
    });

    const sorted = new Float64Array(safeDistribution).sort();
    const cData = [];
    const cStep = Math.max(1, Math.floor(sorted.length / 100)); 
    for (let i = 0; i < sorted.length; i += cStep) {
      cData.push({ risk: sorted[i], prob: (i / sorted.length) * 100 });
    }
    if(sorted.length > 0) cData.push({ risk: sorted[sorted.length - 1], prob: 100 });

    const dData = [];
    if (n > 5) {
        const mean = safeDistribution.reduce((a, b) => a + b, 0) / n;
        const variance = safeDistribution.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        const h = 1.06 * (stdDev || 1) * Math.pow(n, -0.2);
        const bandwidth = h || range / 20;
        const densitySteps = 80; 
        const startX = min - bandwidth * 3;
        const endX = max + bandwidth * 3;
        const totalRange = endX - startX;
        const dStep = totalRange / densitySteps;
        
        const sampleN = n > 5000 ? 5000 : n;
        const skip = Math.floor(n / sampleN);
        const samples = [];
        for (let j = 0; j < n; j += skip) samples.push(safeDistribution[j]);

        for (let i = 0; i <= densitySteps; i++) {
            const x = startX + i * dStep;
            let kSum = 0;
            for (let j = 0; j < samples.length; j++) {
              kSum += kernelGaussian((x - samples[j]) / bandwidth);
            }
            dData.push({ x, density: kSum / (samples.length * bandwidth) });
        }
    }

    const rBin = bins.find(bin => 100 >= bin.valStart && 100 < bin.valEnd);

    // Prepare simulations data for the simulations view
    const simulationsData = Array.isArray(results.allSimulationResults) ? results.allSimulationResults.map((res, idx) => ({
      index: idx + 1,
      risk: res.p95,
      p50: res.p50,
      p99: res.p99,
      mean: res.mean
    })) : [];

    // Calculate Sensitivity (Pearson)
    const sensData: SensitivityItem[] = [];
    if (results.simulationData) {
        const totalExp = results.simulationData.totalExposureSamples;
        results.simulationData.foodInputs.forEach(food => {
            sensData.push({ 
                foodName: food.name,
                type: 'conc',
                pearson: calculatePearsonCorrelation(food.concSamples, totalExp),
                name: `${food.name} (${t.results.concentration})`
            });
            sensData.push({ 
                foodName: food.name,
                type: 'cons',
                pearson: calculatePearsonCorrelation(food.consSamples, totalExp),
                name: `${food.name} (${t.results.consumption})`
            });
        });
        sensData.sort((a, b) => Math.abs(b.pearson) - Math.abs(a.pearson));
    }

    const contributionData = results.meanContributions?.map(c => ({
        name: c.name,
        contribution: c.percentage
    })) || [];

    return { 
        chartData: bins, 
        cdfData: cData, 
        densityData: dData, 
        refBin: rBin,
        safeRiskStats: results.riskStats,
        safeRefValue: results.normalizedRefValue,
        totalSamples: n,
        sensitivityData: sensData,
        simulationsData,
        contributionData
    };
  }, [results, language, t]);

  const scatterData = useMemo(() => {
    if (!results?.simulationData || !scatterVariable) return [];
    
    const [foodName, type] = scatterVariable.split('|');
    const food = results.simulationData.foodInputs.find(f => f.name === foodName);
    if (!food || !results.riskDistribution) return [];

    const xSamples = type === 'conc' ? food.concSamples : food.consSamples;
    const ySamples = results.riskDistribution; 

    if (!xSamples || !ySamples || xSamples.length === 0) return [];

    const sampleSize = 1000;
    const step = Math.max(1, Math.floor(xSamples.length / sampleSize));
    const samples = [];
    
    for (let i = 0; i < xSamples.length; i += step) {
      if (i < ySamples.length) {
        samples.push({
          x: xSamples[i],
          y: ySamples[i]
        });
      }
    }
    return samples;
  }, [results, scatterVariable]);

  // Removed redundant useMemo with side effect

    const regressionLine = useMemo(() => {
        if (scatterData.length < 2) return null;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (const p of scatterData) {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumX2 += p.x * p.x;
        }
        const denominator = (scatterData.length * sumX2 - sumX * sumX);
        if (denominator === 0) return null;
        
        const slope = (scatterData.length * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / scatterData.length;
        
        const minX = Math.min(...scatterData.map(p => p.x));
        const maxX = Math.max(...scatterData.map(p => p.x));
        
        return [
            { x: minX, y: slope * minX + intercept },
            { x: maxX, y: slope * maxX + intercept }
        ];
    }, [scatterData]);

  if (!results || !safeRiskStats) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 text-center sticky top-4 transition-colors">
        <div className="text-5xl mb-4">🧪</div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{t.title}</h2>
        <p className="mb-4 text-gray-500 dark:text-gray-400">{t.description}</p>
      </div>
    );
  }

  const { meanContributions, simulationData, uncertainty, isExpert } = results;

  const getColor = (mid: number) => {
    if (mid < 25) return '#10b981'; // Emerald 500
    if (mid < 75) return '#34d399'; // Emerald 400
    if (mid <= 100) return '#fbbf24'; // Amber 400
    if (mid <= 200) return '#f87171'; // Red 400
    return '#ef4444'; // Red 500
  };

  const p95Exposure = (safeRiskStats.p95 / 100) * safeRefValue;
  const meanExposure = (safeRiskStats.mean / 100) * safeRefValue;

  const riskComparisonData = [
    { name: t.results.refVal.replace('100% ', ''), value: safeRefValue, fill: '#64748b' },
    { name: t.results.meanRisk, value: meanExposure, fill: '#3b82f6' },
    { name: 'P95', value: p95Exposure, fill: getColor(safeRiskStats.p95) }
  ];

  const sortedContributions = [...meanContributions].sort((a,b) => b.percentage - a.percentage);

  const captureElement = async (el: HTMLElement) => {
    return html2canvas(el, {
      scale: 3, 
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.body.querySelector('[data-capture-container]') as HTMLElement;
        if (clonedEl) {
           clonedEl.classList.remove('dark');
           clonedEl.style.backgroundColor = '#ffffff';
           clonedEl.style.color = '#000000';
           
           const textElements = clonedEl.querySelectorAll('span, p, h1, h2, h3, h4, th, td');
           textElements.forEach((node: any) => {
             if (!node.classList.contains('text-white')) {
               node.style.color = '#111827'; 
             }
           });

           const statsGrid = clonedEl.querySelector('#statsContainerCapture');
           if (statsGrid) {
             (statsGrid as HTMLElement).style.display = 'block';
           }
        }
      }
    });
  };

  const handleExportPNG = async () => {
    if (!panelRef.current) return;
    setIsExporting(true);
    try {
        const canvas = await captureElement(panelRef.current);
        const link = document.createElement('a');
        link.download = `reporte_riesgo_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) { console.error("Error PNG:", error); }
    setIsExporting(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let currentY = 20;

        const addImageToDoc = (canvas: HTMLCanvasElement, targetY: number) => {
            const imgData = canvas.toDataURL('image/png');
            const pdfImgWidth = pageWidth - (margin * 2);
            const pdfImgHeight = (canvas.height * pdfImgWidth) / canvas.width;
            
            if (targetY + pdfImgHeight > pageHeight - margin) {
                doc.addPage();
                targetY = 20;
            }
            
            doc.addImage(imgData, 'PNG', margin, targetY, pdfImgWidth, pdfImgHeight);
            return targetY + pdfImgHeight + 10; 
        };

        doc.setFontSize(18); doc.setTextColor(40, 40, 40); doc.text('Informe de Evaluación de Riesgos', margin, currentY);
        currentY += 12;

        if (inputSummary) {
            doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.text(t.generalParams, margin, currentY); currentY += 8;
            doc.setFontSize(10); doc.text(`• ${t.chemicalLabel}: ${inputSummary.chemical}`, margin + 5, currentY); currentY += 6;
            doc.text(`• ${t.adiLabel}: ${inputSummary.adi}`, margin + 5, currentY); currentY += 6;
            doc.text(`• ${t.iterationsLabel}: ${inputSummary.iterations}`, margin + 5, currentY); currentY += 12;
        }

        if (riskCardRef.current) {
            const canvas = await captureElement(riskCardRef.current);
            currentY = addImageToDoc(canvas, currentY);
        }

        if (chartRef.current) {
            const canvas = await captureElement(chartRef.current);
            currentY = addImageToDoc(canvas, currentY);
        }

        const wasDetailsVisible = showDetails;
        if (!wasDetailsVisible) {
            setShowDetails(true);
            await new Promise(r => setTimeout(r, 100)); 
        }

        if (statsRef.current) {
            const canvas = await captureElement(statsRef.current);
            currentY = addImageToDoc(canvas, currentY);
        }

        if (!wasDetailsVisible) setShowDetails(false);

        doc.save(`reporte_riesgo_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) { 
        console.error("Error PDF:", error); 
    }
    setIsExporting(false);
  };

  const getCIString = (ci?: [number, number]) => {
      if (!ci) return '-';
      return `[${ci[0].toFixed(1)}%, ${ci[1].toFixed(1)}%]`;
  };

  const statTableRows = [
      { label: t.results.meanRisk, val: safeRiskStats.mean, ci: uncertainty?.meanCI },
      { label: 'P5', val: safeRiskStats.p5 },
      { label: 'P25', val: safeRiskStats.p25 },
      { label: t.results.median, val: safeRiskStats.median },
      { label: 'P75', val: safeRiskStats.p75 },
      { label: 'P90', val: safeRiskStats.p90 },
      { label: 'P95', val: safeRiskStats.p95, ci: uncertainty?.p95CI },
      { label: 'P97.5', val: safeRiskStats.p975 },
      { label: 'P99', val: safeRiskStats.p99 },
      { label: t.results.riskMax, val: safeRiskStats.max },
      { label: t.results.stdDev, val: safeRiskStats.stdDev }
  ];

  const chartInfo = {
    histogram: { 
      title: t.results.histogram, 
      desc: language === 'es' ? "Visualiza la frecuencia de valores de riesgo en intervalos definidos." : "Visualizes the frequency of risk values within defined intervals." 
    },
    density: { 
      title: t.results.density, 
      desc: language === 'es' ? "Representación suavizada de la distribución del riesgo (KDE)." : "Smooth representation of the risk distribution using Kernel Density Estimation." 
    },
    cdf: { 
      title: t.results.cdf, 
      desc: language === 'es' ? "Probabilidad acumulada de que el riesgo sea menor o igual a un valor." : "Shows the cumulative probability that the risk is less than or equal to a value." 
    },
    comparison: { 
      title: t.results.comparison, 
      desc: language === 'es' ? "Comparación directa entre riesgo medio, percentil 95 y límite de referencia." : "Direct comparison between mean risk, percentile 95, and reference limit." 
    },
    scatter: { 
      title: t.results.scatter, 
      desc: language === 'es' ? "Relación entre una variable de entrada y el riesgo total resultante." : "Relationship between an input variable and the resulting total risk." 
    },
    sensitivity: {
      title: t.results.sensitivity,
      desc: language === 'es' ? "Análisis de sensibilidad usando el Coeficiente de Pearson (r) para cada variable de entrada." : "Sensitivity analysis using the Pearson Correlation Coefficient (r) for each input variable."
    },
    simulations: {
      title: t.results.simulations,
      desc: language === 'es' ? "Distribución de los resultados (P95) a través de múltiples simulaciones independientes." : "Distribution of results (P95) across multiple independent simulations."
    }
  };

  const getStrengthLabel = (r: number) => {
    const absR = Math.abs(r);
    if (absR > 0.5) return t.results.high;
    if (absR > 0.1) return t.results.moderate;
    return t.results.low;
  };

  const getStrengthColor = (r: number) => {
    const absR = Math.abs(r);
    if (absR > 0.5) return 'text-emerald-600 dark:text-emerald-400 font-bold';
    if (absR > 0.1) return 'text-blue-600 dark:text-blue-400 font-medium';
    return 'text-gray-400';
  };

  const zoomThreshold = isZoomed ? Math.max(200, safeRiskStats.p95 * 1.25) : 'auto';

  return (
    <div ref={panelRef} data-capture-container className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-all duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{t.results.title}</h2>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2" data-html2canvas-ignore="true">
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['histogram', 'density', 'cdf', 'comparison', 'scatter', 'sensitivity', 'simulations'] as const).map((view) => {
                    if (view === 'simulations' && !Array.isArray(results.allSimulationResults)) return null;
                    return (
                        <button 
                            key={view}
                            onClick={() => setChartView(view)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${chartView === view ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                        >
                            {chartInfo[view].title}
                        </button>
                    );
                })}
            </div>

            {(chartView === 'histogram' || chartView === 'density' || chartView === 'cdf') && (
                <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className={`p-2 rounded-xl transition-all duration-200 border ${isZoomed ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    title={isZoomed ? "Show Full Range" : "Focus on Head (0-200%)"}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                </button>
            )}

            <div className="flex gap-2 ml-2">
                <button onClick={handleExportPNG} disabled={isExporting} className="p-2 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-colors disabled:bg-teal-300 shadow-lg shadow-teal-500/20" title={t.results.exportPNG}>
                   📷
                </button>
                <button onClick={handleExportPDF} disabled={isExporting} className="p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-blue-300 shadow-lg shadow-blue-500/20" title={t.results.exportPDF}>
                    {isExporting ? '...' : '📄'}
                </button>
            </div>
        </div>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        <div ref={riskCardRef}>
            <RiskCard 
            stats={safeRiskStats} 
            uncertainty={uncertainty} 
            language={language} 
            refValue={safeRefValue} 
            />
        </div>

        {results.isExpert && (
            <div className="bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 rounded-3xl p-6 animate-in fade-in">
                <h4 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2">
                   🔍 {t.scientificOverview}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t.exposureMean}</span>
                        <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                            {meanExposure.toFixed(6)} <span className="text-xs font-normal opacity-50">mg/kg·d</span>
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t.exposureP95}</span>
                        <p className="text-xl font-black text-blue-600">
                            {p95Exposure.toFixed(6)} <span className="text-xs font-normal opacity-50">mg/kg·d</span>
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Variación (CV)</span>
                        <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                            {((safeRiskStats.stdDev / safeRiskStats.mean) * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>
        )}

        <div className="relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col mb-6 gap-2 text-center">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{chartInfo[chartView].title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-tight max-w-2xl mx-auto mb-2">{chartInfo[chartView].desc}</p>
                
                <RiskLegend language={language} />

                {chartView === 'scatter' && (
                    <div className="flex justify-center gap-2 mt-2 animate-in zoom-in-95" data-html2canvas-ignore="true">
                        <span className="text-xs text-gray-500 self-center">{t.results.selectVariable}:</span>
                        <select 
                        value={scatterVariable} 
                        onChange={(e) => setScatterVariable(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                        {results.simulationData?.foodInputs.flatMap(food => [
                            <option key={`${food.name}|conc`} value={`${food.name}|conc`}>{food.name} - Conc.</option>,
                            <option key={`${food.name}|cons`} value={`${food.name}|cons`}>{food.name} - Cons.</option>
                        ])}
                        </select>
                    </div>
                )}
            </div>

            <div className="h-[450px] w-full" ref={chartRef}>
                {((chartView === 'histogram' && chartData.length > 0) ||
                  (chartView === 'density' && densityData.length > 0) ||
                  (chartView === 'cdf' && cdfData.length > 0) ||
                  (chartView === 'comparison' && riskComparisonData.length > 0) ||
                  (chartView === 'scatter' && scatterData.length > 0) ||
                  (chartView === 'sensitivity' && sensitivityData.length > 0) ||
                  (chartView === 'simulations' && simulationsData.length > 0)) ? (
                    <ResponsiveContainer width="100%" height="100%">
                    {chartView === 'histogram' ? (
                        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                            <ReferenceArea {...({ x1: 0, x2: 25, fill: "#10b981", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 25, x2: 75, fill: "#34d399", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 75, x2: 100, fill: "#fbbf24", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 100, x2: 200, fill: "#f87171", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 200, fill: "#ef4444", fillOpacity: 0.03 } as any)} />
                            <XAxis 
                                dataKey="midPoint" 
                                type="number"
                                domain={[0, zoomThreshold]}
                                stroke="#94a3b8" 
                                fontSize={10} 
                                tick={{fill: '#94a3b8', fontFamily: 'monospace'}} 
                                tickFormatter={(v) => `${v.toFixed(0)}%`}
                            />
                            <YAxis stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8', fontFamily: 'monospace'}} />
                            <Tooltip content={<CustomTooltip totalSamples={totalSamples} language={language} riskStats={safeRiskStats} />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <ReferenceLine x={100} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" label={{ value: t.results.refVal, position: 'top', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                            <Bar isAnimationActive={!isExporting} dataKey="count" radius={[2, 2, 0, 0]}>
                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={getColor(entry.midPoint)} />))}
                            </Bar>
                        </BarChart>
                    ) : chartView === 'density' ? (
                        <AreaChart data={densityData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                            <ReferenceArea {...({ x1: 0, x2: 25, fill: "#10b981", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 25, x2: 75, fill: "#34d399", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 75, x2: 100, fill: "#fbbf24", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 100, x2: 200, fill: "#f87171", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 200, fill: "#ef4444", fillOpacity: 0.03 } as any)} />
                            <XAxis dataKey="x" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8', fontFamily: 'monospace'}} type="number" domain={[0, zoomThreshold]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                            <YAxis stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8', fontFamily: 'monospace'}} tickFormatter={(v) => v.toFixed(2)} />
                            <Tooltip content={<CustomTooltip totalSamples={totalSamples} language={language} riskStats={safeRiskStats} />} />
                            <ReferenceLine x={100} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" label={{ value: t.results.refVal, position: 'top', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                            <Area isAnimationActive={!isExporting} type="monotone" dataKey="density" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDensity)" />
                        </AreaChart>
                    ) : chartView === 'cdf' ? (
                        <AreaChart data={cdfData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCDF" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                            <ReferenceArea {...({ x1: 0, x2: 25, fill: "#10b981", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 25, x2: 75, fill: "#34d399", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 75, x2: 100, fill: "#fbbf24", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 100, x2: 200, fill: "#f87171", fillOpacity: 0.03 } as any)} />
                            <ReferenceArea {...({ x1: 200, fill: "#ef4444", fillOpacity: 0.03 } as any)} />
                            <XAxis dataKey="risk" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8', fontFamily: 'monospace'}} type="number" domain={[0, zoomThreshold]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                            <YAxis stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8', fontFamily: 'monospace'}} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                            <Tooltip content={<CustomTooltip totalSamples={totalSamples} language={language} riskStats={safeRiskStats} />} />
                            <ReferenceLine x={100} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" label={{ value: t.results.refVal, position: 'top', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                            <ReferenceLine y={0.95} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'P95', position: 'right', fill: '#f59e0b', fontSize: 10 }} />
                            <ReferenceLine y={0.5} stroke="#6366f1" strokeDasharray="3 3" label={{ value: 'P50', position: 'right', fill: '#6366f1', fontSize: 10 }} />
                            <Area isAnimationActive={!isExporting} type="monotone" dataKey="prob" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCDF)" />
                        </AreaChart>
                    ) : chartView === 'comparison' ? (
                        <BarChart data={riskComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                            <YAxis 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickFormatter={(v) => v.toExponential(1)}
                                label={{ value: 'mg/kg·d', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                            />
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-sm">
                                                <p className="font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-slate-800 pb-2 mb-2">{data.name}</p>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-gray-500">Valor:</span>
                                                        <span className="font-mono font-bold text-blue-600">{data.value.toExponential(3)}</span>
                                                    </div>
                                                    {data.name !== t.results.refVal.replace('100% ', '') && (
                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-gray-500">% del Límite:</span>
                                                            <span className="font-bold text-gray-900 dark:text-gray-100">{((data.value / safeRefValue) * 100).toFixed(1)}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} 
                            />
                            <Bar isAnimationActive={!isExporting} dataKey="value" radius={[4, 4, 0, 0]}>
                                {riskComparisonData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : chartView === 'scatter' ? (
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis type="number" dataKey="x" name="Input" stroke="#94a3b8" fontSize={10} label={{ value: scatterVariable.split('|')[1] === 'conc' ? 'Concentration' : 'Consumption', position: 'bottom', offset: 0, fontSize: 10 }} />
                            <YAxis type="number" dataKey="y" name="Risk" stroke="#94a3b8" fontSize={10} label={{ value: 'Risk (%)', angle: -90, position: 'left', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip totalSamples={totalSamples} language={language} riskStats={safeRiskStats} />} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Scatter isAnimationActive={!isExporting} name="Simulaciones" data={scatterData} fill="#6366f1" fillOpacity={0.4} shape="circle" />
                            {regressionLine && (
                                <Line 
                                    name="Tendencia"
                                    data={regressionLine}
                                    dataKey="y"
                                    stroke="#f43f5e" 
                                    strokeWidth={2} 
                                    dot={false} 
                                    activeDot={false} 
                                    legendType="none"
                                    isAnimationActive={false}
                                />
                            )}
                        </ScatterChart>
                    ) : chartView === 'sensitivity' ? (
                        <BarChart data={sensitivityData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                            <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />
                            <XAxis type="number" stroke="#94a3b8" fontSize={10} domain={[-1, 1]} />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                            <Tooltip content={<CustomTooltip totalSamples={totalSamples} language={language} riskStats={safeRiskStats} />} />
                            <Bar isAnimationActive={!isExporting} dataKey="pearson" radius={[0, 4, 4, 0]}>
                                {sensitivityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.pearson > 0 ? '#10b981' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <LineChart data={simulationsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="index" stroke="#94a3b8" fontSize={10} label={{ value: 'Simulación #', position: 'bottom', offset: 0, fontSize: 10 }} />
                            <YAxis stroke="#94a3b8" fontSize={10} label={{ value: 'Riesgo (%)', angle: -90, position: 'left', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip totalSamples={totalSamples} language={language} riskStats={safeRiskStats} />} />
                            <Legend verticalAlign="top" height={36} iconType="plainline" />
                            <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Límite', position: 'right', fill: '#ef4444', fontSize: 10 }} />
                            <Line isAnimationActive={!isExporting} type="monotone" dataKey="risk" name="P95" stroke="#6366f1" strokeWidth={2} dot={false} />
                            <Line isAnimationActive={!isExporting} type="monotone" dataKey="mean" name="Media" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            <Line isAnimationActive={!isExporting} type="monotone" dataKey="p50" name="Mediana" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                        </LineChart>
                    )}
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 italic">
                        {t.results.noData}
                    </div>
                )}
            </div>

            {/* Floating Controls - Bottom Right */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2" data-html2canvas-ignore="true">
                {(['histogram', 'density', 'cdf'].includes(chartView)) && (
                    <button 
                        onClick={() => setIsZoomed(!isZoomed)}
                        className={`p-2.5 rounded-full shadow-lg border transition-all ${isZoomed ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        title={isZoomed ? "Show All" : "Focus (0-200%)"}
                    >
                        {isZoomed ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                )}
                <div className="flex gap-2">
                    <button 
                        onClick={handleExportPNG}
                        disabled={isExporting}
                        className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                        title="Export PNG"
                    >
                        <Download size={18} />
                    </button>
                    <button 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                        title="Export PDF"
                    >
                        <FileText size={18} />
                    </button>
                </div>
            </div>

            {/* Floating View Switcher - Bottom Center */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-fit max-w-[95%] z-10" data-html2canvas-ignore="true">
                <div className="flex flex-nowrap space-x-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
                    {(['histogram', 'density', 'cdf', 'comparison', 'scatter', 'sensitivity', 'simulations'] as const).map((view) => {
                        if (view === 'simulations' && !Array.isArray(results.allSimulationResults)) return null;
                        return (
                            <button 
                                key={view}
                                onClick={() => setChartView(view)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${chartView === view ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                            >
                                {chartInfo[view].title}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>

      {/* Full Statistical Summary Toggle */}
      <div className="flex justify-center pt-2 pb-2" data-html2canvas-ignore="true">
         <button 
           onClick={() => setShowDetails(!showDetails)} 
           className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 group transition-all"
         >
            <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
            {showDetails ? (language === 'es' ? 'Ocultar Análisis Estadístico' : 'Hide Statistical Analysis') : (language === 'es' ? 'Ver Análisis Estadístico Completo' : 'Show Full Statistical Analysis')}
         </button>
      </div>

      {(showDetails || isExporting) && (
        <div ref={statsRef} id="statsContainerCapture" className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Statistics Table Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold mb-6 text-base text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-slate-700 pb-3">{t.results.stats}</h3>
                
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-[10px] font-serif italic uppercase tracking-wider text-gray-500 dark:text-gray-400">Estadístico</th>
                                <th className="px-4 py-3 text-right text-[10px] font-serif italic uppercase tracking-wider text-gray-500 dark:text-gray-400">Resultado (%)</th>
                                {isExpert && uncertainty && (
                                    <th className="px-4 py-3 text-right text-[10px] font-serif italic uppercase tracking-wider text-gray-500 dark:text-gray-400">95% CI (Bootstrap)</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700">
                            {statTableRows.map((row, idx) => (
                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-900/20'}`}>
                                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{row.label}</td>
                                    <td className={`px-4 py-3 text-right font-bold ${row.label === 'P95' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {row.val.toFixed(1)}%
                                    </td>
                                    {isExpert && uncertainty && (
                                        <td className="px-4 py-3 text-right text-xs font-mono text-gray-500 dark:text-gray-400">
                                            {getCIString(row.ci)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Enhanced Pearson Correlation Table Section */}
                <h3 className="font-bold mb-6 text-base text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-slate-700 pb-3 pt-4">
                    {t.results.pearsonFull} (Sensibilidad)
                </h3>
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-[10px] font-serif italic uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.results.inputVal}</th>
                                <th className="px-4 py-3 text-center text-[10px] font-serif italic uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.results.variableType}</th>
                                <th className="px-4 py-3 text-right text-[10px] font-serif italic uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.results.pearson}</th>
                                <th className="px-4 py-3 text-center text-[10px] font-serif italic uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.results.strength}</th>
                                <th className="px-4 py-3 text-center text-[10px] font-serif italic uppercase tracking-wider text-gray-500 dark:text-gray-400">Influencia</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700">
                            {sensitivityData.map((row, idx) => (
                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-900/20'}`}>
                                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">{row.foodName}</td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.type === 'conc' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}`}>
                                        {row.type === 'conc' ? t.results.concentration : t.results.consumption}
                                      </span>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-mono font-bold ${row.pearson >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {row.pearson.toFixed(4)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`text-[11px] ${getStrengthColor(row.pearson)}`}>
                                        {getStrengthLabel(row.pearson)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 min-w-[100px]">
                                            <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2 relative overflow-hidden border border-black/5">
                                                {/* Directional Tornado Bar */}
                                                <div 
                                                    className={`h-full absolute left-1/2 transform -translate-x-1/2 transition-all ${row.pearson >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                    style={{ 
                                                      width: `${Math.abs(row.pearson) * 100}%`,
                                                      // This centers the bar if we want tornado style, but for exposure it's usually positive contribution.
                                                      // We'll stick to a standard fill for clarity.
                                                      left: row.pearson >= 0 ? '50%' : 'auto',
                                                      right: row.pearson < 0 ? '50%' : 'auto',
                                                      transform: 'none'
                                                    }}
                                                ></div>
                                                {/* Center marker */}
                                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 z-10"></div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-bold w-8 text-right">{(Math.abs(row.pearson) * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {uncertainty && (
                    <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300 mb-1">{t.results.uncertainty}</h4>
                        <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-tight">
                            The confidence intervals show the stability of the Monte Carlo result. Based on {uncertainty.bootstrapCount} resampled datasets (Bootstrapping). 
                            A narrow interval indicates that the simulation size ({inputSummary?.iterations}) is sufficient for stable convergence.
                        </p>
                    </div>
                )}
            </div>

            {/* Contributions Section */}
            {meanContributions.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold mb-6 text-base text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-slate-700 pb-3">{t.results.contrib}</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Visualizations Column */}
                    <div className="space-y-8">
                        {/* Pie Chart Box */}
                        <div className="flex flex-col items-center">
                            <div className="h-[240px] w-[240px] relative bg-white dark:bg-slate-50 rounded-full shadow-inner p-2 border border-gray-100">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={sortedContributions} 
                                            dataKey="percentage" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            innerRadius={50} 
                                            outerRadius={100} 
                                            fill="#8884d8" 
                                            paddingAngle={2}
                                            isAnimationActive={!isExporting}
                                        >
                                            {sortedContributions.map((entry, index) => (<Cell key={`cell-${index}`} fill={CONTRIB_COLORS[index % CONTRIB_COLORS.length]} />))}
                                        </Pie>
                                        <Tooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white dark:bg-slate-800 p-2 rounded shadow-lg border border-gray-100 dark:border-slate-700 text-xs">
                                                            <p className="font-bold">{data.name}</p>
                                                            <p className="text-blue-600 dark:text-blue-400">{data.percentage.toFixed(1)}%</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="text-[10px] uppercase tracking-tighter font-bold text-gray-400 block leading-none">Total</span>
                                        <span className="text-xs font-bold text-gray-600">100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contribution Bar Chart */}
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={sortedContributions}
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        stroke="#94a3b8" 
                                        fontSize={10} 
                                        width={80}
                                        tick={{fill: '#94a3b8'}}
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white dark:bg-slate-800 p-2 rounded shadow border border-gray-100 dark:border-slate-700 text-xs">
                                                        <p className="font-bold">{data.name}</p>
                                                        <p>{data.percentage.toFixed(1)}%</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="percentage" barSize={12} radius={[0, 4, 4, 0]}>
                                        {sortedContributions.map((entry, index) => (
                                            <Cell key={`cell-bar-${index}`} fill={CONTRIB_COLORS[index % CONTRIB_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Legend / List Column */}
                    <div className="space-y-3 text-sm">
                        {sortedContributions.map((item, idx) => (
                            <div key={idx} className="border-b border-gray-100 dark:border-slate-700 py-3 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-slate-900/40 px-2 rounded-md transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                  <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-black/5" style={{ backgroundColor: CONTRIB_COLORS[idx % CONTRIB_COLORS.length] }}></div>
                                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</span>
                                </div>
                                <div className="text-right flex-shrink-0 pl-6">
                                  <span className="font-black text-gray-900 dark:text-gray-100 block">{item.percentage.toFixed(1)}%</span>
                                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{fmtExp(item.exposure)} mg/kg·d</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                </div>
            )}

            {/* Scientific conclusion section */}
            {results.isExpert && (
                <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/20 dark:to-slate-900/20 rounded-3xl border border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-2xl shadow-sm border border-indigo-500/20">📜</div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Conclusiones de la Evaluación Técnica</h4>
                            <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-4xl space-y-3">
                                <p>
                                    {safeRiskStats.p95 > 100 
                                        ? "⚠️ La evaluación probabilística indica que los niveles de exposición en el percentil 95 superan el Valor de Referencia Toxicológica (VRT/ADI). Esto sugiere un riesgo potencial inaceptable para el extremo superior de la población evaluada bajo los supuestos actuales."
                                        : "✅ Los resultados sugieren que el riesgo químico es aceptable para la población general, dado que incluso el escenario de exposición del percentil 95 se mantiene por debajo del límite de seguridad establecido."
                                    }
                                </p>
                                <p>
                                    El análisis de sensibilidad (Coeficiente de Pearson) revela que la variable con mayor impacto en la variabilidad del riesgo es <strong>{sensitivityData[0]?.foodName} ({sensitivityData[0]?.type === 'conc' ? 'Concentración' : 'Consumo'})</strong> con un coeficiente de <strong>{sensitivityData[0]?.pearson.toFixed(3)}</strong>. Las intervenciones de mitigación deberían priorizar esta fuente para lograr la mayor reducción efectiva del riesgo.
                                </p>
                                {safeRiskStats.marginOfSafety && (
                                    <p>
                                        El <strong>Margen de Seguridad (MoS)</strong> calculado de <strong>{safeRiskStats.marginOfSafety.toFixed(2)}</strong> {safeRiskStats.marginOfSafety < 1 ? "es insuficiente, lo que refuerza la necesidad de medidas correctoras." : "proporciona una confianza estadística adicional en la inocuidad del escenario evaluado."}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
