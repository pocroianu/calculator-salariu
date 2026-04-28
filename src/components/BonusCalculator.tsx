import type { Dispatch, SetStateAction } from 'react';
import { ChevronDown, ChevronUp, Gift, Info, TrendingUp } from 'lucide-react';
import type { BonusBreakdown, TaxRegime } from '../types';
import type { createTranslations } from '../i18n/translations';
import { MAX_SALARY } from '../lib/tax';

type WidenStrings<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [Key in keyof T]: WidenStrings<T[Key]> }
      : T;

type Translation = WidenStrings<ReturnType<typeof createTranslations>['ro']>;
type Language = keyof ReturnType<typeof createTranslations>;

interface BonusCalculatorProps {
  t: Translation;
  language: Language;
  isYearly: boolean;
  netSalary: number;
  taxRegime: TaxRegime;
  bonusAmount: number;
  bonusBreakdown: BonusBreakdown;
  showBonusCalculator: boolean;
  setShowBonusCalculator: Dispatch<SetStateAction<boolean>>;
  setBonusAmount: Dispatch<SetStateAction<number>>;
  formatNumber: (value: number) => string;
}

export function BonusCalculator({
  t,
  language,
  isYearly,
  netSalary,
  taxRegime,
  bonusAmount,
  bonusBreakdown,
  showBonusCalculator,
  setShowBonusCalculator,
  setBonusAmount,
  formatNumber,
}: BonusCalculatorProps) {
  void language;

  return (
    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setShowBonusCalculator(!showBonusCalculator)}
        className="flex items-center gap-2 w-full text-left text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
        data-testid="toggle-bonus-calculator"
      >
        <Gift className="w-4 h-4" />
        {showBonusCalculator ? t.hideBonusCalculator : t.showBonusCalculator}
        {showBonusCalculator ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>

      {showBonusCalculator && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.bonusAmount}
            </label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <input
                  type="number"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base lg:text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                  max={MAX_SALARY}
                  step="100"
                  placeholder="0"
                  data-testid="bonus-amount-input"
                />
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {t.bonusAmountHint}
              </div>
            </div>
          </div>

          {bonusAmount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                {t.bonusBreakdown}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">{t.grossBonus}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatNumber(bonusBreakdown.grossBonus)} RON</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">{t.bonusHealthInsurance}:</span>
                  <span className="font-medium text-pink-600 dark:text-pink-400">-{formatNumber(bonusBreakdown.healthInsurance)} RON</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">{t.bonusSocialInsurance}:</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">-{formatNumber(bonusBreakdown.socialInsurance)} RON</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">{taxRegime === 'it_sector' ? t.bonusIncomeTaxIT : t.bonusIncomeTax}:</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    -{formatNumber(bonusBreakdown.incomeTax)} RON
                  </span>
                </div>
                <div className="border-t border-amber-300 dark:border-amber-600 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-amber-800 dark:text-amber-300">{t.netBonus}:</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-lg" data-testid="net-bonus-result">{formatNumber(bonusBreakdown.netBonus)} RON</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {t.bonusTaxNote}
              </div>
            </div>
          )}

          {bonusAmount > 0 && (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t.bonusAffectOnSalary}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">{isYearly ? t.annualWithBonus : t.monthlyWithBonus}:</span>
                  <span className="font-bold text-amber-800 dark:text-amber-300 text-lg" data-testid="total-with-bonus">
                    {formatNumber(netSalary + bonusBreakdown.netBonus)} RON
                  </span>
                </div>
                {!isYearly && (
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span>{t.annualWithBonus}:</span>
                    <span className="font-medium">
                      {formatNumber((netSalary * 12) + bonusBreakdown.netBonus)} RON
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BonusCalculator;
