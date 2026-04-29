import type { Dispatch, SetStateAction } from 'react';
import { Building2, ChevronDown, ChevronUp, Info, TrendingUp } from 'lucide-react';
import type { EmployerCostBreakdown } from '../types';
import type { createTranslations } from '../i18n/translations';

type WidenStrings<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [Key in keyof T]: WidenStrings<T[Key]> }
      : T;

type Translation = WidenStrings<ReturnType<typeof createTranslations>['ro']>;

interface EmployerCostPanelProps {
  t: Translation;
  netSalary: number;
  employerCostBreakdown: EmployerCostBreakdown;
  showEmployerCost: boolean;
  setShowEmployerCost: Dispatch<SetStateAction<boolean>>;
  formatNumber: (value: number) => string;
}

export function EmployerCostPanel({
  t,
  netSalary,
  employerCostBreakdown,
  showEmployerCost,
  setShowEmployerCost,
  formatNumber,
}: EmployerCostPanelProps) {
  return (
    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setShowEmployerCost(!showEmployerCost)}
        className="flex items-center gap-2 w-full text-left text-sm font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors"
        data-testid="toggle-employer-cost"
      >
        <Building2 className="w-4 h-4" />
        {showEmployerCost ? t.hideEmployerCost : t.showEmployerCost}
        {showEmployerCost ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>

      {showEmployerCost && (
        <div className="mt-4 space-y-4">
          <div className="bg-cyan-50 dark:bg-cyan-900/30 rounded-xl p-4 border border-cyan-200 dark:border-cyan-700">
            <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {t.employerContributions}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">{t.gross}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatNumber(employerCostBreakdown.grossSalary)} RON</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    {t.employerCAM}
                    <Info className="w-3 h-3 text-cyan-500 dark:text-cyan-400" title={t.employerCAMRate} />
                  </span>
                </span>
                <span className="font-medium text-cyan-600 dark:text-cyan-400">+{formatNumber(employerCostBreakdown.employerCAM)} RON</span>
              </div>
              <div className="border-t border-cyan-300 dark:border-cyan-600 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-cyan-800 dark:text-cyan-300">{t.totalCostToEmployer}:</span>
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 text-lg" data-testid="total-employer-cost">{formatNumber(employerCostBreakdown.totalCostToEmployer)} RON</span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {t.employerCostNote}
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 rounded-xl p-4 border border-cyan-200 dark:border-cyan-700">
            <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t.netVsEmployerCost}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{t.employeeReceives}:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 text-lg" data-testid="employee-receives">
                  {formatNumber(netSalary)} RON
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{t.employerPays}:</span>
                <span className="font-bold text-cyan-700 dark:text-cyan-300 text-lg" data-testid="employer-pays">
                  {formatNumber(employerCostBreakdown.totalCostToEmployer)} RON
                </span>
              </div>
              <div className="mt-2">
                <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div
                    className="bg-indigo-500 dark:bg-indigo-400 transition-all duration-300"
                    style={{ width: `${(netSalary / employerCostBreakdown.totalCostToEmployer) * 100}%` }}
                    title={t.employeeReceives}
                  />
                  <div
                    className="bg-cyan-500 dark:bg-cyan-400 transition-all duration-300"
                    style={{ width: `${((employerCostBreakdown.totalCostToEmployer - netSalary) / employerCostBreakdown.totalCostToEmployer) * 100}%` }}
                    title={t.employerBurden}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{t.net}: {formatNumber((netSalary / employerCostBreakdown.totalCostToEmployer) * 100)}%</span>
                  <span>{t.taxes} + CAM: {formatNumber(((employerCostBreakdown.totalCostToEmployer - netSalary) / employerCostBreakdown.totalCostToEmployer) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerCostPanel;
