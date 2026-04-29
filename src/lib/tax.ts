import type { BonusBreakdown, EmployerCostBreakdown } from '../types';

export interface SalaryBreakdown {
  healthInsurance: number;
  socialInsurance: number;
  incomeTax: number;
  mealTickets: number;
  personalDeduction: number;
  effectiveGross: number;
  netSalary: number;
}

export const MAX_SALARY = 1000000;
export const DEFAULT_SALARY = 5800;
export const MEAL_TICKET_DAILY_LIMIT = 40.24;
export const DEFAULT_WORKING_DAYS = 22;
export const MAX_MEAL_TICKET_VALUE = MEAL_TICKET_DAILY_LIMIT * DEFAULT_WORKING_DAYS;
export const MINIMUM_WAGE = 4050;
export const MAX_DEPENDENTS = 10;

export const ROMANIAN_AVG_TAX_RATE_STANDARD = 35.5;
export const ROMANIAN_AVG_TAX_RATE_IT = ROMANIAN_AVG_TAX_RATE_STANDARD;

export const EMPLOYER_CAM_RATE = 0.0225;

export const PERSONAL_DEDUCTION_TABLE: { maxOffset: number; percentages: number[] }[] = [
  { maxOffset: 0, percentages: [20, 25, 30, 35, 45] },
  { maxOffset: 50, percentages: [19.5, 24.5, 29.5, 34.5, 44.5] },
  { maxOffset: 100, percentages: [19, 24, 29, 34, 44] },
  { maxOffset: 150, percentages: [18.5, 23.5, 28.5, 33.5, 43.5] },
  { maxOffset: 200, percentages: [18, 23, 28, 33, 43] },
  { maxOffset: 250, percentages: [17.5, 22.5, 27.5, 32.5, 42.5] },
  { maxOffset: 300, percentages: [17, 22, 27, 32, 42] },
  { maxOffset: 350, percentages: [16.5, 21.5, 26.5, 31.5, 41.5] },
  { maxOffset: 400, percentages: [16, 21, 26, 31, 41] },
  { maxOffset: 450, percentages: [15.5, 20.5, 25.5, 30.5, 40.5] },
  { maxOffset: 500, percentages: [15, 20, 25, 30, 40] },
  { maxOffset: 550, percentages: [14.5, 19.5, 24.5, 29.5, 39.5] },
  { maxOffset: 600, percentages: [14, 19, 24, 29, 39] },
  { maxOffset: 650, percentages: [13.5, 18.5, 23.5, 28.5, 38.5] },
  { maxOffset: 700, percentages: [13, 18, 23, 28, 38] },
  { maxOffset: 750, percentages: [12.5, 17.5, 22.5, 27.5, 37.5] },
  { maxOffset: 800, percentages: [12, 17, 22, 27, 37] },
  { maxOffset: 850, percentages: [11.5, 16.5, 21.5, 26.5, 36.5] },
  { maxOffset: 900, percentages: [11, 16, 21, 26, 36] },
  { maxOffset: 950, percentages: [10.5, 15.5, 20.5, 25.5, 35.5] },
  { maxOffset: 1000, percentages: [10, 15, 20, 25, 35] },
  { maxOffset: 1050, percentages: [9.5, 14.5, 19.5, 24.5, 34.5] },
  { maxOffset: 1100, percentages: [9, 14, 19, 24, 34] },
  { maxOffset: 1150, percentages: [8.5, 13.5, 18.5, 23.5, 33.5] },
  { maxOffset: 1200, percentages: [8, 13, 18, 23, 33] },
  { maxOffset: 1250, percentages: [7.5, 12.5, 17.5, 22.5, 32.5] },
  { maxOffset: 1300, percentages: [7, 12, 17, 22, 32] },
  { maxOffset: 1350, percentages: [6.5, 11.5, 16.5, 21.5, 31.5] },
  { maxOffset: 1400, percentages: [6, 11, 16, 21, 31] },
  { maxOffset: 1450, percentages: [5.5, 10.5, 15.5, 20.5, 30.5] },
  { maxOffset: 1500, percentages: [5, 10, 15, 20, 30] },
  { maxOffset: 1550, percentages: [4.5, 9.5, 14.5, 19.5, 29.5] },
  { maxOffset: 1600, percentages: [4, 9, 14, 19, 29] },
  { maxOffset: 1650, percentages: [3.5, 8.5, 13.5, 18.5, 28.5] },
  { maxOffset: 1700, percentages: [3, 8, 13, 18, 28] },
  { maxOffset: 1750, percentages: [2.5, 7.5, 12.5, 17.5, 27.5] },
  { maxOffset: 1800, percentages: [2, 7, 12, 17, 27] },
  { maxOffset: 1850, percentages: [1.5, 6.5, 11.5, 16.5, 26.5] },
  { maxOffset: 1900, percentages: [1, 6, 11, 16, 26] },
  { maxOffset: 1950, percentages: [0.5, 5.5, 10.5, 15.5, 25.5] },
  { maxOffset: 2000, percentages: [0, 5, 10, 15, 25] },
];

