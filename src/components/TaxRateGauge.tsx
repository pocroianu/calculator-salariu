import { Gauge, Target } from 'lucide-react';
import type { createTranslations } from '../i18n/translations';

type RomanianTranslation = ReturnType<typeof createTranslations>['ro'];
type TranslationKey =
  | 'effectiveTaxRateGauge'
  | 'yourRate'
  | 'romanianAverage'
  | 'belowAverage'
  | 'average'
  | 'aboveAverage'
  | 'lowerThanAvg'
  | 'higherThanAvg'
  | 'atAverage';
type Translation = {
  [Key in TranslationKey]: RomanianTranslation[Key] extends string ? string : RomanianTranslation[Key];
};

type TaxRateGaugeData = {
  rate: number;
  romanianAvg: number;
  difference: number;
  isAboveAverage: boolean;
  isBelowAverage: boolean;
  isAtAverage: boolean;
};

type TaxRateGaugeProps = {
  t: Translation;
  formatNumber: (value: number) => string;
  rate?: number;
  romanianAvg?: number;
  data?: TaxRateGaugeData;
  dataTestId?: string;
  titleDataTestId?: string;
  rateDataTestId?: string;
  averageDataTestId?: string;
  comparisonDataTestId?: string;
  compact?: boolean;
};

export default function TaxRateGauge({
  t,
  formatNumber,
  rate,
  romanianAvg,
  data,
  dataTestId,
  titleDataTestId,
  rateDataTestId,
  averageDataTestId,
  comparisonDataTestId,
  compact = true,
}: TaxRateGaugeProps) {
  const gaugeRate = data?.rate ?? rate ?? 0;
  const gaugeAverage = data?.romanianAvg ?? romanianAvg ?? 0;
  const difference = data?.difference ?? gaugeRate - gaugeAverage;
  const isBelowAverage = data?.isBelowAverage ?? difference < -0.5;
  const isAboveAverage = data?.isAboveAverage ?? difference > 0.5;
  const isAtAverage = data?.isAtAverage ?? Math.abs(difference) <= 0.5;

  const barHeight = compact ? 'h-6' : 'h-8';
  const rateIndicatorWidth = compact ? 'w-1' : 'w-1.5';
  const rateMarkerContainer = compact ? '-top-1 -left-2 w-5 h-8' : '-top-1 -left-2.5 w-6 h-10';
  const rateMarkerSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const targetOffset = compact ? '-bottom-6' : '-bottom-7';
  const targetIconSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const scaleMargin = compact ? 'mt-1' : 'mt-2';
  const cardPadding = compact ? 'p-3' : 'p-4';
  const cardLabelMargin = compact ? 'mb-1' : 'mb-2';
  const rateDotSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const cardTextClass = compact
    ? 'text-sm text-gray-600 dark:text-gray-300'
    : 'text-sm font-medium text-gray-600 dark:text-gray-300';
  const valueTextClass = compact ? 'text-2xl' : 'text-3xl';
  const comparisonIconClass = compact
    ? 'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center'
    : 'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg';
  const comparisonTitleClass = compact ? 'font-medium' : 'font-semibold';

  return (
    <div
      className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-5 border border-purple-200 dark:border-purple-700"
      data-testid={dataTestId}
    >
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white" data-testid={titleDataTestId}>
          {t.effectiveTaxRateGauge}
        </h2>
      </div>

      <div className="relative mb-4">
        <div className={`${barHeight} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative`}>
          <div className="absolute inset-0 flex">
            <div className="w-1/3 bg-emerald-400 dark:bg-emerald-500 opacity-30" />
            <div className="w-1/3 bg-amber-400 dark:bg-amber-500 opacity-30" />
            <div className="w-1/3 bg-red-400 dark:bg-red-500 opacity-30" />
          </div>

          <div
            className={`absolute top-0 h-full ${rateIndicatorWidth} bg-purple-700 dark:bg-purple-400 shadow-lg transition-all duration-500`}
            style={{ left: `${Math.min(Math.max(gaugeRate / 50 * 100, 0), 100)}%` }}
          >
            <div className={`absolute ${rateMarkerContainer} flex items-center justify-center`}>
              <div className={`${rateMarkerSize} bg-purple-700 dark:bg-purple-400 rounded-full ring-2 ring-white dark:ring-gray-800`} />
            </div>
          </div>

          <div
            className="absolute top-0 h-full w-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-500 opacity-80"
            style={{ left: `${Math.min(gaugeAverage / 50 * 100, 100)}%` }}
          >
            <div className={`absolute ${targetOffset} -left-3 flex flex-col items-center`}>
              <Target className={`${targetIconSize} text-gray-600 dark:text-gray-300`} />
            </div>
          </div>
        </div>

        <div className={`flex justify-between text-xs text-gray-500 dark:text-gray-400 ${scaleMargin}`}>
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className={`bg-white dark:bg-gray-700 rounded-lg ${cardPadding} shadow-sm`}>
          <div className={`flex items-center gap-2 ${cardLabelMargin}`}>
            <div className={`${rateDotSize} bg-purple-600 dark:bg-purple-400 rounded-full`} />
            <span className={cardTextClass}>{t.yourRate}</span>
          </div>
          <p className={`${valueTextClass} font-bold text-purple-700 dark:text-purple-300`} data-testid={rateDataTestId}>
            {formatNumber(gaugeRate)}%
          </p>
        </div>

        <div className={`bg-white dark:bg-gray-700 rounded-lg ${cardPadding} shadow-sm`}>
          <div className={`flex items-center gap-2 ${cardLabelMargin}`}>
            <Target className={`${targetIconSize} text-gray-600 dark:text-gray-300`} />
            <span className={cardTextClass}>{t.romanianAverage}</span>
          </div>
          <p className={`${valueTextClass} font-bold text-gray-700 dark:text-gray-200`} data-testid={averageDataTestId}>
            {formatNumber(gaugeAverage)}%
          </p>
        </div>
      </div>

      <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
        isBelowAverage
          ? 'bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700'
          : isAboveAverage
            ? 'bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700'
            : 'bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700'
      }`} data-testid={comparisonDataTestId}>
        <div className={`${comparisonIconClass} ${
          isBelowAverage
            ? 'bg-emerald-500 text-white'
            : isAboveAverage
              ? 'bg-red-500 text-white'
              : 'bg-amber-500 text-white'
        }`}>
          {isBelowAverage ? '↓' : isAboveAverage ? '↑' : '='}
        </div>
        <div>
          <p className={`${comparisonTitleClass} ${
            isBelowAverage
              ? 'text-emerald-800 dark:text-emerald-300'
              : isAboveAverage
                ? 'text-red-800 dark:text-red-300'
                : 'text-amber-800 dark:text-amber-300'
          }`}>
            {isBelowAverage ? t.belowAverage : isAboveAverage ? t.aboveAverage : t.average}
          </p>
          <p className={`text-sm ${
            isBelowAverage
              ? 'text-emerald-700 dark:text-emerald-400'
              : isAboveAverage
                ? 'text-red-700 dark:text-red-400'
                : 'text-amber-700 dark:text-amber-400'
          }`}>
            {isAtAverage
              ? t.atAverage
              : `${formatNumber(Math.abs(difference))}% ${isBelowAverage ? t.lowerThanAvg : t.higherThanAvg}`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
