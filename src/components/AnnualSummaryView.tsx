import type { Dispatch, RefObject, SetStateAction } from 'react';
import { ArrowLeft, Calendar, FileText, Gauge, Languages, Moon, Printer, Sun, Trash2, TrendingUp } from 'lucide-react';
import { Chart } from 'react-google-charts';
import type { createTranslations, Language } from '../i18n/translations';
import { ROMANIAN_AVG_TAX_RATE_STANDARD } from '../lib/tax';
import type { AnnualSummary, SalaryEntry } from '../types';
import TaxRateGauge from './TaxRateGauge';

type Translation = ReturnType<typeof createTranslations>['ro'];
type ChartData = (string | number)[][];

interface AnnualSummaryViewProps {
  t: Translation;
  language: Language;
  isDarkMode: boolean;
  selectedYear: number;
  availableYears: number[];
  yearEntries: SalaryEntry[];
  annualSummaryData: AnnualSummary;
  annualChartData: ChartData;
  monthlyChartData: ChartData;
  printRef: RefObject<HTMLDivElement>;
  formatNumber: (num: number) => string;
  setSelectedYear: Dispatch<SetStateAction<number>>;
  setShowAnnualSummary: Dispatch<SetStateAction<boolean>>;
  handlePrint: () => void;
  toggleDarkMode: () => void;
  setLanguage: Dispatch<SetStateAction<Language>>;
  handleClearYear: () => void;
  handleDeleteEntry: (id: string) => void;
}