export const calculatePersonalDeduction = (grossSalary: number, dependents: number): number => {
  if (grossSalary > MINIMUM_WAGE + 2000) {
    return 0;
  }

  const offset = grossSalary - MINIMUM_WAGE;

  if (offset < 0) {
    const dependentColumn = Math.min(dependents, 4);
    return (PERSONAL_DEDUCTION_TABLE[0].percentages[dependentColumn] / 100) * MINIMUM_WAGE;
  }

  let bracketIndex = 0;
  for (let i = 0; i < PERSONAL_DEDUCTION_TABLE.length; i++) {
    if (offset <= PERSONAL_DEDUCTION_TABLE[i].maxOffset) {
      bracketIndex = i;
      break;
    }
    bracketIndex = i;
  }

  const dependentColumn = Math.min(dependents, 4);
  const percentage = PERSONAL_DEDUCTION_TABLE[bracketIndex].percentages[dependentColumn];

  return (percentage / 100) * MINIMUM_WAGE;
};

export const calculateBonusBreakdown = (grossBonus: number): BonusBreakdown => {
  if (grossBonus <= 0) {
    return {
      grossBonus: 0,
      healthInsurance: 0,
      socialInsurance: 0,
      incomeTax: 0,
      netBonus: 0,
    };
  }

  const healthInsurance = grossBonus * 0.1;
  const socialInsurance = grossBonus * 0.25;
  const taxableIncome = grossBonus - healthInsurance - socialInsurance;

  const incomeTaxRate = 0.1;
  const incomeTax = Math.max(0, taxableIncome) * incomeTaxRate;
  const netBonus = grossBonus - healthInsurance - socialInsurance - incomeTax;

  return {
    grossBonus,
    healthInsurance,
    socialInsurance,
    incomeTax,
    netBonus,
  };
};

export const calculateSalaryBreakdown = (
  gross: number,
  mealTickets: number,
  numDependents: number
): SalaryBreakdown => {
  const effectiveMealTickets = Math.min(mealTickets, MAX_MEAL_TICKET_VALUE);
  const cassAndTaxBase = gross + effectiveMealTickets;

  const healthInsurance = cassAndTaxBase * 0.1;
  const socialInsurance = gross * 0.25;
  const personalDeduction = calculatePersonalDeduction(gross, numDependents);

  const taxableIncomeBeforeDeduction = cassAndTaxBase - healthInsurance - socialInsurance;
  const taxableIncomeAfterDeduction = Math.max(0, taxableIncomeBeforeDeduction - personalDeduction);

  const incomeTaxRate = 0.1;
  const incomeTax = taxableIncomeAfterDeduction * incomeTaxRate;
  const net = cassAndTaxBase - healthInsurance - socialInsurance - incomeTax;

  return {
    healthInsurance,
    socialInsurance,
    incomeTax,
    mealTickets: effectiveMealTickets,
    personalDeduction,
    effectiveGross: gross,
    netSalary: net,
  };
};

export const calculateEmployerCostBreakdown = (grossSalary: number): EmployerCostBreakdown => {
  const employerCAM = grossSalary * EMPLOYER_CAM_RATE;
  const totalEmployerContributions = employerCAM;
  const totalCostToEmployer = grossSalary + totalEmployerContributions;

  return {
    grossSalary,
    employerCAM,
    totalEmployerContributions,
    totalCostToEmployer,
  };
};
