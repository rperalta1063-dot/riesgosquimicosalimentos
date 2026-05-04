

import React from 'react';
import { DistributionType, DistributionParams, Language } from '../types';
import { PARAM_TOOLTIPS } from '../constants';
import { validateDistribution } from '../services/mathUtils';
import { TRANSLATIONS } from '../locales';

interface Props {
  label?: string;
  type: DistributionType;
  params: DistributionParams;
  onChange?: (newParams: DistributionParams) => void; // Legacy or simple change
  onParamsChange?: (newParams: DistributionParams) => void;
  onTypeChange?: (newType: DistributionType) => void;
  unit?: string;
  onUnitChange?: (newUnit: string) => void;
  units?: string[];
  isExpert: boolean;
  language: Language;
}

const DistributionInput: React.FC<Props> = ({ 
  label, 
  type, 
  params, 
  onChange, 
  onParamsChange,
  onTypeChange, 
  unit, 
  onUnitChange, 
  units,
  isExpert, 
  language 
}) => {
  const t = TRANSLATIONS[language];

  const handleParamChange = (key: keyof DistributionParams, value: string) => {
    const numVal = value === '' ? undefined : parseFloat(value);
    const newParams = { ...params, [key]: numVal };
    if (onParamsChange) onParamsChange(newParams);
    else if (onChange) onChange(newParams);
  };

  const error = validateDistribution(type, params);

  const distOptions = Object.keys(t.distTypes).map(key => {
    const isAdvanced = ['weibull', 'erlang', 'gamma', 'beta', 'gumbel', 'frechet', 'inverse_weibull'].includes(key);
    if (isAdvanced && !isExpert) return null;
    return (
      <option key={key} value={key}>
          {t.distTypes[key as keyof typeof t.distTypes]}
      </option>
    );
  });

  const renderInput = (labelKey: keyof typeof t.params, field: keyof DistributionParams, min?: number) => (
    <div className="flex-1 min-w-[80px]">
      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center group relative cursor-help w-fit">
        {t.params[labelKey]}
        <span className="ml-1 flex items-center justify-center w-3 h-3 rounded-full border border-gray-300 text-[8px] font-bold text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          i
        </span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-white dark:bg-slate-800 rounded shadow-lg border border-gray-200 dark:border-slate-700 text-[10px] normal-case font-normal text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {PARAM_TOOLTIPS[field.toLowerCase() as string] || 'Parameter info'}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white dark:border-t-slate-800"></div>
        </div>
      </label>
      <input
        type="number"
        step="any"
        min={min}
        value={params[field] ?? ''}
        onChange={(e) => handleParamChange(field, e.target.value)}
        placeholder={t.params[labelKey]}
        className={`w-full px-2 py-1.5 rounded-md text-sm bg-white dark:bg-slate-800 border text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all ${
          error 
            ? 'border-red-300 dark:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 dark:border-slate-600 focus:ring-blue-500'
        }`}
      />
    </div>
  );

  let fields: React.ReactNode = null;

  switch (type) {
    case 'deterministic':
      fields = renderInput('value', 'value');
      break;
    case 'uniform':
      fields = <>{renderInput('min', 'min')} {renderInput('max', 'max')}</>;
      break;
    case 'triangular':
      fields = <>{renderInput('min', 'min')} {renderInput('mode', 'mode')} {renderInput('max', 'max')}</>;
      break;
    case 'pert':
      fields = (
        <>
          {renderInput('min', 'min')} {renderInput('mode', 'mode')} {renderInput('max', 'max')}
          {isExpert && renderInput('gamma', 'gamma', 0)}
        </>
      );
      break;
    case 'normal':
      fields = <>{renderInput('mean', 'mean')} {renderInput('stdDev', 'stdDev', 0)}</>;
      break;
    case 'lognormal':
      fields = <>{renderInput('mu', 'mu')} {renderInput('sigma', 'sigma', 0)}</>;
      break;
    case 'weibull':
    case 'inverse_weibull':
      fields = <>{renderInput('shape', 'shape', 0)} {renderInput('scale', 'scale', 0)}</>;
      break;
    case 'exponential':
      fields = renderInput('rate', 'rate', 0);
      break;
    case 'erlang':
    case 'gamma':
      fields = <>{renderInput('shape', 'shape', 0)} {renderInput('rate', 'rate', 0)}</>;
      break;
    case 'beta':
      fields = <>{renderInput('min', 'min')} {renderInput('max', 'max')} {renderInput('alpha', 'alpha', 0)} {renderInput('beta', 'beta', 0)}</>;
      break;
    case 'gumbel':
      fields = <>{renderInput('location', 'location')} {renderInput('scale', 'scale', 0)}</>;
      break;
    case 'frechet':
      fields = <>{renderInput('shape', 'shape', 0)} {renderInput('scale', 'scale', 0)} {renderInput('location', 'location')}</>;
      break;
    default:
      fields = <div className="text-xs text-red-500">?</div>;
  }

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase text-gray-400">{label}</label>
          {units && onUnitChange && (
            <select
              value={unit}
              onChange={(e) => onUnitChange(e.target.value)}
              className="text-[10px] bg-transparent border-none focus:ring-0 text-blue-600 dark:text-blue-400 font-bold cursor-pointer"
            >
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {onTypeChange && (
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">{t.unitLabel}</label>
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value as DistributionType)}
              className="w-full px-2 py-1.5 rounded-md text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {distOptions}
            </select>
          </div>
        )}
        <div className={`flex flex-1 flex-wrap gap-2 ${onTypeChange ? 'min-w-[200px]' : ''}`}>
          {fields}
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-medium animate-pulse">
          {t.validation[error as keyof typeof t.validation] || error}
        </p>
      )}
    </div>
  );
};

export default DistributionInput;