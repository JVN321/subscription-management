import { describe, it, expect } from 'vitest';
import {
  calculateUnitPrice,
  calculateLineTotal,
  evaluateDiscount,
  calculateInvoiceTotals,
  calculateNextBillingDate,
  calculatePaymentBalance
} from '../src/pricing';

describe('Pricing Engine & Financial Calculations', () => {
  it('correctly calculates variant unit price (+560 for Odoo brand adjustment)', () => {
    // Scene 2: choosing Odoo brand adds 560 to base price
    const baseSalesPrice = '1000.0000';
    const odooAdjustment = '560.0000';
    const effectivePrice = calculateUnitPrice(baseSalesPrice, odooAdjustment, false);
    expect(effectivePrice).toBe('1560.0000');
  });

  it('correctly calculates line total for multiple seats', () => {
    const unitPrice = '1560.0000';
    const quantity = 5;
    const total = calculateLineTotal(unitPrice, quantity);
    expect(total).toBe('7800.0000');
  });

  it('evaluates discount rules based on minimum quantity and usage limits', () => {
    const discount = {
      discountType: 'PERCENTAGE' as const,
      value: '0.1000', // 10%
      targetType: 'SUBSCRIPTION' as const,
      minPurchaseAmount: '500.0000',
      minQuantity: 5,
      timesUsed: 0,
      maxUses: 10,
      isActive: true
    };

    // Subtotal 7800 with 5 seats qualifies for 10% discount -> 780
    const deduction = evaluateDiscount('7800.0000', 5, discount);
    expect(deduction).toBe('780.0000');

    // Only 2 seats does not qualify
    const disqualified = evaluateDiscount('7800.0000', 2, discount);
    expect(disqualified).toBe('0.0000');

    // Reaching max uses disqualifies
    const maxedDiscount = { ...discount, timesUsed: 10 };
    const maxedResult = evaluateDiscount('7800.0000', 5, maxedDiscount);
    expect(maxedResult).toBe('0.0000');
  });

  it('calculates invoice totals with subtotal, discount, and 20% VAT', () => {
    const lines = [
      { lineTotal: '7800.0000', taxRate: '0.2000', isTaxInclusive: false }
    ];
    const subscriptionDiscount = '780.0000';

    const totals = calculateInvoiceTotals(lines, subscriptionDiscount);
    expect(totals.subtotal).toBe('7800.0000');
    expect(totals.discountAmount).toBe('780.0000');
    // 7800 * 0.20 = 1560.0000
    expect(totals.taxAmount).toBe('1560.0000');
    // Total = (7800 - 780) + 1560 = 7020 + 1560 = 8580.0000
    expect(totals.totalAmount).toBe('8580.0000');
  });

  it('calculates next billing dates accurately across all intervals', () => {
    // Daily
    expect(calculateNextBillingDate('2026-11-01', 'DAILY', 1)).toBe('2026-11-02');
    // Weekly
    expect(calculateNextBillingDate('2026-11-01', 'WEEKLY', 1)).toBe('2026-11-08');
    // Monthly
    expect(calculateNextBillingDate('2026-11-01', 'MONTHLY', 1)).toBe('2026-12-01');
    // Monthly month-end clamp (Jan 31 -> Feb 28 on non-leap year)
    expect(calculateNextBillingDate('2027-01-31', 'MONTHLY', 1)).toBe('2027-02-28');
    // Yearly
    expect(calculateNextBillingDate('2026-11-01', 'YEARLY', 1)).toBe('2027-11-01');
  });

  it('calculates payment balance and fully-paid status', () => {
    const totalAmount = '8580.0000';
    
    // Partial payment: $3000
    const partial = calculatePaymentBalance(totalAmount, '0.0000', '3000.0000');
    expect(partial.newAmountPaid).toBe('3000.0000');
    expect(partial.outstandingAmount).toBe('5580.0000');
    expect(partial.isFullyPaid).toBe(false);

    // Final payment: remaining $5580
    const finalPayment = calculatePaymentBalance(totalAmount, '3000.0000', '5580.0000');
    expect(finalPayment.newAmountPaid).toBe('8580.0000');
    expect(finalPayment.outstandingAmount).toBe('0.0000');
    expect(finalPayment.isFullyPaid).toBe(true);
  });
});
