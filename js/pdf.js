/**
 * pdf.js – PDF Generation
 * CreativeFlow Invoice Generator
 * Pratham Creation Design & Flex Printing
 *
 * Uses html2pdf.js (CDN) to render the invoice card as a PDF.
 * Falls back to window.print() if html2pdf is unavailable.
 */

'use strict';

const PDFGenerator = (() => {

  /**
   * Generate and download the invoice as a PDF file.
   */
  async function generatePDF() {
    const invoiceEl = document.getElementById('invoice-area');
    if (!invoiceEl) {
      throw new Error('[PDF] Invoice area element not found.');
    }

    // Check html2pdf is available
    if (typeof html2pdf === 'undefined') {
      console.warn('[PDF] html2pdf not loaded — falling back to print.');
      window.print();
      return;
    }

    // Build filename
    const invNum  = (document.getElementById('invoice-number')?.textContent  || 'Invoice').trim();
    const custName = (document.getElementById('customer-name')?.value?.trim() || 'Customer');
    const filename = `${invNum}_${custName.replace(/[^a-z0-9]/gi, '_')}.pdf`;

    // Elements to hide / show for PDF render
    const noPrintEls   = invoiceEl.querySelectorAll('.no-print');
    const printOnlyEls = invoiceEl.querySelectorAll('.print-only');

    // --- Temporarily switch to print-layout mode ---
    noPrintEls.forEach(el   => el.style.setProperty('display', 'none', 'important'));
    printOnlyEls.forEach(el => el.style.setProperty('display', 'inline', 'important'));

    // Snapshot current card padding and set print padding
    const prevPadding = invoiceEl.style.padding;
    invoiceEl.style.padding = '8px 12px';

    try {
      const opts = {
        margin      : [6, 8, 6, 8],           // top, right, bottom, left (mm)
        filename,
        image       : { type: 'jpeg', quality: 0.97 },
        html2canvas : {
          scale           : 2,
          useCORS         : false,            // false avoids CORS issues on file://
          allowTaint      : true,
          backgroundColor : '#ffffff',
          logging         : false,
          windowWidth     : 900,             // force consistent render width
          scrollX         : 0,
          scrollY         : 0,
        },
        jsPDF : {
          unit        : 'mm',
          format      : 'a4',
          orientation : 'portrait',
        },
        pagebreak : { mode: ['css', 'legacy'] },
      };

      await html2pdf().set(opts).from(invoiceEl).save();

    } finally {
      // --- Always restore original state ---
      noPrintEls.forEach(el   => el.style.removeProperty('display'));
      printOnlyEls.forEach(el => el.style.removeProperty('display'));
      invoiceEl.style.padding = prevPadding;
    }
  }

  return { generatePDF };

})();
