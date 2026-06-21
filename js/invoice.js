/**
 * invoice.js – Invoice Management
 * CreativeFlow Invoice Generator
 * Pratham Creation Design & Flex Printing
 */

'use strict';

const Invoice = (() => {

  let _rowCounter = 0; // Running row ID for this session

  // ──────────────────────────────────────────────
  // INVOICE NUMBER & DATE
  // ──────────────────────────────────────────────

  /**
   * Generate invoice number: INV-YYYYMMDD-XXX
   * Uses Storage to get/increment the daily counter.
   * @returns {string}
   */
  function generateInvoiceNumber() {
    const d   = new Date();
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const seq = String(Storage.getDailyCounter()).padStart(3, '0');
    return `INV-${y}${m}${day}-${seq}`;
  }

  /**
   * Generate today's date in DD/MM/YYYY format.
   * @returns {string}
   */
  function generateDate() {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${mon}/${d.getFullYear()}`;
  }

  /**
   * Set invoice number and date in DOM.
   */
  function initInvoiceHeader() {
    document.getElementById('invoice-number').textContent = generateInvoiceNumber();
    document.getElementById('invoice-date').textContent   = generateDate();
  }

  // ──────────────────────────────────────────────
  // SERVICE ROWS
  // ──────────────────────────────────────────────

  /**
   * Add a new service row to the table body.
   * @param {Object} [data] – optional data to pre-fill (for restore)
   */
  function addServiceRow(data = null) {
    const tpl  = document.getElementById('service-row-tpl');
    const tbody = document.getElementById('service-rows');
    if (!tpl || !tbody) return;

    const clone = tpl.content.cloneNode(true);
    const row   = clone.querySelector('tr.svc-row');

    _rowCounter++;
    row.dataset.rowId = _rowCounter;

    // Update serial number
    _renumberRows();

    // Pre-fill if restoring from saved data
    if (data) {
      const sel = row.querySelector('.svc-select');
      if (sel) {
        // Try to match existing option
        const optExists = Array.from(sel.options).some(o => o.value === data.service);
        if (optExists) {
          sel.value = data.service;
        } else {
          sel.value = 'Other';
          // Show custom input
          const custom = row.querySelector('.svc-custom-name');
          if (custom) {
            custom.style.display = 'block';
            custom.value = data.service || '';
          }
        }
      }
      _setVal(row, '.svc-qty',  data.qty  ?? 1);
      _setVal(row, '.svc-rate', data.rate ?? '');
      _setVal(row, '.svc-tax',  data.tax  ?? 0);
    }

    // Wire up events on this row
    _bindRowEvents(row);

    tbody.appendChild(clone);

    // After appending, update serial numbers and recalculate
    _renumberRows();
    Calculations.updateAllTotals();

    return row;
  }

  /**
   * Remove a service row by element reference or rowId.
   * @param {HTMLElement} rowEl
   */
  function removeServiceRow(rowEl) {
    if (!rowEl) return;
    rowEl.style.animation = 'fadeOut 0.15s ease forwards';
    setTimeout(() => {
      rowEl.remove();
      _renumberRows();
      Calculations.updateAllTotals();
      _autoSave();
    }, 150);
  }

  /**
   * Re-number all rows sequentially.
   */
  function _renumberRows() {
    const rows = document.querySelectorAll('#service-rows .svc-row');
    rows.forEach((row, idx) => {
      const numEl = row.querySelector('.row-num');
      if (numEl) numEl.textContent = idx + 1;
    });
  }

  /**
   * Bind input/change events on a service row.
   * @param {HTMLElement} row
   */
  function _bindRowEvents(row) {
    // Delete button
    const delBtn = row.querySelector('.btn-del-row');
    if (delBtn) {
      delBtn.addEventListener('click', () => removeServiceRow(row));
    }

    // Select change → show/hide custom input, recalculate
    const sel = row.querySelector('.svc-select');
    const customInput = row.querySelector('.svc-custom-name');
    if (sel) {
      sel.addEventListener('change', () => {
        if (customInput) {
          customInput.style.display = sel.value === 'Other' ? 'block' : 'none';
          if (sel.value !== 'Other') customInput.value = '';
        }
        _autoSave();
      });
    }

    // Numeric inputs → recalculate on input
    ['svc-qty', 'svc-rate', 'svc-tax'].forEach(cls => {
      const input = row.querySelector(`.${cls}`);
      if (input) {
        input.addEventListener('input', () => {
          Calculations.updateRowAmount(row);
          _updateSummaryFromRows();
          _autoSave();
        });
      }
    });
  }

  /** Trigger full recalculation after row changes */
  function _updateSummaryFromRows() {
    Calculations.updateAllTotals();
  }

  // ──────────────────────────────────────────────
  // COLLECT / RESTORE INVOICE DATA
  // ──────────────────────────────────────────────

  /**
   * Collect all form data into the invoice JSON model.
   * @returns {Object}
   */
  function collectInvoiceData() {
    const rows = document.querySelectorAll('#service-rows .svc-row');
    const services = [];

    rows.forEach(row => {
      const sel    = row.querySelector('.svc-select');
      const custom = row.querySelector('.svc-custom-name');
      let svcName  = sel ? sel.value : '';
      if (svcName === 'Other' && custom) svcName = custom.value || 'Other';

      const qty  = parseFloat(row.querySelector('.svc-qty')?.value)  || 0;
      const rate = parseFloat(row.querySelector('.svc-rate')?.value) || 0;
      const tax  = parseFloat(row.querySelector('.svc-tax')?.value)  || 0;
      const baseAmt = qty * rate;
      const taxAmt  = baseAmt * (tax / 100);

      services.push({
        service : svcName,
        qty,
        rate,
        tax,
        taxAmount : taxAmt,
        amount    : baseAmt + taxAmt,
      });
    });

    const totals   = Calculations.collectTotals();
    const discount = parseFloat(document.getElementById('discount-input')?.value) || 0;
    const advance  = parseFloat(document.getElementById('advance-input')?.value)  || 0;

    return {
      invoiceNumber : document.getElementById('invoice-number')?.textContent,
      date          : document.getElementById('invoice-date')?.textContent,
      customer: {
        name     : document.getElementById('customer-name')?.value.trim()     || '',
        mobile   : document.getElementById('customer-mobile')?.value.trim()   || '',
        address  : document.getElementById('customer-address')?.value.trim()  || '',
        business : document.getElementById('customer-business')?.value.trim() || '',
      },
      services,
      subtotal   : totals.subtotal,
      taxTotal   : totals.taxTotal,
      discount,
      grandTotal : totals.grandTotal,
      advancePaid: advance,
      balanceDue : Math.max(0, totals.grandTotal - advance),
      notes      : document.getElementById('invoice-notes')?.value || '',
    };
  }

  /**
   * Restore invoice from saved data object.
   * @param {Object} data
   */
  function restoreInvoice(data) {
    if (!data) return;

    // Invoice number & date (use saved — don't regenerate)
    if (data.invoiceNumber) {
      document.getElementById('invoice-number').textContent = data.invoiceNumber;
    }
    if (data.date) {
      document.getElementById('invoice-date').textContent = data.date;
    }

    // Customer info
    _setField('customer-name',     data.customer?.name     || '');
    _setField('customer-mobile',   data.customer?.mobile   || '');
    _setField('customer-address',  data.customer?.address  || '');
    _setField('customer-business', data.customer?.business || '');

    // Discount & Advance
    _setField('discount-input', data.discount    || 0);
    _setField('advance-input',  data.advancePaid || 0);

    // Notes
    _setField('invoice-notes', data.notes || '');

    // Services
    clearRows();
    if (Array.isArray(data.services)) {
      data.services.forEach(svc => addServiceRow(svc));
    }

    // Recalculate
    Calculations.updateAllTotals();
  }

  /**
   * Clear all service rows from the table.
   */
  function clearRows() {
    const tbody = document.getElementById('service-rows');
    if (tbody) tbody.innerHTML = '';
    _rowCounter = 0;
  }

  /**
   * Reset the entire invoice form to a clean state.
   * Generates a fresh invoice number.
   */
  function clearForm() {
    // Clear inputs
    ['customer-name','customer-mobile','customer-address','customer-business'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    const discEl = document.getElementById('discount-input');
    const advEl  = document.getElementById('advance-input');
    if (discEl) discEl.value = 0;
    if (advEl)  advEl.value  = 0;

    const notesEl = document.getElementById('invoice-notes');
    if (notesEl) notesEl.value = '';

    // Clear rows
    clearRows();

    // Fresh invoice number
    document.getElementById('invoice-number').textContent = generateInvoiceNumber();
    document.getElementById('invoice-date').textContent   = generateDate();

    // Add one blank row to start
    addServiceRow();

    // Recalculate (zeros)
    Calculations.updateAllTotals();

    // Clear storage
    Storage.clearInvoice();
  }

  // ──────────────────────────────────────────────
  // AUTO-SAVE
  // ──────────────────────────────────────────────

  let _saveTimer = null;

  /**
   * Debounced auto-save to localStorage.
   */
  function _autoSave() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
      Storage.saveInvoice(collectInvoiceData());
    }, 600);
  }

  // ──────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────

  function _setVal(row, selector, value) {
    const el = row.querySelector(selector);
    if (el) el.value = value;
  }

  function _setField(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  // Public auto-save exposure (for app.js to hook form fields)
  function triggerAutoSave() { _autoSave(); }

  return {
    initInvoiceHeader,
    generateInvoiceNumber,
    generateDate,
    addServiceRow,
    removeServiceRow,
    collectInvoiceData,
    restoreInvoice,
    clearForm,
    triggerAutoSave,
  };

})();