export function AnnualSummaryView({
  t,
  language,
  isDarkMode,
  selectedYear,
  availableYears,
  yearEntries,
  annualSummaryData,
  annualChartData,
  monthlyChartData,
  printRef,
  formatNumber,
  setSelectedYear,
  setShowAnnualSummary,
  handlePrint,
  toggleDarkMode,
  setLanguage,
  handleClearYear,
  handleDeleteEntry,
}: AnnualSummaryViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 print:shadow-none transition-colors" ref={printRef}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4 print:mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400 print:hidden" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white" data-testid="annual-summary-title">{t.annualSummary}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-colors"
                title={t.printReport}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">{t.printReport}</span>
              </button>
              <button
                onClick={() => setShowAnnualSummary(false)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t.backToCalculator}</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                title={isDarkMode ? t.lightMode : t.darkMode}
                data-testid="dark-mode-toggle"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setLanguage(language === 'ro' ? 'en' : 'ro')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors"
                title="Alt + L"
              >
                <Languages className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex flex-wrap items-center gap-4 mb-6 print:hidden">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4" />
              {t.selectYear}:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              data-testid="year-selector"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {yearEntries.length > 0 && (
              <button
                onClick={handleClearYear}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                {t.clearAllEntries}
              </button>
            )}
          </div>

          {/* Print Header */}
          <div className="hidden print:block mb-6">
            <h2 className="text-xl font-bold text-center dark:text-white">{t.annualTaxReport} - {selectedYear}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">{t.generatedOn}: {new Date().toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US')}</p>
          </div>

          {yearEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>{t.noEntriesYet}</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 opacity-80" />
                    <h3 className="text-sm font-medium opacity-90">{t.totalGrossIncome}</h3>
                  </div>
                  <p className="text-2xl font-bold" data-testid="total-gross">{formatNumber(annualSummaryData.totalGross)} RON</p>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 opacity-80" />
                    <h3 className="text-sm font-medium opacity-90">{t.totalTaxesPaid}</h3>
                  </div>
                  <p className="text-2xl font-bold" data-testid="total-taxes">{formatNumber(annualSummaryData.totalTaxes)} RON</p>
                </div>

                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 opacity-80" />
                    <h3 className="text-sm font-medium opacity-90">{t.totalNetIncome}</h3>
                  </div>
                  <p className="text-2xl font-bold" data-testid="total-net">{formatNumber(annualSummaryData.totalNet)} RON</p>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-5 h-5 opacity-80" />
                    <h3 className="text-sm font-medium opacity-90">{t.effectiveTaxRate}</h3>
                  </div>
                  <p className="text-2xl font-bold" data-testid="effective-tax-rate">{formatNumber(annualSummaryData.effectiveTaxRate)}%</p>
                  {/* Mini gauge bar */}
                  <div className="mt-2 h-2 bg-purple-400/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(annualSummaryData.effectiveTaxRate / 50 * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 opacity-70">
                    <span>0%</span>
                    <span>{t.romanianAverage}: {formatNumber(ROMANIAN_AVG_TAX_RATE_STANDARD)}%</span>
                  </div>
                </div>
              </div>

              {/* Effective Tax Rate Gauge - Detailed */}
              <div className="mb-8">
                <TaxRateGauge
                  t={t}
                  formatNumber={formatNumber}
                  rate={annualSummaryData.effectiveTaxRate}
                  romanianAvg={ROMANIAN_AVG_TAX_RATE_STANDARD}
                  dataTestId="annual-effective-tax-gauge"
                  compact={false}
                />
              </div>

              {/* Tax Breakdown */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 sm:p-5">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t.taxBreakdown}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-gray-600 dark:text-gray-300">{t.healthTotal}</span>
                      <span className="font-semibold text-pink-600 dark:text-pink-400">{formatNumber(annualSummaryData.totalHealthInsurance)} RON</span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-gray-600 dark:text-gray-300">{t.socialTotal}</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{formatNumber(annualSummaryData.totalSocialInsurance)} RON</span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded-lg p-3">
                      <span className="text-gray-600 dark:text-gray-300">{t.incomeTaxTotal}</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{formatNumber(annualSummaryData.totalIncomeTax)} RON</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-5 print:hidden">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t.taxDistribution}</h3>
                  <div className="h-[200px]">
                    <Chart
                      chartType="PieChart"
                      data={annualChartData}
                      options={{
                        pieHole: 0.4,
                        colors: ['#EC4899', '#8B5CF6', '#F59E0B'],
                        legend: { position: 'bottom' },
                        chartArea: { width: '100%', height: '80%' },
                      }}
                      width="100%"
                      height="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Monthly Chart */}
              {yearEntries.length > 1 && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-5 mb-8 print:hidden">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t.monthlyBreakdown}</h3>
                  <div className="h-[300px]">
                    <Chart
                      chartType="ColumnChart"
                      data={monthlyChartData}
                      options={{
                        colors: ['#4F46E5', '#10B981', '#EF4444'],
                        legend: { position: 'bottom' },
                        chartArea: { width: '90%', height: '70%' },
                        isStacked: false,
                        hAxis: { title: t.month },
                        vAxis: { title: 'RON' },
                      }}
                      width="100%"
                      height="100%"
                    />
                  </div>
                </div>
              )}

              {/* Monthly Breakdown Table */}
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t.monthlyBreakdown}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="monthly-breakdown-table">
                    <thead>
                      <tr className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                        <th className="text-left p-3 rounded-tl-lg">{t.month}</th>
                        <th className="text-right p-3">{t.gross}</th>
                        <th className="text-right p-3">{t.taxes}</th>
                        <th className="text-right p-3">{t.net}</th>
                        <th className="text-center p-3">{t.regime}</th>
                        <th className="text-center p-3 rounded-tr-lg print:hidden">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearEntries.map((entry) => {
                        const totalTax = entry.healthInsurance + entry.socialInsurance + entry.incomeTax;
                        return (
                          <tr key={entry.id} className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                            <td className="p-3 font-medium text-gray-800 dark:text-white">{t.months[entry.month]}</td>
                            <td className="p-3 text-right text-gray-800 dark:text-gray-200">{formatNumber(entry.grossSalary + entry.mealTickets)} RON</td>
                            <td className="p-3 text-right text-red-600 dark:text-red-400">{formatNumber(totalTax)} RON</td>
                            <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">{formatNumber(entry.netSalary)} RON</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                entry.taxRegime === 'it_sector'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
                              }`}>
                                {entry.taxRegime === 'it_sector' ? t.itSectorTax : t.standardTax}
                              </span>
                            </td>
                            <td className="p-3 text-center print:hidden">
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                                title={t.deleteEntry}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 dark:bg-gray-600 font-semibold text-gray-800 dark:text-white">
                        <td className="p-3 rounded-bl-lg">Total</td>
                        <td className="p-3 text-right">{formatNumber(annualSummaryData.totalGross)} RON</td>
                        <td className="p-3 text-right text-red-600 dark:text-red-400">{formatNumber(annualSummaryData.totalTaxes)} RON</td>
                        <td className="p-3 text-right text-emerald-600 dark:text-emerald-400">{formatNumber(annualSummaryData.totalNet)} RON</td>
                        <td className="p-3"></td>
                        <td className="p-3 rounded-br-lg print:hidden"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnnualSummaryView;
