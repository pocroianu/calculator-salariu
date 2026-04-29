import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Calculator,
  Calendar,
  Copy,
  FileText,
  Info,
  Languages,
  Laptop,
  Moon,
  RotateCcw,
  Save,
  Sun,
  Users,
} from 'lucide-react';
import { Chart } from 'react-google-charts';
import AnnualSummaryView from './components/AnnualSummaryView';
import BonusCalculator from './components/BonusCalculator';
import EmployerCostPanel from './components/EmployerCostPanel';
import TaxRateGauge from './components/TaxRateGauge';
import { translations, type Language } from './i18n/translations';
import {
  DEFAULT_SALARY,
  MAX_DEPENDENTS,
  MAX_MEAL_TICKET_VALUE,
  MAX_SALARY,
  ROMANIAN_AVG_TAX_RATE_IT,
  ROMANIAN_AVG_TAX_RATE_STANDARD,
  calculateBonusBreakdown,
  calculateEmployerCostBreakdown,
  calculateSalaryBreakdown,
  type SalaryBreakdown,
} from './lib/tax';
import {
  applyDarkMode,
  getSystemThemePreference,
  loadSalaryHistory,
  loadThemePreference,
  saveSalaryHistory,
  saveThemePreference,
  type ThemePreference,
} from './lib/storage';
import type { AnnualSummary, BonusBreakdown, EmployerCostBreakdown, SalaryEntry, TaxRegime } from './types';

const emptySalaryBreakdown: SalaryBreakdown = {
  healthInsurance: 0,
  socialInsurance: 0,
  incomeTax: 0,
  mealTickets: 0,
  personalDeduction: 0,
  effectiveGross: 0,
  netSalary: 0,
};

