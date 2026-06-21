/**
 * app.js – Application Entry Point
 * CreativeFlow Invoice Generator
 * Pratham Creation Design & Flex Printing
 *
 * Initializes all modules, wires event listeners,
 * and restores saved invoice on load.
 */

'use strict';

// ──────────────────────────────────────────────────────
// TOAST HELPER
// ──────────────────────────────────────────────────────

let _toastTimer = null;

/**
 * Show a brief toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type='success']
 */
function showToast(message, type = 'success') {
  const toast   = document.getElementById('toast-popup');
  const msgEl   = document.getElementById('toast-msg');
  const iconEl  = toast?.querySelector('.toast-icon');

  if (!toast || !msgEl) return;

  msgEl.textContent = message;

  if (iconEl) {
    iconEl.className = 'toast-icon bi';
    if (type === 'error')   iconEl.classList.add('bi-x-circle-fill');
    else if (type === 'info') iconEl.classList.add('bi-info-circle-fill');
    else                    iconEl.classList.add('bi-check-circle-fill');

    iconEl.style.color = type === 'error' ? '#EF4444'
                       : type === 'info'  ? '#60A5FA'
                       : '#10B981';
  }

  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ──────────────────────────────────────────────────────
// BUTTON STATE HELPERS
// ──────────────────────────────────────────────────────

function setButtonLoading(btn, loading, originalHTML) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.origHtml = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split" style="animation: spin 1s linear infinite;"></i> <span>Please wait…</span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = originalHTML || btn.dataset.origHtml || btn.innerHTML;
  }
}

// ──────────────────────────────────────────────────────
// AUTO-SAVE SETUP
// ──────────────────────────────────────────────────────

/**
 * Wire auto-save on all customer/summary fields.
 */
function setupAutoSave() {
  const fieldIds = [
    'customer-name', 'customer-mobile', 'customer-address',
    'customer-business', 'invoice-notes', 'discount-input', 'advance-input',
  ];
  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        Calculations.updateAllTotals();
        Invoice.triggerAutoSave();
      });
    }
  });
}

// ──────────────────────────────────────────────────────
// MAIN INIT
// ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize invoice header (number + date)
  Invoice.initInvoiceHeader();

  // 2. Attempt to restore last saved invoice
  const saved = Storage.loadInvoice();
  if (saved && (saved.customer?.name || (saved.services && saved.services.length > 0))) {
    Invoice.restoreInvoice(saved);
    showToast('Previous invoice restored.', 'info');
  } else {
    // Start with one blank row
    Invoice.addServiceRow();
  }

  // 3. Wire auto-save on form fields
  setupAutoSave();

  // ── ADD SERVICE ───────────────────────────────────
  const addServiceBtn = document.getElementById('add-service-btn');
  if (addServiceBtn) {
    addServiceBtn.addEventListener('click', () => {
      Invoice.addServiceRow();
      // Scroll to new row
      const tbody = document.getElementById('service-rows');
      if (tbody) {
        const lastRow = tbody.querySelector('.svc-row:last-child');
        lastRow?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // ── PRINT ─────────────────────────────────────────
  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // Save before print
      Storage.saveInvoice(Invoice.collectInvoiceData());
      window.print();
    });
  }

  // ── GENERATE PDF ──────────────────────────────────
  const pdfBtn = document.getElementById('generate-pdf-btn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', async () => {
      const origHTML = pdfBtn.innerHTML;
      setButtonLoading(pdfBtn, true);
      try {
        Storage.saveInvoice(Invoice.collectInvoiceData());
        await PDFGenerator.generatePDF();
        showToast('PDF downloaded successfully!', 'success');
      } catch (err) {
        showToast('PDF generation failed. Please try again.', 'error');
        console.error('[App] PDF error:', err);
      } finally {
        setButtonLoading(pdfBtn, false, origHTML);
      }
    });
  }

  // ── CLEAR FORM ────────────────────────────────────
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear the invoice? All data will be lost.')) {
        Invoice.clearForm();
        showToast('Invoice cleared. Starting fresh.', 'info');
      }
    });
  }

  // ── KEYBOARD SHORTCUTS ────────────────────────────
  document.addEventListener('keydown', (e) => {
    // Ctrl+P → Print
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      printBtn?.click();
    }
    // Ctrl+Shift+S → Generate PDF
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      pdfBtn?.click();
    }
    // Ctrl+Enter → Add Service Row
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      addServiceBtn?.click();
    }
  });

  // ── SPIN ANIMATION ────────────────────────────────
  const spinStyle = document.createElement('style');
  spinStyle.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateX(0); }
      to   { opacity: 0; transform: translateX(-10px); }
    }
  `;
  document.head.appendChild(spinStyle);

  console.log('%cCreativeFlow Invoice Generator', 'color:#F59E0B;font-size:16px;font-weight:700;');
  console.log('%cPratham Creation Design & Flex Printing', 'color:#94A3B8;');
});
