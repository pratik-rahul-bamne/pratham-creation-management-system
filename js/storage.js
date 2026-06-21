/**
 * storage.js – LocalStorage Management
 * CreativeFlow Invoice Generator
 * Pratham Creation Design & Flex Printing
 */

'use strict';

const Storage = (() => {

  const KEYS = {
    DAILY_COUNTER : 'cf_daily_counter',
    COUNTER_DATE  : 'cf_counter_date',
    SAVED_INVOICE : 'cf_saved_invoice',
  };

  /**
   * Returns today's date string in YYYYMMDD format (local time).
   */
  function _todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }

  /**
   * Get and auto-increment the daily invoice counter.
   * Resets to 1 each new calendar day.
   * @returns {number} current counter value (before increment for this call)
   */
  function getDailyCounter() {
    const today = _todayStr();
    const storedDate = localStorage.getItem(KEYS.COUNTER_DATE);
    let counter = parseInt(localStorage.getItem(KEYS.DAILY_COUNTER), 10) || 0;

    if (storedDate !== today) {
      // New day — reset
      counter = 0;
      localStorage.setItem(KEYS.COUNTER_DATE, today);
    }

    counter += 1;
    localStorage.setItem(KEYS.DAILY_COUNTER, counter);
    return counter;
  }

  /**
   * Peek at the current counter without incrementing.
   */
  function peekCounter() {
    const today = _todayStr();
    const storedDate = localStorage.getItem(KEYS.COUNTER_DATE);
    if (storedDate !== today) return 1;
    return parseInt(localStorage.getItem(KEYS.DAILY_COUNTER), 10) || 1;
  }

  /**
   * Save the full invoice data object to localStorage.
   * @param {Object} invoiceData
   */
  function saveInvoice(invoiceData) {
    try {
      localStorage.setItem(KEYS.SAVED_INVOICE, JSON.stringify(invoiceData));
    } catch (e) {
      console.warn('[Storage] Could not save invoice:', e);
    }
  }

  /**
   * Load the last saved invoice from localStorage.
   * @returns {Object|null}
   */
  function loadInvoice() {
    try {
      const raw = localStorage.getItem(KEYS.SAVED_INVOICE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[Storage] Could not load invoice:', e);
      return null;
    }
  }

  /**
   * Clear saved invoice data (but keep counter).
   */
  function clearInvoice() {
    localStorage.removeItem(KEYS.SAVED_INVOICE);
  }

  return { getDailyCounter, peekCounter, saveInvoice, loadInvoice, clearInvoice };

})();
