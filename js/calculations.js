/**
 * calculations.js – Real-Time Calculation Engine
 * CreativeFlow Invoice Generator
 * Pratham Creation Design & Flex Printing
 *
 * Formulae (from SRS FR-04):
 *   Item Amount  = Qty × Rate
 *   Tax Amount   = Item Amount × Tax% / 100
 *   Row Total    = Item Amount + Tax Amount
 *   Subtotal     = Σ Item Amounts (before tax)
 *   Tax Total    = Σ Tax Amounts
 *   Grand Total  = Subtotal + Tax Total − Discount
 *   Balance Due  = Grand Total − Advance Paid
 */

'use strict';

const Calculations = (() => {

  /**
   * Format a number as Indian Rupees.
   * @param {number} val
   * @returns {string}  "₹ 1,234.00"
   */
  function formatINR(val) {
    const num = parseFloat(val) || 0;
    return '₹ ' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Parse a numeric input value safely.
   * @param {HTMLInputElement|string} input
   * @returns {number}
   */
  function parseNum(input) {
    const val = typeof input === 'string' ? input : (input ? input.value : '0');
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }

  /**
   * Calculate and update the amount cell for a single row.
   * @param {HTMLElement} row  – the <tr> element
   * @returns {{ baseAmount: number, taxAmount: number, rowTotal: number }}
   */
  function updateRowAmount(row) {
    const qty  = parseNum(row.querySelector('.svc-qty'));
    const rate = parseNum(row.querySelector('.svc-rate'));
    const tax  = parseNum(row.querySelector('.svc-tax'));

    const baseAmount = qty * rate;
    const taxAmount  = baseAmount * (tax / 100);
    const rowTotal   = baseAmount + taxAmount;

    const amountEl = row.querySelector('.row-amount');
    if (amountEl) amountEl.textContent = formatINR(rowTotal);

    return { baseAmount, taxAmount, rowTotal };
  }

  /**
   * Recalculate ALL totals and update DOM.
   * Called on every input event in the form.
   */
  function updateAllTotals() {
    const rows = document.querySelectorAll('#service-rows .svc-row');

    let subtotal = 0;
    let taxTotal = 0;

    rows.forEach(row => {
      const { baseAmount, taxAmount } = updateRowAmount(row);
      subtotal += baseAmount;
      taxTotal += taxAmount;
    });

    const discount     = parseNum(document.getElementById('discount-input'));
    const advancePaid  = parseNum(document.getElementById('advance-input'));
    const grandTotal   = subtotal + taxTotal - discount;
    const balanceDue   = grandTotal - advancePaid;

    // Update DOM
    _setText('subtotal',         formatINR(subtotal));
    _setText('tax-total',        formatINR(taxTotal));
    _setText('grand-total',      formatINR(grandTotal));
    _setText('discount-display', formatINR(discount));
    _setText('advance-display',  formatINR(advancePaid));
    _setText('balance-due',      formatINR(Math.max(0, balanceDue)));

    // Color balance-due row
    const balanceRow = document.querySelector('.balance-due-row');
    if (balanceRow) {
      if (balanceDue <= 0) {
        balanceRow.classList.add('balance-paid-row');
      } else {
        balanceRow.classList.remove('balance-paid-row');
      }
    }

    // Update status pill
    const statusEl = document.querySelector('.status-pill');
    if (statusEl) {
      if (balanceDue <= 0 && grandTotal > 0) {
        statusEl.textContent = 'Paid';
        statusEl.className = 'status-pill paid';
      } else {
        statusEl.textContent = 'Due';
        statusEl.className = 'status-pill pending';
      }
    }

    return { subtotal, taxTotal, grandTotal, discount, advancePaid, balanceDue };
  }

  /** Internal helper: set element text content by id */
  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /** Collect totals into a plain object (for saving) */
  function collectTotals() {
    return updateAllTotals();
  }

  return { formatINR, parseNum, updateRowAmount, updateAllTotals, collectTotals };

})();
