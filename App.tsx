
import React, { useState, useEffect, useRef } from 'react';
import { PREDEFINED_CHEMICALS, BODY_WEIGHT_PRESETS, PREDEFINED_FOOD_DATA, REDUCTION_TOOLTIPS } from './constants';
import { FoodItem, DistributionType, DistributionParams, SimulationResult, Language, UncertaintyStats } from './types';
import DistributionInput from './components/DistributionInput';
import ResultsPanel from './components/ResultsPanel';
import UserManual from './components/UserManual';
import { runSimulation } from './services/simulationService';
import { validateDistribution } from './services/mathUtils';
import { TRANSLATIONS } from './locales';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('es');
  const [activeTab, setActiveTab] = useState<'simulation' | 'table' | 'form'>('simulation');
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS[language];

  // General Params
  const [chemicalKey, setChemicalKey] = useState('custom');
  const [customChemicalName, setCustomChemicalName] = useState('');
  const [adi, setAdi] = useState<string>('');
  const [adiUnit, setAdiUnit] = useState('mg/kg·día');
  const [bwKey, setBwKey] = useState('adult_male');
  const [bwDistType, setBwDistType] = useState<DistributionType>('deterministic');
  const [bwParams, setBwParams] = useState<DistributionParams>({ type: 'deterministic', value: 75 });
  const [iterations, setIterations] = useState<string>('10000');
  const [numSimulations, setNumSimulations] = useState<string>('1');
  
  // Food Management
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [currentFoodName, setCurrentFoodName] = useState('');
  const [currentFoodSelect, setCurrentFoodSelect] = useState('custom');
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  
  // Distribution Inputs for new Food
  const [concDistType, setConcDistType] = useState<DistributionType>('triangular');
  const [concParams, setConcParams] = useState<DistributionParams>({ type: 'triangular' });
  const [concUnit, setConcUnit] = useState('mg/kg');
  
  const [consDistType, setConsDistType] = useState<DistributionType>('triangular');
  const [consParams, setConsParams] = useState<DistributionParams>({ type: 'triangular' });
  const [consUnit, setConsUnit] = useState('g/día');
  
  const [correlation, setCorrelation] = useState(0);

  // Reduction Factor
  const [hasReduction, setHasReduction] = useState(false);
  const [reductionName, setReductionName] = useState('');
  const [reductionProb, setReductionProb] = useState<string>('100');
  const [reductionEff, setReductionEff] = useState<string>('0');
  
  // Expert Parameters State
  const [lod, setLod] = useState<string>('');
  const [loq, setLoq] = useState<string>('');
  const [censoredMethod, setCensoredMethod] = useState<'zero' | 'lod_half' | 'lod'>('lod_half');
  const [processingFactor, setProcessingFactor] = useState<string>('');
  
  // Progress tracking
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [calcPhase, setCalcPhase] = useState<'main' | 'bootstrap'>('main');

  // Results
  const [results, setResults] = useState<SimulationResult | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  const handleChemicalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setChemicalKey(val);
    if (PREDEFINED_CHEMICALS[val]) {
      setAdi(PREDEFINED_CHEMICALS[val].adi.toString());
      setAdiUnit(PREDEFINED_CHEMICALS[val].unit);
      setCustomChemicalName('');
    } else if (val === 'custom') {
      setAdi('');
      setCustomChemicalName('');
    }
  };

  const handleBwChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setBwKey(val);
    if (BODY_WEIGHT_PRESETS[val]) {
      const weight = BODY_WEIGHT_PRESETS[val]!;
      setBwDistType('deterministic');
      setBwParams({ type: 'deterministic', value: weight });
    }
  };

  const handleFoodSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentFoodSelect(val);
    
    if (val === 'custom') {
      setCurrentFoodName('');
      setHasReduction(false);
      setReductionName('');
      setReductionProb('100');
      setReductionEff('0');
    } else {
      const preset = PREDEFINED_FOOD_DATA[val];
      if (preset) {
        setConcDistType(preset.concentration.type);
        setConcParams(preset.concentration);
        setConcUnit(preset.concentrationUnit);
        
        setConsDistType(preset.consumption.type);
        setConsParams(preset.consumption);
        setConsUnit(preset.consumptionUnit);

        if (preset.reduction) {
          setHasReduction(true);
          setReductionName(preset.reduction.name);
          setReductionProb(preset.reduction.prob.toString());
          setReductionEff(preset.reduction.eff.toString());
        } else {
          setHasReduction(false);
          setReductionName('');
          setReductionProb('100');
          setReductionEff('0');
        }
      }
    }
  };

  const getAdiError = () => {
    if (!adi) return null; 
    const val = parseFloat(adi);
    if (isNaN(val) || val <= 0) return t.validation.positive;
    return null;
  };

  const getBodyWeightError = () => {
    const distError = validateDistribution(bwDistType, bwParams);
    if (distError) return t.validation[distError as keyof typeof t.validation] || distError;
    
    let minBW = 0.1;
    if (bwKey === 'adult_male') minBW = 45;
    else if (bwKey === 'adult_female') minBW = 40;
    else if (bwKey === 'child_1_3') minBW = 0.5;
    else if (bwKey === 'child_4_8') minBW = 3;
    else if (bwKey === 'child_9_13') minBW = 8;
    else if (bwKey === 'child_14_18') minBW = 13;

    if (bwDistType === 'deterministic' && bwParams.value !== undefined) {
      if (bwParams.value < minBW || bwParams.value > 600) {
        return t.validation.rangeBW.replace('{min}', minBW.toString());
      }
    }
    return null;
  };

  const getIterationsError = () => {
    if (!iterations) return null;
    const val = parseInt(iterations);
    if (isNaN(val) || val < 1000 || val > 1000000) return t.validation.rangeIter;
    return null;
  };

  const adiError = getAdiError();
  const bwError = getBodyWeightError();
  const iterError = getIterationsError();

  const getNumSimulationsError = () => {
    const val = parseInt(numSimulations);
    if (isNaN(val) || val < 1 || val > 100) return true;
    return null;
  };

  const isFormValid = () => {
    if (!adi || adiError) return false;
    if (!iterations || iterError) return false;
    if (!numSimulations || getNumSimulationsError()) return false;
    if (validateDistribution(bwDistType, bwParams)) return false;
    if (foodItems.length === 0) return false;
    return true;
  };

  const canAddFood = () => {
    const name = currentFoodSelect === 'custom' ? currentFoodName : currentFoodSelect;
    if (!name) return false;
    if (validateDistribution(concDistType, concParams)) return false;
    if (validateDistribution(consDistType, consParams)) return false;
    if (hasReduction) {
        if (!reductionName) return false;
        const prob = parseFloat(reductionProb);
        const eff = parseFloat(reductionEff);
        if (isNaN(prob) || prob < 0 || prob > 100) return false;
        if (isNaN(eff) || eff < 0 || eff > 100) return false;
    }
    return true;
  };

  const addFood = () => {
    if (!canAddFood()) return;
    
    const displayName = currentFoodSelect === 'custom' 
        ? currentFoodName 
        : (t.foodNames[currentFoodSelect as keyof typeof t.foodNames] || currentFoodSelect);

    const foodData = {
      name: displayName,
      concentration: { ...concParams, type: concDistType },
      concentrationUnit: concUnit,
      consumption: { ...consParams, type: consDistType },
      consumptionUnit: consUnit,
      correlation,
      hasReduction,
      reductionName: hasReduction ? reductionName : '',
      reductionProb: hasReduction ? parseFloat(reductionProb) : 0,
      reductionEff: hasReduction ? parseFloat(reductionEff) : 0,
      lod: lod ? parseFloat(lod) : undefined,
      loq: loq ? parseFloat(loq) : undefined,
      censoredMethod: lod ? censoredMethod : undefined,
      processingFactor: processingFactor ? parseFloat(processingFactor) : undefined
    };

    if (editingFoodId) {
      setFoodItems(foodItems.map(f => f.id === editingFoodId ? { ...f, ...foodData } : f));
      setEditingFoodId(null);
    } else {
      setFoodItems([...foodItems, { ...foodData, id: Date.now().toString() }]);
    }

    setCurrentFoodName('');
    setCurrentFoodSelect('custom');
    setCorrelation(0);
    setHasReduction(false);
    setReductionName('');
    setReductionProb('100');
    setReductionEff('0');
  };

  const editFood = (food: FoodItem) => {
    setEditingFoodId(food.id);
    
    // Check if name matches a preset
    const presetKey = Object.keys(PREDEFINED_FOOD_DATA).find(key => {
        const presetName = t.foodNames[key as keyof typeof t.foodNames] || key;
        return presetName === food.name;
    });

    if (presetKey) {
        setCurrentFoodSelect(presetKey);
        setCurrentFoodName('');
    } else {
        setCurrentFoodSelect('custom');
        setCurrentFoodName(food.name);
    }

    setConcDistType(food.concentration.type);
    setConcParams(food.concentration);
    setConcUnit(food.concentrationUnit);
    
    setConsDistType(food.consumption.type);
    setConsParams(food.consumption);
    setConsUnit(food.consumptionUnit);
    
    setCorrelation(food.correlation || 0);
    setHasReduction(food.hasReduction);
    setReductionName(food.reductionName || '');
    setReductionProb(food.reductionProb?.toString() || '100');
    setReductionEff(food.reductionEff?.toString() || '0');
    
    setLod(food.lod?.toString() || '');
    setLoq(food.loq?.toString() || '');
    setCensoredMethod(food.censoredMethod || 'lod_half');
    setProcessingFactor(food.processingFactor?.toString() || '');
    
    setActiveTab('form');
  };

  const cancelEdit = () => {
    setEditingFoodId(null);
    setCurrentFoodName('');
    setCurrentFoodSelect('custom');
    setCorrelation(0);
    setHasReduction(false);
    setReductionName('');
    setReductionProb('100');
    setReductionEff('0');
    setLod('');
    setLoq('');
    setCensoredMethod('lod_half');
    setProcessingFactor('');
  };

  const removeFood = (id: string) => {
    setFoodItems(foodItems.filter(f => f.id !== id));
  };

  const handleCalculate = async () => {
    if (!isFormValid()) return;
    setIsCalculating(true);
    setCalcProgress(0);
    setCalcPhase('main');

    try {
      const nSims = parseInt(numSimulations);
      const iters = parseInt(iterations);
      
      if (nSims === 1) {
        const res = await runSimulation(
          iters,
          parseFloat(adi),
          adiUnit,
          bwParams,
          foodItems,
          expertMode,
          bwKey,
          (phase, p) => {
            setCalcPhase(phase);
            setCalcProgress(p);
          }
        );
        setResults(res);
      } else {
        // Multiple simulations
        const allResults: SimulationResult[] = [];
        for (let i = 0; i < nSims; i++) {
          const res = await runSimulation(
            iters,
            parseFloat(adi),
            adiUnit,
            bwParams,
            foodItems,
            false, // Disable bootstrap for individual simulations to save time
            bwKey,
            (phase, p) => {
              setCalcPhase('main');
              setCalcProgress(Math.floor(((i * 100) + p) / nSims));
            }
          );
          allResults.push(res);
        }

        // Aggregate results efficiently
        const totalIters = nSims * iters;
        const combinedExposureSamples = new Float64Array(totalIters);
        let offset = 0;
        allResults.forEach(r => {
          if (r.simulationData) {
            combinedExposureSamples.set(r.simulationData.totalExposureSamples, offset);
            offset += r.simulationData.totalExposureSamples.length;
          }
        });

        const normalizedRefValue = allResults[0].normalizedRefValue;
        const riskResults = new Float64Array(totalIters);
        let sum = 0;
        for (let i = 0; i < totalIters; i++) {
          const risk = normalizedRefValue > 0 ? (combinedExposureSamples[i] / normalizedRefValue) * 100 : Infinity;
          riskResults[i] = risk;
          if (Number.isFinite(risk)) sum += risk;
        }
        
        const mean = sum / totalIters;
        
        let sumSqDiff = 0;
        for (let i = 0; i < totalIters; i++) {
          const val = riskResults[i];
          if (Number.isFinite(val)) {
            sumSqDiff += Math.pow(val - mean, 2);
          }
        }
        const stdDev = Math.sqrt(sumSqDiff / totalIters);

        // Efficient sort
        const sortedRisks = new Float64Array(riskResults).sort();

        const getP = (p: number) => {
          const idx = Math.floor(totalIters * (p / 100));
          return sortedRisks[Math.min(totalIters - 1, idx)];
        };

        const p95Exposure = (getP(95) / 100) * normalizedRefValue;

        const riskStats = {
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
          max: sortedRisks[totalIters - 1],
          marginOfSafety: p95Exposure > 0 ? normalizedRefValue / p95Exposure : undefined,
          hazardQuotient: normalizedRefValue > 0 ? p95Exposure / normalizedRefValue : undefined
        };

        // For uncertainty in multiple simulations, we can use the variability between simulations
        const p95s = allResults.map(r => r.riskStats.p95).sort((a, b) => a - b);
        const means = allResults.map(r => r.riskStats.mean).sort((a, b) => a - b);
        
        const uncertainty: UncertaintyStats = {
          meanCI: [means[Math.floor(nSims * 0.025)], means[Math.floor(nSims * 0.975)]],
          p95CI: [p95s[Math.floor(nSims * 0.025)], p95s[Math.floor(nSims * 0.975)]],
          bootstrapCount: nSims
        };

        const allSimResults = allResults.map(r => ({
          p95: r.riskStats.p95,
          mean: r.riskStats.mean,
          p50: r.riskStats.median,
          p99: r.riskStats.p99
        }));

        setResults({
          ...allResults[0],
          riskStats,
          riskDistribution: Array.from(riskResults), // Convert back to regular array for component compatibility if needed
          uncertainty: expertMode ? uncertainty : undefined,
          simulationData: {
            totalExposureSamples: Array.from(combinedExposureSamples),
            foodInputs: allResults[0].simulationData!.foodInputs
          },
          allSimulationResults: allSimResults
        });
      }
    } catch (e) {
      console.error(e);
      alert('Error during calculation');
    } finally {
      setIsCalculating(false);
    }
  };

  const formatDist = (p: DistributionParams) => {
    switch (p.type) {
        case 'deterministic': return `${p.value}`;
        case 'uniform': return `U(${p.min}, ${p.max})`;
        case 'triangular': return `T(${p.min}, ${p.mode}, ${p.max})`;
        case 'pert': return `P(${p.min}, ${p.mode}, ${p.max})`;
        case 'normal': return `N(${p.mean}, ${p.stdDev})`;
        case 'lognormal': return `LN(${p.mu}, ${p.sigma})`;
        default: return p.type.substring(0,2).toUpperCase();
    }
  };

  const handleExportFoodListCSV = () => {
    if (foodItems.length === 0) return;
    const headers = ["Nombre", "Dist. Conc.", "Unidad Conc.", "Dist. Cons.", "Unidad Cons.", "Corr.", "Reducción", "Prob. Red (%)", "Efic. Red (%)"];
    const rows = foodItems.map(f => [
      `"${f.name}"`,
      `"${formatDist(f.concentration)}"`,
      `"${f.concentrationUnit}"`,
      `"${formatDist(f.consumption)}"`,
      `"${f.consumptionUnit}"`,
      f.correlation,
      `"${f.hasReduction ? f.reductionName : '-'}"`,
      f.hasReduction ? f.reductionProb : 0,
      f.hasReduction ? f.reductionEff : 0
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `lista_alimentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFoodListPDF = () => {
    if (foodItems.length === 0) return;
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text("Lista de Alimentos - Montecarlo FoodRisk", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${dateStr}`, 14, 30);
    doc.text(`Químico: ${chemicalKey === 'custom' ? customChemicalName : PREDEFINED_CHEMICALS[chemicalKey]?.name || '-'}`, 14, 36);

    let y = 50;
    const headers = ["Alimento", "Conc.", "Cons.", "Red."];
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(headers[0], 14, y);
    doc.text(headers[1], 60, y);
    doc.text(headers[2], 100, y);
    doc.text(headers[3], 150, y);
    
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    foodItems.forEach((f, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(f.name, 14, y);
      doc.text(`${formatDist(f.concentration)} ${f.concentrationUnit}`, 60, y);
      doc.text(`${formatDist(f.consumption)} ${f.consumptionUnit}`, 100, y);
      doc.text(f.hasReduction ? `${f.reductionName} (${f.reductionEff}%)` : "-", 150, y);
      y += 8;
    });

    doc.save(`lista_alimentos_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSaveTable = () => {
    if (foodItems.length === 0) return;
    const data = JSON.stringify(foodItems, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tabla_alimentos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadTable = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedItems = JSON.parse(content);
        
        // Basic validation
        if (Array.isArray(importedItems)) {
          // We could add more rigorous validation here if needed
          setFoodItems(importedItems);
        } else {
          alert(t.importError);
        }
      } catch (err) {
        console.error("Error loading JSON:", err);
        alert(t.importError);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const currentChemicalName = chemicalKey === 'custom' ? customChemicalName : PREDEFINED_CHEMICALS[chemicalKey]?.name;

  const renderReductionLabel = (label: string, tooltipKey: string) => (
    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center group relative cursor-help w-fit">
      {label}
      <span className="ml-1 flex items-center justify-center w-3 h-3 rounded-full border border-gray-300 text-[8px] font-bold text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
        i
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-white dark:bg-slate-800 rounded shadow-lg border border-gray-200 dark:border-slate-700 text-[10px] normal-case font-normal text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {REDUCTION_TOOLTIPS[tooltipKey] || 'Info'}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white dark:border-t-slate-800"></div>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-[95%] 2xl:max-w-[2000px]">
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-8 border-b border-gray-100 dark:border-slate-800">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                🧪 {t.title}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.description}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl shadow-blue-500/5">
              <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="p-2.5 rounded-xl bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                  <option value="es">🇪🇸 ES</option>
                  <option value="en">🇺🇸 EN</option>
                  <option value="fr">🇫🇷 FR</option>
              </select>
              
              <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

              <button
                  onClick={() => setIsManualOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/25"
                  title={t.userManualBtn}
              >
                  📖 <span>{t.userManualBtn}</span>
              </button>

              <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all text-xl"
              >
                  {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-10">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-40 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md p-1 pb-4 border-b border-transparent">
              <div className="flex space-x-1 bg-gray-200 dark:bg-slate-700 p-1 rounded-xl shadow-inner flex-1 max-w-md">
                {(['simulation', 'table', 'form'] as const).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      activeTab === tab
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {t.tabs[tab]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={handleCalculate}
                  disabled={!isFormValid() || isCalculating}
                  className="flex-1 md:flex-none py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  {isCalculating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{calcProgress}%</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>{t.calcBtn}</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    setFoodItems([]);
                    setResults(null);
                  }}
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-all text-xs"
                  title={t.clearBtn}
                >
                  {t.clearBtn}
                </button>
              </div>
            </div>

            {isCalculating && (
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden shadow-inner animate-in fade-in">
                <div 
                  className={`h-full transition-all duration-300 ${calcPhase === 'main' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                  style={{ width: `${calcProgress}%` }}
                ></div>
              </div>
            )}

            {activeTab === 'simulation' && (
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-left-2">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-slate-700 pb-3">
                  {t.generalParams}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.chemicalLabel} *</label>
                      <div className="flex gap-2">
                          <select 
                          value={chemicalKey} 
                          onChange={handleChemicalChange}
                          className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                          <option value="custom">{t.otherManual}</option>
                          {Object.keys(PREDEFINED_CHEMICALS).map(k => (
                              <option key={k} value={k}>{PREDEFINED_CHEMICALS[k].name}</option>
                          ))}
                          </select>
                      </div>
                      {chemicalKey === 'custom' && (
                          <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-1">
                              <input 
                                  type="text" 
                                  value={customChemicalName}
                                  onChange={(e) => setCustomChemicalName(e.target.value)}
                                  placeholder={t.chemicalNamePlaceholder}
                                  className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                          </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.adiLabel} *</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={adi} 
                          onChange={e => setAdi(e.target.value)}
                          disabled={chemicalKey !== 'custom'}
                          placeholder="> 0"
                          className={`flex-1 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${adiError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                        />
                        <select 
                          value={adiUnit}
                          onChange={e => setAdiUnit(e.target.value)}
                          disabled={chemicalKey !== 'custom'}
                          className="px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="mg/kg·día">mg/kg·d</option>
                          <option value="μg/kg·día">μg/kg·d</option>
                        </select>
                      </div>
                      {adiError && <p className="text-xs text-red-500 mt-1">{adiError}</p>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.bwDistLabel} *</label>
                      <div className="flex gap-2 mb-2">
                        <select 
                          value={bwKey} 
                          onChange={handleBwChange}
                          className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="custom">{t.otherManual}</option>
                          {Object.keys(BODY_WEIGHT_PRESETS).map(k => (
                            <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>
                      <DistributionInput 
                        type={bwDistType}
                        params={bwParams}
                        onParamsChange={(p) => {
                          setBwParams(p);
                        }}
                        onTypeChange={(type) => {
                          setBwDistType(type);
                          setBwParams({ ...bwParams, type });
                        }}
                        isExpert={expertMode}
                        language={language}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t.iterationsLabel} *</label>
                        <input 
                          type="number" 
                          value={iterations}
                          onChange={e => setIterations(e.target.value)}
                          className={`w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border focus:ring-2 focus:ring-blue-500 ${iterError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                        />
                        {iterError && <p className="text-xs text-red-500 mt-1">{iterError}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t.simulationsLabel} *</label>
                        <select 
                          value={numSimulations}
                          onChange={e => setNumSimulations(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                        >
                          {[1, 2, 3, 4, 5, 10, 25, 100].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                  <label className="flex items-center cursor-pointer">
                    <span className="mr-3 text-sm font-medium">{t.expertMode}</span>
                    <div className="relative">
                      <input type="checkbox" checked={expertMode} onChange={() => setExpertMode(!expertMode)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                  </label>
                </div>
              </section>
            )}

            {activeTab === 'form' && (
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-left-2">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-slate-700 pb-3">
                  {t.foodsSection}
                </h2>
                
                <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.foodNameLabel}</label>
                    <select 
                      value={currentFoodSelect}
                      onChange={handleFoodSelectChange}
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="custom">{t.manualOption}</option>
                      <optgroup label={t.foodGroups.cereals}>
                        <option value="Arroz">{t.foodNames['Arroz']}</option>
                        <option value="Maíz">{t.foodNames['Maíz']}</option>
                        <option value="Trigo">{t.foodNames['Trigo']}</option>
                        <option value="Avena">{t.foodNames['Avena']}</option>
                        <option value="Cebada">{t.foodNames['Cebada']}</option>
                        <option value="Centeno">{t.foodNames['Centeno']}</option>
                        <option value="Patata">{t.foodNames['Patata']}</option>
                        <option value="Yuca">{t.foodNames['Yuca']}</option>
                        <option value="Pan">{t.foodNames['Pan']}</option>
                        <option value="Pasta">{t.foodNames['Pasta']}</option>
                      </optgroup>
                      <optgroup label={t.foodGroups.vegetables}>
                        <option value="Frijoles">{t.foodNames['Frijoles']}</option>
                        <option value="Lentejas">{t.foodNames['Lentejas']}</option>
                        <option value="Soja">{t.foodNames['Soja']}</option>
                        <option value="Tomate">{t.foodNames['Tomate']}</option>
                        <option value="Zanahoria">{t.foodNames['Zanahoria']}</option>
                        <option value="Lechuga">{t.foodNames['Lechuga']}</option>
                        <option value="Espinaca">{t.foodNames['Espinaca']}</option>
                        <option value="Cebolla">{t.foodNames['Cebolla']}</option>
                        <option value="Ajo">{t.foodNames['Ajo']}</option>
                        <option value="Brócoli">{t.foodNames['Brócoli']}</option>
                        <option value="Pepino">{t.foodNames['Pepino']}</option>
                        <option value="Pimiento">{t.foodNames['Pimiento']}</option>
                        <option value="Repollo">{t.foodNames['Repollo']}</option>
                        <option value="Coliflor">{t.foodNames['Coliflor']}</option>
                        <option value="Berenjena">{t.foodNames['Berenjena']}</option>
                        <option value="Calabacín">{t.foodNames['Calabacín']}</option>
                        <option value="Champiñón">{t.foodNames['Champiñón']}</option>
                        <option value="Calabaza">{t.foodNames['Calabaza']}</option>
                        <option value="Guisantes">{t.foodNames['Guisantes']}</option>
                        <option value="Garbanzos">{t.foodNames['Garbanzos']}</option>
                        <option value="Espárrago">{t.foodNames['Espárrago']}</option>
                        <option value="Alcachofa">{t.foodNames['Alcachofa']}</option>
                        <option value="Apio">{t.foodNames['Apio']}</option>
                        <option value="Rábano">{t.foodNames['Rábano']}</option>
                        <option value="Remolacha">{t.foodNames['Remolacha']}</option>
                        <option value="Acelga">{t.foodNames['Acelga']}</option>
                        <option value="Puerro">{t.foodNames['Puerro']}</option>
                        <option value="Col de Bruselas">{t.foodNames['Col de Bruselas']}</option>
                        <option value="Habas">{t.foodNames['Habas']}</option>
                        <option value="Judías Verdes">{t.foodNames['Judías Verdes']}</option>
                      </optgroup>
                      <optgroup label={t.foodGroups.fruits}>
                        <option value="Manzana">{t.foodNames['Manzana']}</option>
                        <option value="Banano">{t.foodNames['Banano']}</option>
                        <option value="Naranja">{t.foodNames['Naranja']}</option>
                        <option value="Uva">{t.foodNames['Uva']}</option>
                        <option value="Fresa">{t.foodNames['Fresa']}</option>
                        <option value="Piña">{t.foodNames['Piña']}</option>
                        <option value="Sandía">{t.foodNames['Sandía']}</option>
                        <option value="Melón">{t.foodNames['Melón']}</option>
                        <option value="Melocotón">{t.foodNames['Melocotón']}</option>
                        <option value="Pera">{t.foodNames['Pera']}</option>
                        <option value="Limón">{t.foodNames['Limón']}</option>
                        <option value="Cereza">{t.foodNames['Cereza']}</option>
                        <option value="Kiwi">{t.foodNames['Kiwi']}</option>
                        <option value="Mango">{t.foodNames['Mango']}</option>
                        <option value="Aguacate">{t.foodNames['Aguacate']}</option>
                        <option value="Arándano">{t.foodNames['Arándano']}</option>
                        <option value="Frambuesa">{t.foodNames['Frambuesa']}</option>
                        <option value="Mora">{t.foodNames['Mora']}</option>
                        <option value="Granada">{t.foodNames['Granada']}</option>
                        <option value="Higo">{t.foodNames['Higo']}</option>
                        <option value="Papaya">{t.foodNames['Papaya']}</option>
                        <option value="Guayaba">{t.foodNames['Guayaba']}</option>
                        <option value="Maracuyá">{t.foodNames['Maracuyá']}</option>
                        <option value="Pitaya">{t.foodNames['Pitaya']}</option>
                        <option value="Albaricoque">{t.foodNames['Albaricoque']}</option>
                        <option value="Ciruela">{t.foodNames['Ciruela']}</option>
                        <option value="Nectarina">{t.foodNames['Nectarina']}</option>
                        <option value="Coco">{t.foodNames['Coco']}</option>
                        <option value="Dátiles">{t.foodNames['Dátiles']}</option>
                      </optgroup>
                      <optgroup label={t.foodGroups.nuts}>
                        <option value="Almendra">{t.foodNames['Almendra']}</option>
                        <option value="Nuez">{t.foodNames['Nuez']}</option>
                        <option value="Cacahuete">{t.foodNames['Cacahuete']}</option>
                        <option value="Pistacho">{t.foodNames['Pistacho']}</option>
                      </optgroup>
                      <optgroup label={t.foodGroups.animal}>
                        <option value="Leche">{t.foodNames['Leche']}</option>
                        <option value="Carne Res">{t.foodNames['Carne Res']}</option>
                        <option value="Carne Pollo">{t.foodNames['Carne Pollo']}</option>
                        <option value="Carne Cerdo">{t.foodNames['Carne Cerdo']}</option>
                        <option value="Carne Cordero">{t.foodNames['Carne Cordero']}</option>
                        <option value="Huevo">{t.foodNames['Huevo']}</option>
                        <option value="Pescado">{t.foodNames['Pescado']}</option>
                        <option value="Marisco">{t.foodNames['Marisco']}</option>
                        <option value="Queso">{t.foodNames['Queso']}</option>
                        <option value="Yogur">{t.foodNames['Yogur']}</option>
                        <option value="Mantequilla">{t.foodNames['Mantequilla']}</option>
                      </optgroup>
                      <optgroup label={t.foodGroups.other}>
                        <option value="Agua">{t.foodNames['Agua']}</option>
                        <option value="Aceite">{t.foodNames['Aceite']}</option>
                        <option value="Café">{t.foodNames['Café']}</option>
                        <option value="Té">{t.foodNames['Té']}</option>
                        <option value="Chocolate">{t.foodNames['Chocolate']}</option>
                        <option value="Miel">{t.foodNames['Miel']}</option>
                        <option value="Azúcar">{t.foodNames['Azúcar']}</option>
                        <option value="Vino">{t.foodNames['Vino']}</option>
                        <option value="Cerveza">{t.foodNames['Cerveza']}</option>
                      </optgroup>
                    </select>
                    {currentFoodSelect === 'custom' && (
                      <input 
                          type="text" 
                          placeholder="Nombre..." 
                          value={currentFoodName}
                          onChange={e => setCurrentFoodName(e.target.value)}
                          className="mt-2 w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  <div className="border border-gray-300 dark:border-slate-600 p-3 rounded-md bg-white dark:bg-slate-800/50">
                    <DistributionInput 
                        label={t.concDistLabel}
                        type={concDistType}
                        params={concParams}
                        unit={concUnit}
                        onTypeChange={setConcDistType}
                        onParamsChange={setConcParams}
                        onUnitChange={setConcUnit}
                        units={['mg/kg', 'μg/kg', 'mg/L', 'μg/L']}
                        isExpert={expertMode}
                        language={language}
                    />
                  </div>

                  <div className="border border-gray-300 dark:border-slate-600 p-3 rounded-md bg-white dark:bg-slate-800/50">
                    <DistributionInput 
                        label={t.consDistLabel}
                        type={consDistType}
                        params={consParams}
                        unit={consUnit}
                        onTypeChange={setConsDistType}
                        onParamsChange={setConsParams}
                        onUnitChange={setConsUnit}
                        units={['g/día', 'kg/día', 'mL/día', 'L/día']}
                        isExpert={expertMode}
                        language={language}
                    />
                  </div>

                  {expertMode && (
                    <div className="animate-in zoom-in-95">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">{t.corrLabel}</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="-0.99" 
                                max="0.99" 
                                step="0.01" 
                                value={correlation}
                                onChange={e => setCorrelation(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className={`text-sm font-mono font-bold w-12 text-center ${correlation > 0 ? 'text-emerald-500' : correlation < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {correlation > 0 ? '+' : ''}{correlation.toFixed(2)}
                            </span>
                        </div>
                    </div>
                  )}

                  {expertMode && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                       <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">{t.lodLabel}</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            step="0.0001"
                            value={lod}
                            onChange={e => setLod(e.target.value)}
                            placeholder="E.g. 0.01"
                            className="flex-1 px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <span className="text-[10px] text-gray-400 self-center">{concUnit}</span>
                        </div>
                        {lod && (
                          <div className="mt-2">
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">{t.censoredMethodLabel}</label>
                            <select 
                              value={censoredMethod}
                              onChange={e => setCensoredMethod(e.target.value as any)}
                              className="w-full px-2 py-1 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="zero">ND = 0</option>
                              <option value="lod_half">ND = LOD / 2</option>
                              <option value="lod">ND = LOD</option>
                            </select>
                          </div>
                        )}
                       </div>
                       <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1">{t.processingFactorLabel}</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={processingFactor}
                            onChange={e => setProcessingFactor(e.target.value)}
                            placeholder="E.g. 0.8 (20% red.)"
                            className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <p className="text-[10px] text-gray-500 italic">Multiplier (1.0 = no change)</p>
                       </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button 
                        onClick={() => setHasReduction(!hasReduction)}
                        className={`w-full py-2 px-4 rounded-md border transition-all flex items-center justify-between ${hasReduction ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : 'bg-white border-gray-300 text-gray-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'}`}
                    >
                        <span className="text-sm font-bold">{t.hasReductionLabel}</span>
                        <span>{hasReduction ? '✅' : '⬜'}</span>
                    </button>

                    {hasReduction && (
                        <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-md border border-blue-100 dark:border-blue-800 space-y-3 animate-in slide-in-from-top-2">
                            <div>
                                {renderReductionLabel(t.reductionNameLabel, 'name')}
                                <input 
                                    type="text" 
                                    value={reductionName}
                                    onChange={e => setReductionName(e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm rounded bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    {renderReductionLabel(t.reductionProbLabel, 'prob')}
                                    <input 
                                        type="number" 
                                        value={reductionProb}
                                        onChange={e => setReductionProb(e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm rounded bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    {renderReductionLabel(t.reductionEffLabel, 'eff')}
                                    <input 
                                        type="number" 
                                        value={reductionEff}
                                        onChange={e => setReductionEff(e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm rounded bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <button 
                    onClick={addFood}
                    disabled={!canAddFood()}
                    className={`flex-1 py-4 px-6 ${editingFoodId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-400 text-white font-black rounded-xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 text-lg`}
                  >
                    {editingFoodId ? `💾 ${t.updateFoodBtn}` : `➕ ${t.addFoodBtn}`}
                  </button>
                  {editingFoodId && (
                    <button 
                      onClick={cancelEdit}
                      className="py-4 px-8 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all"
                    >
                      {t.cancelEditBtn}
                    </button>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'table' && (
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-left-2">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-slate-700 pb-3">
                  <h2 className="text-xl font-semibold">
                    {t.listHeader} ({foodItems.length})
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={handleSaveTable} className="text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1" title={t.saveTableBtn}>
                        💾 JSON
                    </button>
                    <label className="text-xs px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1 cursor-pointer" title={t.loadTableBtn}>
                        📂 JSON
                        <input type="file" accept=".json" onChange={handleLoadTable} className="hidden" />
                    </label>
                    <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                    <button onClick={handleExportFoodListCSV} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                        📊 CSV
                    </button>
                    <button onClick={handleExportFoodListPDF} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                        📄 PDF
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {foodItems.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 italic">{t.noFoods}</p>
                  ) : (
                    foodItems.map(food => (
                      <div key={food.id} className="group p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 flex justify-between items-center hover:border-blue-300 dark:hover:border-blue-800 transition-all">
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">{food.name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="text-[10px] text-gray-500">
                              <strong className="text-gray-400">Conc:</strong> {formatDist(food.concentration)} {food.concentrationUnit}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              <strong className="text-gray-400">Cons:</strong> {formatDist(food.consumption)} {food.consumptionUnit}
                            </span>
                            {expertMode && food.lod !== undefined && (
                                <span className="text-[10px] text-blue-500 font-bold">
                                    LOD: {food.lod} {food.concentrationUnit} ({food.censoredMethod})
                                </span>
                            )}
                            {expertMode && food.processingFactor !== undefined && (
                                <span className="text-[10px] text-indigo-500 font-bold">
                                    Proc: x{food.processingFactor}
                                </span>
                            )}
                            {food.correlation !== 0 && (
                                <span className="text-[10px] text-blue-500 font-bold">
                                    Corr: {food.correlation.toFixed(2)}
                                </span>
                            )}
                            {food.hasReduction && (
                                <span className="text-[10px] text-emerald-500 font-bold">
                                    {food.reductionName} ({food.reductionEff}%)
                                </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => editFood(food)}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            title={t.editBtn}
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => removeFood(food.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

          </div>

          {results && (
            <div ref={resultsRef} className="relative w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              <ResultsPanel 
                  results={results} 
                  language={language}
                  inputSummary={{
                      chemical: currentChemicalName || '-',
                      adi: `${adi} ${adiUnit}`,
                      bw: `${formatDist(bwParams)} kg`,
                      iterations: `${iterations} x ${numSimulations}`
                  }}
              />
            </div>
          )}
        </div>
      </div>
      <footer className="mt-auto py-8 border-t border-gray-200 dark:border-slate-800 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {t.footerText}
        </p>
      </footer>
      <UserManual 
        isOpen={isManualOpen} 
        onClose={() => setIsManualOpen(false)} 
        language={language} 
      />
    </div>
  );
};

export default App;