function App() {
  const [language, setLanguage] = useState<Language>('ro');
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => loadThemePreference());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const pref = loadThemePreference();
    return pref === 'dark' || (pref === 'system' && getSystemThemePreference());
  });
  const [grossSalary, setGrossSalary] = useState<number>(DEFAULT_SALARY);
  const [mealTicketValue, setMealTicketValue] = useState<number>(0);
  const [dependents, setDependents] = useState<number>(0);
  const [isYearly, setIsYearly] = useState(false);
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('standard');
  const [netSalary, setNetSalary] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<SalaryBreakdown>(emptySalaryBreakdown);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const [showBonusCalculator, setShowBonusCalculator] = useState(false);
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [bonusBreakdown, setBonusBreakdown] = useState<BonusBreakdown>({
    grossBonus: 0,
    healthInsurance: 0,
    socialInsurance: 0,
    incomeTax: 0,
    netBonus: 0,
  });

  const [showEmployerCost, setShowEmployerCost] = useState(false);
  const [employerCostBreakdown, setEmployerCostBreakdown] = useState<EmployerCostBreakdown>({
    grossSalary: 0,
    employerCAM: 0,
    totalEmployerContributions: 0,
    totalCostToEmployer: 0,
  });

  const [showAnnualSummary, setShowAnnualSummary] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState<SalaryEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [entrySaved, setEntrySaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat(language === 'ro' ? 'ro-RO' : 'en-US').format(Math.round(num * 100) / 100);
  }, [language]);

  useEffect(() => {
    setSalaryHistory(loadSalaryHistory());
  }, []);

  const calculateCurrentSalary = useCallback(() => {
    const multiplier = isYearly ? 12 : 1;
    const periodGross = grossSalary * multiplier;

    if (periodGross <= 0 || periodGross > MAX_SALARY) {
      setError(t.invalidInput);
      return;
    }

    setError('');

    const monthlyBreakdown = calculateSalaryBreakdown(grossSalary, mealTicketValue, dependents);
    const periodBreakdown: SalaryBreakdown = {
      healthInsurance: monthlyBreakdown.healthInsurance * multiplier,
      socialInsurance: monthlyBreakdown.socialInsurance * multiplier,
      incomeTax: monthlyBreakdown.incomeTax * multiplier,
      mealTickets: monthlyBreakdown.mealTickets * multiplier,
      personalDeduction: monthlyBreakdown.personalDeduction * multiplier,
      effectiveGross: grossSalary * multiplier,
      netSalary: monthlyBreakdown.netSalary * multiplier,
    };

    setBreakdown(periodBreakdown);
    setNetSalary(periodBreakdown.netSalary);
  }, [dependents, grossSalary, isYearly, mealTicketValue, t.invalidInput]);

  const chartData = useMemo(() => {
    const data: (string | number)[][] = [
      ['Category', 'Amount'],
      [t.netSalary, netSalary],
      [t.healthInsurance, breakdown.healthInsurance],
      [t.socialInsurance, breakdown.socialInsurance],
    ];

    if (breakdown.incomeTax > 0) {
      data.push([t.incomeTax, breakdown.incomeTax]);
    }

    return data;
  }, [breakdown.healthInsurance, breakdown.incomeTax, breakdown.socialInsurance, netSalary, t]);

  const chartOptions = useMemo(() => {
    const colors = ['#4F46E5', '#EC4899', '#8B5CF6'];

    if (breakdown.incomeTax > 0) {
      colors.push('#F59E0B');
    }

    return {
      title: t.chartTitle,
      pieHole: 0.4,
      colors,
      legend: { position: 'bottom' },
      chartArea: { width: '100%', height: '80%' },
      tooltip: { trigger: 'selection' },
      focusTarget: 'category',
    };
  }, [breakdown.incomeTax, t.chartTitle]);

  const effectiveTaxRateData = useMemo(() => {
    const totalDeductions = breakdown.healthInsurance + breakdown.socialInsurance + breakdown.incomeTax;
    const totalCompensation = breakdown.effectiveGross + breakdown.mealTickets;
    const rate = totalCompensation > 0 ? (totalDeductions / totalCompensation) * 100 : 0;
    const romanianAvg = taxRegime === 'it_sector' ? ROMANIAN_AVG_TAX_RATE_IT : ROMANIAN_AVG_TAX_RATE_STANDARD;
    const difference = rate - romanianAvg;

    return {
      rate,
      romanianAvg,
      difference,
      isAboveAverage: difference > 0.5,
      isBelowAverage: difference < -0.5,
      isAtAverage: Math.abs(difference) <= 0.5,
    };
  }, [breakdown, taxRegime]);

  const handleCopy = async () => {
    let text = `
${t.grossSalary}: ${formatNumber(breakdown.effectiveGross)} RON`;

    if (breakdown.mealTickets > 0) {
      text += `
${t.mealTicketsLabel}: ${formatNumber(breakdown.mealTickets)} RON (${language === 'ro' ? 'CASS + impozit, fara CAS' : 'CASS + income tax, no CAS'})`;
    }

    if (breakdown.personalDeduction > 0) {
      text += `
${t.dependentsLabel}: ${formatNumber(breakdown.personalDeduction)} RON (${dependents} ${language === 'ro' ? 'persoane' : 'dependents'})`;
    }

    text += `
${t.taxRegime}: ${taxRegime === 'it_sector' ? t.itSectorTax : t.standardTax}
${t.healthInsurance}: ${formatNumber(breakdown.healthInsurance)} RON
${t.socialInsurance}: ${formatNumber(breakdown.socialInsurance)} RON
${taxRegime === 'it_sector' ? t.incomeTaxIT : t.incomeTax}: ${formatNumber(breakdown.incomeTax)} RON
${t.netSalary}: ${formatNumber(netSalary)} RON
    `;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGrossSalary(DEFAULT_SALARY);
    setMealTicketValue(0);
    setDependents(0);
    setIsYearly(false);
    setTaxRegime('standard');
    setError('');
    setBonusAmount(0);
    setShowBonusCalculator(false);
  };

  const handleSaveEntry = useCallback(() => {
    const calc = calculateSalaryBreakdown(grossSalary, mealTicketValue, dependents);

    const newEntry: SalaryEntry = {
      id: `${selectedYear}-${selectedMonth}-${Date.now()}`,
      month: selectedMonth,
      year: selectedYear,
      grossSalary,
      mealTickets: calc.mealTickets,
      dependents,
      taxRegime,
      netSalary: calc.netSalary,
      healthInsurance: calc.healthInsurance,
      socialInsurance: calc.socialInsurance,
      incomeTax: calc.incomeTax,
      personalDeduction: calc.personalDeduction,
      createdAt: new Date().toISOString(),
    };

    const filteredHistory = salaryHistory.filter(
      entry => !(entry.month === selectedMonth && entry.year === selectedYear)
    );

    const updatedHistory = [...filteredHistory, newEntry].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    setSalaryHistory(updatedHistory);
    saveSalaryHistory(updatedHistory);
    setEntrySaved(true);
    setTimeout(() => setEntrySaved(false), 2000);
  }, [dependents, grossSalary, mealTicketValue, salaryHistory, selectedMonth, selectedYear, taxRegime]);

  const handleDeleteEntry = useCallback((id: string) => {
    if (window.confirm(t.confirmDelete)) {
      const updatedHistory = salaryHistory.filter(entry => entry.id !== id);
      setSalaryHistory(updatedHistory);
      saveSalaryHistory(updatedHistory);
    }
  }, [salaryHistory, t.confirmDelete]);

  const handleClearYear = useCallback(() => {
    if (window.confirm(t.confirmClearAll)) {
      const updatedHistory = salaryHistory.filter(entry => entry.year !== selectedYear);
      setSalaryHistory(updatedHistory);
      saveSalaryHistory(updatedHistory);
    }
  }, [salaryHistory, selectedYear, t.confirmClearAll]);

  const annualSummaryData = useMemo((): AnnualSummary => {
    const entries = salaryHistory.filter(entry => entry.year === selectedYear);

    if (entries.length === 0) {
      return {
        totalGross: 0,
        totalNet: 0,
        totalTaxes: 0,
        totalHealthInsurance: 0,
        totalSocialInsurance: 0,
        totalIncomeTax: 0,
        effectiveTaxRate: 0,
        entriesCount: 0,
      };
    }

    const totalGross = entries.reduce((sum, entry) => sum + entry.grossSalary + entry.mealTickets, 0);
    const totalNet = entries.reduce((sum, entry) => sum + entry.netSalary, 0);
    const totalHealthInsurance = entries.reduce((sum, entry) => sum + entry.healthInsurance, 0);
    const totalSocialInsurance = entries.reduce((sum, entry) => sum + entry.socialInsurance, 0);
    const totalIncomeTax = entries.reduce((sum, entry) => sum + entry.incomeTax, 0);
    const totalTaxes = totalHealthInsurance + totalSocialInsurance + totalIncomeTax;

    return {
      totalGross,
      totalNet,
      totalTaxes,
      totalHealthInsurance,
      totalSocialInsurance,
      totalIncomeTax,
      effectiveTaxRate: totalGross > 0 ? (totalTaxes / totalGross) * 100 : 0,
      entriesCount: entries.length,
    };
  }, [salaryHistory, selectedYear]);

  const yearEntries = useMemo(() => {
    return salaryHistory
      .filter(entry => entry.year === selectedYear)
      .sort((a, b) => a.month - b.month);
  }, [salaryHistory, selectedYear]);

  const availableYears = useMemo(() => {
    const years = new Set(salaryHistory.map(entry => entry.year));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [salaryHistory]);

  const existingEntry = useMemo(() => {
    return salaryHistory.find(entry => entry.month === selectedMonth && entry.year === selectedYear);
  }, [salaryHistory, selectedMonth, selectedYear]);

  const annualChartData = useMemo(() => [
    ['Category', 'Amount'],
    [t.healthTotal, annualSummaryData.totalHealthInsurance],
    [t.socialTotal, annualSummaryData.totalSocialInsurance],
    [t.incomeTaxTotal, annualSummaryData.totalIncomeTax],
  ], [annualSummaryData, t]);

  const monthlyChartData = useMemo(() => {
    const data: (string | number)[][] = [[t.month, t.gross, t.net, t.taxes]];

    yearEntries.forEach(entry => {
      const totalTax = entry.healthInsurance + entry.socialInsurance + entry.incomeTax;
      data.push([t.months[entry.month], entry.grossSalary + entry.mealTickets, entry.netSalary, totalTax]);
    });

    return data;
  }, [yearEntries, t]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newIsDark = !prev;
      const newPreference: ThemePreference = newIsDark ? 'dark' : 'light';
      setThemePreference(newPreference);
      saveThemePreference(newPreference);
      return newIsDark;
    });
  }, []);

  useEffect(() => {
    calculateCurrentSalary();
  }, [calculateCurrentSalary]);

  useEffect(() => {
    setBonusBreakdown(calculateBonusBreakdown(bonusAmount));
  }, [bonusAmount]);

  useEffect(() => {
    const multiplier = isYearly ? 12 : 1;
    setEmployerCostBreakdown(calculateEmployerCostBreakdown(grossSalary * multiplier));
  }, [grossSalary, isYearly]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'l') {
        setLanguage(prev => prev === 'ro' ? 'en' : 'ro');
      }

      if (event.altKey && event.key === 'd') {
        toggleDarkMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleDarkMode]);

  useEffect(() => {
    applyDarkMode(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (themePreference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  if (showAnnualSummary) {
    return (
      <AnnualSummaryView
        t={t}
        language={language}
        isDarkMode={isDarkMode}
        selectedYear={selectedYear}
        availableYears={availableYears}
        yearEntries={yearEntries}
        annualSummaryData={annualSummaryData}
        annualChartData={annualChartData}
        monthlyChartData={monthlyChartData}
        printRef={printRef}
        formatNumber={formatNumber}
        setSelectedYear={setSelectedYear}
        setShowAnnualSummary={setShowAnnualSummary}
        handlePrint={handlePrint}
        toggleDarkMode={toggleDarkMode}
        setLanguage={setLanguage}
        handleClearYear={handleClearYear}
        handleDeleteEntry={handleDeleteEntry}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{t.title}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowAnnualSummary(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-colors"
                title={t.viewAnnualSummary}
                data-testid="view-annual-summary-btn"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{t.annualSummary}</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                title={t.reset}
              >
                <RotateCcw className="w-4 h-4" />
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

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="order-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.grossSalary}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={grossSalary}
                      onChange={(event) => setGrossSalary(Number(event.target.value))}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base lg:text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        error ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      min="1"
                      max={MAX_SALARY}
                      step="100"
                    />
                    {error && (
                      <div className="absolute -bottom-6 left-0 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.mealTickets}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={mealTicketValue}
                      onChange={(event) => setMealTicketValue(Math.max(0, Number(event.target.value)))}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base lg:text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      max={MAX_MEAL_TICKET_VALUE}
                      step="10"
                      placeholder="0"
                    />
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {t.mealTicketsHint}
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.dependents}
                  </label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="number"
                        data-testid="dependents-input"
                        value={dependents}
                        onChange={(event) => setDependents(Math.max(0, Math.min(MAX_DEPENDENTS, Number(event.target.value))))}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base lg:text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                        max={MAX_DEPENDENTS}
                        step="1"
                        placeholder="0"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {t.dependentsHint}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.period}:</span>
                  <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 w-full sm:w-auto">
                    <button
                      onClick={() => setIsYearly(false)}
                      className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium ${
                        !isYearly
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t.monthly}
                    </button>
                    <button
                      onClick={() => setIsYearly(true)}
                      className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium ${
                        isYearly
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t.yearly}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    {t.taxRegime}:
                  </span>
                  <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 w-full sm:w-auto">
                    <button
                      data-testid="tax-regime-standard"
                      onClick={() => setTaxRegime('standard')}
                      className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium ${
                        taxRegime === 'standard'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t.standardTax}
                    </button>
                    <button
                      data-testid="tax-regime-it"
                      onClick={() => setTaxRegime('it_sector')}
                      className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium ${
                        taxRegime === 'it_sector'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t.itSectorTax}
                    </button>
                  </div>
                </div>
                {taxRegime === 'it_sector' && (
                  <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {t.itExemptionInfo}
                  </div>
                )}

                <BonusCalculator
                  t={t}
                  language={language}
                  isYearly={isYearly}
                  netSalary={netSalary}
                  taxRegime={taxRegime}
                  bonusAmount={bonusAmount}
                  bonusBreakdown={bonusBreakdown}
                  showBonusCalculator={showBonusCalculator}
                  setShowBonusCalculator={setShowBonusCalculator}
                  setBonusAmount={setBonusAmount}
                  formatNumber={formatNumber}
                />

                <EmployerCostPanel
                  t={t}
                  netSalary={netSalary}
                  employerCostBreakdown={employerCostBreakdown}
                  showEmployerCost={showEmployerCost}
                  setShowEmployerCost={setShowEmployerCost}
                  formatNumber={formatNumber}
                />

                <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <select
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(Number(event.target.value))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        data-testid="month-selector"
                      >
                        {t.months.map((month, index) => (
                          <option key={month} value={index}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <select
                      value={selectedYear}
                      onChange={(event) => setSelectedYear(Number(event.target.value))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {[...Array(5)].map((_, index) => {
                        const year = new Date().getFullYear() - 2 + index;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                    <button
                      onClick={handleSaveEntry}
                      disabled={isYearly}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        isYearly
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : entrySaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                      data-testid="save-entry-btn"
                    >
                      <Save className="w-4 h-4" />
                      {entrySaved ? t.entrySaved : existingEntry ? t.update : t.saveEntry}
                    </button>
                  </div>
                  {existingEntry && !isYearly && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {t.entryExists}
                    </p>
                  )}
                </div>
              </div>

              <div className="hidden lg:block mt-6">
                <div className={`rounded-xl p-5 text-white ${
                  taxRegime === 'it_sector'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600'
                }`}>
                  <h2 className="text-lg font-semibold mb-1">{t.finalNetSalary}</h2>
                  <div className="text-3xl font-bold break-words" data-testid="net-salary-result">
                    {formatNumber(netSalary)} RON
                  </div>
                  {taxRegime === 'it_sector' && (
                    <div className="mt-2 text-sm opacity-90 flex items-center gap-1">
                      <Laptop className="w-4 h-4" />
                      {t.itExemptionLabel}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="order-2">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-5 h-[250px] lg:h-[360px]">
                <Chart
                  chartType="PieChart"
                  data={chartData}
                  options={{
                    ...chartOptions,
                    chartArea: { width: '100%', height: '85%' },
                  }}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>

            <div className="order-3 lg:hidden">
              <div className={`rounded-xl p-5 text-white ${
                taxRegime === 'it_sector'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600'
              }`}>
                <h2 className="text-lg font-semibold mb-1">{t.finalNetSalary}</h2>
                <div className="text-3xl font-bold break-words" data-testid="net-salary-result-mobile">
                  {formatNumber(netSalary)} RON
                </div>
                {taxRegime === 'it_sector' && (
                  <div className="mt-2 text-sm opacity-90 flex items-center gap-1">
                    <Laptop className="w-4 h-4" />
                    {t.itExemptionLabel}
                  </div>
                )}
              </div>
            </div>

            <div className="order-4 lg:col-span-2">
              <TaxRateGauge
                t={t}
                formatNumber={formatNumber}
                data={effectiveTaxRateData}
                dataTestId="effective-tax-rate-gauge"
                rateDataTestId="effective-tax-rate-value"
                averageDataTestId="romanian-avg-rate"
                comparisonDataTestId="tax-comparison-message"
              />
            </div>

            <div className="order-5 lg:col-span-2">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t.calculationDetails}</h2>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? t.copied : t.copy}</span>
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {taxRegime === 'it_sector' && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3 shadow-sm border border-emerald-200 dark:border-emerald-700 sm:col-span-2" data-testid="it-regime-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="font-medium text-emerald-800 dark:text-emerald-300">{t.itExemptionLabel}</h3>
                      </div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 break-words">
                        {t.itExemptionInfo}
                      </p>
                    </div>
                  )}

                  {breakdown.mealTickets > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3 shadow-sm border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="font-medium text-emerald-800 dark:text-emerald-300">{t.mealTicketsLabel}</h3>
                      </div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 break-words">
                        {formatNumber(breakdown.mealTickets)} RON ({language === 'ro' ? 'CASS + impozit, fara CAS' : 'CASS + income tax, no CAS'})
                      </p>
                    </div>
                  )}

                  {breakdown.personalDeduction > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 shadow-sm border border-blue-200 dark:border-blue-700" data-testid="personal-deduction-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-medium text-blue-800 dark:text-blue-300">{t.dependentsLabel}</h3>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-400 break-words">
                        {formatNumber(breakdown.personalDeduction)} RON ({dependents} {language === 'ro' ? 'persoane in intretinere' : 'dependents'})
                      </p>
                    </div>
                  )}

                  {dependents > 0 && breakdown.personalDeduction === 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 shadow-sm border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h3 className="font-medium text-amber-800 dark:text-amber-300">{t.dependentsLabel}</h3>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-400 break-words">
                        {t.noDeduction}
                      </p>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-medium text-gray-800 dark:text-white">{t.healthInsurance}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                      {breakdown.mealTickets > 0
                        ? `(${formatNumber(breakdown.effectiveGross)} + ${formatNumber(breakdown.mealTickets)}) x 10% = ${formatNumber(breakdown.healthInsurance)} RON`
                        : `${formatNumber(breakdown.effectiveGross)} x 10% = ${formatNumber(breakdown.healthInsurance)} RON`
                      }
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-medium text-gray-800 dark:text-white">{t.socialInsurance}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                      {breakdown.mealTickets > 0
                        ? `${formatNumber(breakdown.effectiveGross)} x 25% = ${formatNumber(breakdown.socialInsurance)} RON (${language === 'ro' ? 'tichetele sunt scutite de CAS' : 'meal tickets are CAS-exempt'})`
                        : `${formatNumber(breakdown.effectiveGross)} x 25% = ${formatNumber(breakdown.socialInsurance)} RON`
                      }
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm" data-testid="income-tax-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        {taxRegime === 'it_sector' ? t.incomeTaxIT : t.incomeTax}
                      </h3>
                    </div>
                    <p className="text-sm break-words text-gray-600 dark:text-gray-300">
                      {breakdown.personalDeduction > 0
                        ? breakdown.mealTickets > 0
                          ? `(${formatNumber(breakdown.effectiveGross)} + ${formatNumber(breakdown.mealTickets)} - ${formatNumber(breakdown.healthInsurance)} - ${formatNumber(breakdown.socialInsurance)} - ${formatNumber(breakdown.personalDeduction)}) x 10% = ${formatNumber(breakdown.incomeTax)} RON`
                          : `(${formatNumber(breakdown.effectiveGross)} - ${formatNumber(breakdown.healthInsurance)} - ${formatNumber(breakdown.socialInsurance)} - ${formatNumber(breakdown.personalDeduction)}) x 10% = ${formatNumber(breakdown.incomeTax)} RON`
                        : breakdown.mealTickets > 0
                          ? `(${formatNumber(breakdown.effectiveGross)} + ${formatNumber(breakdown.mealTickets)} - ${formatNumber(breakdown.healthInsurance)} - ${formatNumber(breakdown.socialInsurance)}) x 10% = ${formatNumber(breakdown.incomeTax)} RON`
                          : `(${formatNumber(breakdown.effectiveGross)} - ${formatNumber(breakdown.healthInsurance)} - ${formatNumber(breakdown.socialInsurance)}) x 10% = ${formatNumber(breakdown.incomeTax)} RON`
                      }
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-medium text-gray-800 dark:text-white">{t.netSalary}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                      {breakdown.mealTickets > 0
                        ? `${formatNumber(breakdown.effectiveGross)} + ${formatNumber(breakdown.mealTickets)} - ${formatNumber(breakdown.healthInsurance)} - ${formatNumber(breakdown.socialInsurance)} - ${formatNumber(breakdown.incomeTax)} = ${formatNumber(netSalary)} RON`
                        : `${formatNumber(breakdown.effectiveGross)} - ${formatNumber(breakdown.healthInsurance)} - ${formatNumber(breakdown.socialInsurance)} - ${formatNumber(breakdown.incomeTax)} = ${formatNumber(netSalary)} RON`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
