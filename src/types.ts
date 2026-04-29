// Tax regime type - IT is kept as a sector label, but 2025 salary income uses standard income tax.
export type TaxRegime = 'standard' | 'it_sector';

// Salary entry type for annual summary storage
export interface SalaryEntry {
  id: string;
  month: number; // 0-11
  year: number;
  grossSalary: number;
  mealTickets: number;
  dependents: number;
  taxRegime: TaxRegime;
  netSalary: number;
  healthInsurance: number;
  socialInsurance: number;
  incomeTax: number;
  personalDeduction: number;
  createdAt: string;
}

// Annual summary calculations
export interface AnnualSummary {
  totalGross: number;
  totalNet: number;
  totalTaxes: number;
  totalHealthInsurance: number;
  totalSocialInsurance: number;
  totalIncomeTax: number;
  effectiveTaxRate: number;
  entriesCount: number;
}

// Bonus calculation breakdown
export interface BonusBreakdown {
  grossBonus: number;
  healthInsurance: number;
  socialInsurance: number;
  incomeTax: number;
  netBonus: number;
}

// Employer cost breakdown - shows total cost to employer beyond employee's gross salary
export interface EmployerCostBreakdown {
  grossSalary: number;
  employerCAM: number; // Contribuția asiguratorie pentru muncă (2.25%)
  totalEmployerContributions: number;
  totalCostToEmployer: number; // Gross salary + all employer contributions
}
