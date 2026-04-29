import { describe, expect, it } from 'vitest';
import {
  MAX_MEAL_TICKET_VALUE,
  calculateBonusBreakdown,
  calculateEmployerCostBreakdown,
  calculatePersonalDeduction,
  calculateSalaryBreakdown,
} from './tax';

describe('calculateSalaryBreakdown', () => {
  it('calculates standard gross-to-net salary deductions', () => {
    const result = calculateSalaryBreakdown(10_000, 0, 0);

    expect(result.healthInsurance).toBe(1_000);
    expect(result.socialInsurance).toBe(2_500);
    expect(result.personalDeduction).toBe(0);
    expect(result.incomeTax).toBe(650);
    expect(result.netSalary).toBe(5_850);
  });

  it('caps meal tickets at the monthly legal maximum', () => {
    const result = calculateSalaryBreakdown(5_000, MAX_MEAL_TICKET_VALUE + 100, 0);

    expect(result.mealTickets).toBe(MAX_MEAL_TICKET_VALUE);
    expect(result.healthInsurance).toBeCloseTo(588.528);
    expect(result.socialInsurance).toBe(1_250);
    expect(result.personalDeduction).toBe(425.25);
    expect(result.netSalary).toBeCloseTo(3_684.6018);
  });
});

describe('calculatePersonalDeduction', () => {
  it('uses dependent thresholds at and above the minimum wage', () => {
    expect(calculatePersonalDeduction(4_050, 0)).toBe(810);
    expect(calculatePersonalDeduction(4_050, 4)).toBe(1_822.5);
    expect(calculatePersonalDeduction(6_050, 2)).toBe(405);
  });

  it('returns no deduction above the eligible salary range', () => {
    expect(calculatePersonalDeduction(6_051, 4)).toBe(0);
  });
});

describe('calculateBonusBreakdown', () => {
  it('returns zero values for zero or negative bonuses', () => {
    expect(calculateBonusBreakdown(0)).toEqual({
      grossBonus: 0,
      healthInsurance: 0,
      socialInsurance: 0,
      incomeTax: 0,
      netBonus: 0,
    });
    expect(calculateBonusBreakdown(-500)).toEqual({
      grossBonus: 0,
      healthInsurance: 0,
      socialInsurance: 0,
      incomeTax: 0,
      netBonus: 0,
    });
  });
});

describe('calculateEmployerCostBreakdown', () => {
  it('calculates CAM and total employer cost', () => {
    expect(calculateEmployerCostBreakdown(10_000)).toEqual({
      grossSalary: 10_000,
      employerCAM: 225,
      totalEmployerContributions: 225,
      totalCostToEmployer: 10_225,
    });
  });
});
