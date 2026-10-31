import Decimal from 'decimal.js';
import type { BillingInterval } from '@repo/contracts';

// Configure Decimal for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_EVEN });

export interface DiscountRuleData {
  discountType: 'FIXED_AMOUNT' | 'PERCENTAGE';
  value: string;
  targetType: 'PRODUCT' | 'SUBSCRIPTION';
  minPurchaseAmount: string;
  minQuantity: number;
  startDate?: string | null;
  endDate?: string | null;
  maxUses?: number | null;
  timesUsed: number;
  isActive: boolean;
}

export interface TaxRuleData {
  rate: string; // e.g. "0.2000"
  isInclusive: boolean;
}

/**
 * Calculates effective unit price combining base price and variant adjustments.
 * Scene 2: "for example by brand, where choosing the Odoo brand adds 560 to the price."
 */
export function calculateUnitPrice(
  baseSalesPrice: string,
  priceAdjustment: string = '0.0000',
  isPercentage: boolean = false
): string {
  const base = new Decimal(baseSalesPrice);
  const adj = new Decimal(priceAdjustment);

  if (isPercentage) {
    // E.g. base * (1 + adj)
    return base.plus(base.times(adj)).toFixed(4);
  }
  return base.plus(adj).toFixed(4);
}

/**
 * Calculates line total for a given quantity.
 */
export function calculateLineTotal(unitPrice: string, quantity: number): string {
  return new Decimal(unitPrice).times(quantity).toFixed(4);
}

/**
 * Evaluates discount applicability and returns deduction amount.
 * Scene 5: Fixed or percentage, minimum purchase or quantity, dates, and max uses.
 */
export function evaluateDiscount(
  amount: string,
  quantity: number,
  discount: DiscountRuleData | null,
  currentDate: string = new Date().toISOString().split('T')[0]
): string {
  if (!discount || !discount.isActive) {
    return '0.0000';
  }

  // Check max uses limit
  if (discount.maxUses !== null && discount.maxUses !== undefined && discount.timesUsed >= discount.maxUses) {
    return '0.0000';
  }

  // Check date window
  if (discount.startDate && currentDate < discount.startDate) {
    return '0.0000';
  }
  if (discount.endDate && currentDate > discount.endDate) {
    return '0.0000';
  }

  // Check min quantity
  if (quantity < discount.minQuantity) {
    return '0.0000';
  }

  const amt = new Decimal(amount);
  // Check min purchase amount
  if (amt.lt(new Decimal(discount.minPurchaseAmount))) {
    return '0.0000';
  }

  if (discount.discountType === 'PERCENTAGE') {
    const deduction = amt.times(new Decimal(discount.value));
    return Decimal.min(deduction, amt).toFixed(4);
  } else {
    const deduction = new Decimal(discount.value);
    return Decimal.min(deduction, amt).toFixed(4);
  }
}

/**
 * Computes complete invoice financial totals.
 */
export function calculateInvoiceTotals(
  lines: Array<{ lineTotal: string; taxRate?: string; isTaxInclusive?: boolean }>,
  subscriptionDiscount: string = '0.0000'
): {
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
} {
  let subtotal = new Decimal(0);
  let taxTotal = new Decimal(0);

  for (const line of lines) {
    const lineAmt = new Decimal(line.lineTotal);
    subtotal = subtotal.plus(lineAmt);

    if (line.taxRate && new Decimal(line.taxRate).gt(0)) {
      const rate = new Decimal(line.taxRate);
      if (line.isTaxInclusive) {
        // Price includes tax: tax = lineAmt - (lineAmt / (1 + rate))
        const net = lineAmt.dividedBy(new Decimal(1).plus(rate));
        taxTotal = taxTotal.plus(lineAmt.minus(net));
      } else {
        taxTotal = taxTotal.plus(lineAmt.times(rate));
      }
    }
  }

  const discount = Decimal.min(new Decimal(subscriptionDiscount), subtotal);
  const taxableSubtotal = subtotal.minus(discount);
  const total = taxableSubtotal.plus(taxTotal);

  return {
    subtotal: subtotal.toFixed(4),
    discountAmount: discount.toFixed(4),
    taxAmount: taxTotal.toFixed(4),
    totalAmount: total.toFixed(4)
  };
}

/**
 * Calculates next recurring billing date based on plan interval.
 * Supports: DAILY, WEEKLY, MONTHLY, YEARLY.
 * Safely handles month-end clamping (e.g. Jan 31 -> Feb 28/29).
 */
export function calculateNextBillingDate(
  currentDateStr: string,
  interval: BillingInterval,
  intervalCount: number = 1
): string {
  const parts = currentDateStr.split('-').map(Number);
  const year = parts[0];
  const month = parts[1] - 1; // 0-indexed
  const day = parts[2];

  const d = new Date(Date.UTC(year, month, day));

  switch (interval) {
    case 'DAILY':
      d.setUTCDate(d.getUTCDate() + intervalCount);
      break;
    case 'WEEKLY':
      d.setUTCDate(d.getUTCDate() + intervalCount * 7);
      break;
    case 'MONTHLY': {
      const targetMonth = d.getUTCMonth() + intervalCount;
      d.setUTCMonth(targetMonth);
      // Check if day rolled over into next month (e.g. Jan 31 + 1 month became March 2/3)
      if (d.getUTCMonth() !== ((targetMonth % 12) + 12) % 12) {
        // Set to last day of previous month
        d.setUTCDate(0);
      }
      break;
    }
    case 'YEARLY':
      d.setUTCFullYear(d.getUTCFullYear() + intervalCount);
      break;
  }

  return d.toISOString().split('T')[0];
}

/**
 * Calculates remaining balance and updated invoice status after payment.
 */
export function calculatePaymentBalance(
  totalAmountStr: string,
  amountPaidStr: string,
  newPaymentStr: string
): {
  newAmountPaid: string;
  outstandingAmount: string;
  isFullyPaid: boolean;
} {
  const total = new Decimal(totalAmountStr);
  const currentPaid = new Decimal(amountPaidStr);
  const newPayment = new Decimal(newPaymentStr);

  const updatedPaid = currentPaid.plus(newPayment);
  const outstanding = Decimal.max(0, total.minus(updatedPaid));
  const isFullyPaid = updatedPaid.gte(total);

  return {
    newAmountPaid: updatedPaid.toFixed(4),
    outstandingAmount: outstanding.toFixed(4),
    isFullyPaid
  };
}
