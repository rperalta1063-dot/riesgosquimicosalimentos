
import React from 'react';
import { SimulationStats, Language, UncertaintyStats } from '../types';
import { TRANSLATIONS } from '../locales';

interface Props {
  stats: SimulationStats;
  uncertainty?: UncertaintyStats;
  language: Language;
  refValue: number;
}

const RiskCard: React.FC<Props> = ({ stats, uncertainty, language, refValue }) => {
  const t = TRANSLATIONS[language];
  const p95 = stats.p95;

  const getRiskDetails = (val: number) => {
    if (val < 25) return { 
        level: t.results.riskLevels.veryLow, 
        desc: t.results.riskDesc.veryLow, 
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        badge: 'bg-emerald-500',
        pos: '5%'
    };
    if (val < 75) return { 
        level: t.results.riskLevels.low, 
        desc: t.results.riskDesc.low, 
        color: 'text-teal-600 dark:text-teal-400',
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        border: 'border-teal-200 dark:border-teal-800',
        badge: 'bg-teal-500',
        pos: '25%'
    };
    if (val <= 100) return { 
        level: t.results.riskLevels.moderate, 
        desc: t.results.riskDesc.moderate, 
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        badge: 'bg-amber-500',
        pos: '45%'
    };
    if (val <= 200) return { 
        level: t.results.riskLevels.high, 
        desc: t.results.riskDesc.high, 
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        badge: 'bg-red-500',
        pos: '75%'
    };
    return { 
        level: t.results.riskLevels.veryHigh, 
        desc: t.results.riskDesc.veryHigh, 
        color: 'text-red-700 dark:text-red-300',
        bg: 'bg-red-100 dark:bg-red-900/40',
        border: 'border-red-300 dark:border-red-700',
        badge: 'bg-red-700',
        pos: '95%'
    };
  };

  const info = getRiskDetails(p95);
  const p95ExposureValue = (p95 / 100) * refValue;

  const renderLevelTooltip = (level: string, desc: string, badgeClass: string) => (
    <div className="group relative inline-block cursor-help">
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm transition-transform group-hover:scale-105 ${badgeClass}`}>
        {level}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] font-normal leading-tight rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 text-center">
        {desc}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

  return (
    <div className={`rounded-3xl border shadow-2xl p-8 transition-all duration-500 ${info.bg} ${info.border}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="uppercase text-[10px] font-black tracking-[0.2em] text-gray-500/80 dark:text-gray-400/80">
              {t.results.p95risk}
            </h3>
            {renderLevelTooltip(info.level, info.desc, info.badge)}
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-baseline gap-3">
              <span className="text-7xl md:text-8xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">
                {p95.toFixed(1)}<span className="text-4xl md:text-5xl opacity-30">%</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500/60 uppercase tracking-widest mt-1">
              <span>del Valor de Referencia</span>
              <div className="h-px flex-1 bg-current opacity-10"></div>
            </div>
          </div>

          {uncertainty && (
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 rounded-full px-4 py-1.5 w-fit border border-black/5 backdrop-blur-sm">
              <span className="opacity-40">CI 95%</span>
              <span className="text-gray-900 dark:text-gray-100">[{uncertainty.p95CI[0].toFixed(1)}% - {uncertainty.p95CI[1].toFixed(1)}%]</span>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 space-y-6 bg-white/40 dark:bg-black/10 p-6 rounded-2xl border border-black/5 backdrop-blur-sm">
          <div className="relative h-6 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden flex p-1">
            {/* Segment: Very Low */}
            <div className="group relative h-full bg-emerald-400/80 rounded-l-full" style={{ width: '25%' }}>
               <div className="absolute inset-0 cursor-help opacity-0 hover:bg-white/20 transition-opacity"></div>
            </div>
            {/* Segment: Low */}
            <div className="group relative h-full bg-teal-400/80" style={{ width: '25%' }}>
               <div className="absolute inset-0 cursor-help opacity-0 hover:bg-white/20 transition-opacity"></div>
            </div>
            {/* Segment: Moderate */}
            <div className="group relative h-full bg-amber-400/80" style={{ width: '25%' }}>
               <div className="absolute inset-0 cursor-help opacity-0 hover:bg-white/20 transition-opacity"></div>
            </div>
            {/* Segment: High */}
            <div className="group relative h-full bg-red-500/80 rounded-r-full" style={{ width: '25%' }}>
               <div className="absolute inset-0 cursor-help opacity-0 hover:bg-white/20 transition-opacity"></div>
            </div>
            
            {/* Pointer */}
            <div 
              className="absolute top-0 w-2 h-full bg-gray-900 dark:bg-white shadow-2xl transition-all duration-1000 z-10 rounded-full ring-4 ring-white dark:ring-slate-900"
              style={{ left: `${Math.min(100, (p95 / 250) * 100)}%`, marginLeft: '-4px' }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-black rounded-lg shadow-xl whitespace-nowrap">
                {p95.toFixed(1)}%
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900 dark:border-t-white"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            <span>0%</span>
            <span className="text-gray-900 dark:text-gray-100">100% REF</span>
            <span>250%+</span>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-black/5 dark:border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.hazardQuotient !== undefined && (
                <div className={`p-5 rounded-2xl border ${stats.hazardQuotient > 1 ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30'} flex flex-col gap-1 transition-all hover:shadow-md animate-in slide-in-from-bottom-2`}>
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.hqLabel}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.hazardQuotient > 1 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {stats.hazardQuotient > 1 ? 'Risk detected' : 'Acceptable'}
                      </span>
                   </div>
                   <span className={`text-4xl font-black ${stats.hazardQuotient > 1 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {stats.hazardQuotient.toFixed(3)}
                   </span>
                   <p className="text-[10px] text-gray-500 font-medium italic mt-1">{t.hazardQuotientDesc}</p>
                </div>
            )}
            {stats.marginOfSafety !== undefined && (
                <div className={`p-5 rounded-2xl border ${stats.marginOfSafety < 1 ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30'} flex flex-col gap-1 transition-all hover:shadow-md animate-in slide-in-from-bottom-2`}>
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.mosLabel}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.marginOfSafety < 1 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {stats.marginOfSafety < 1 ? 'Insufficient' : 'Secure'}
                      </span>
                   </div>
                   <span className={`text-4xl font-black ${stats.marginOfSafety < 1 ? 'text-red-600' : 'text-blue-600'}`}>
                      {stats.marginOfSafety.toFixed(2)}
                   </span>
                   <p className="text-[10px] text-gray-500 font-medium italic mt-1">{t.mosDesc}</p>
                </div>
            )}
        </div>

        <div className="flex items-start gap-5">
          <div className="p-3 bg-white/50 dark:bg-black/20 rounded-2xl text-2xl shadow-sm border border-black/5">ℹ️</div>
          <div className="space-y-2">
            <p className={`font-black text-lg tracking-tight ${info.color}`}>
              {info.desc}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-4xl">
              {t.results.probStatement} <strong className="text-gray-900 dark:text-gray-100 font-black">{p95ExposureValue.toFixed(5)} mg/kg·día</strong>. 
              Esto significa que el 95% de la población evaluada se encuentra por debajo de este nivel de exposición.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCard;
