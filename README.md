# CreativeFlow – Invoice Generator

A professional, fast, and light-weight client-side invoice generation system tailored for **Pratham Creation Design & Flex Printing**. This single-page application is designed to let business owners create, print, and download polished invoices in under one minute.

---

## 🚀 Key Features

* **⚡ Super-Fast Billing:** Add customer information, select or enter service details, apply discounts/advances, and generate invoices immediately.
* **🔢 Smart Invoice Numbering:** Automatically generates invoice numbers in the format `INV-YYYYMMDD-XXX` with a daily counter that automatically resets at midnight.
* **💾 Auto-Save & Recovery:** Debounced auto-save (600ms) stores form data in `localStorage`. If you refresh or close the tab, your draft is safely restored.
* **🖨️ A4 Print Optimization:** A tailored print stylesheet (`css/invoice.css`) ensures the invoice perfectly fits a single A4 page with clean typography, compact paddings, and hidden interactive elements.
* **📄 Instant PDF Download:** High-quality PDF generation using `html2pdf.js` with direct execution, optimized for local file protocols (`file://`).
* **🎹 Keyboard Shortcuts:**
  * `Ctrl + Enter` — Add a new service row
  * `Ctrl + P` — Print the invoice
  * `Ctrl + Shift + S` — Download the invoice as a PDF

---

## 🎨 Design & Theme

The interface utilizes a premium design system tailored to the creative branding industry:
* **Color Palette:** Deep Slate Navy (`#0F172A`) for structure, Slate Blue (`#1E293B`) for elements, and Warm Gold (`#F59E0B`) for key highlights.
* **Typography:** Playfair Display for headers and Inter for numeric entries and text fields.
* **Aesthetics:** Glassmorphism headers, modern cards, and dynamic focus states.

---

## 📂 Project Structure

```text
Pratham Creation Design & Flex Printing/
├── assets/
│   └── logo/
│       └── logo.png              # AI-Generated Brand Logo
├── css/
│   ├── style.css                 # Core variables and app container layouts
│   ├── invoice.css               # Invoice card details and print optimization
│   └── responsive.css            # Responsive layout adjustments for mobile/tablet
├── js/
│   ├── app.js                    # Keyboard shortcuts, event wiring, and initialization
│   ├── calculations.js           # Real-time subtotal, discount, tax, and balance engine
│   ├── invoice.js                # Row additions, service selectors, and counter reset logic
│   ├── pdf.js                    # html2pdf.js configuration and file protocol fix
│   └── storage.js                # localStorage get, set, and form auto-saving
├── index.html                    # Single-Page Application HTML Structure
├── Project_Documentation.docx    # Project specifications and details
└── README.md                     # This documentation file
```

---

## 🛠️ Tech Stack & CDNs

1. **HTML5 & CSS3** (Vanilla Custom Properties)
2. **Bootstrap v5.3.0** (CDN) — Grid layout & responsiveness
3. **Bootstrap Icons v1.11.3** (CDN) — Icon set
4. **html2pdf.js v0.10.1** (CDN) — Client-side HTML-to-PDF conversion

---

## 🔌 Setup & Usage

Since this is a client-side application with no server dependencies:

1. Clone or download this repository.
2. Double-click the [index.html](file:///c:/01%20Pratik/CLG/Projects/Pratham%20Creation%20Design%20&%20Flex%20Printing/index.html) file to open the application in any modern web browser (Chrome, Edge, Firefox, Safari).
3. Fill in the client information, choose your services, enter custom details if needed, and hit **Print** or **Generate PDF**.

---

## 📝 Customization

* **Contact Information:** The telephone number is set to `8766841594` and is located in the [index.html](file:///c:/01%20Pratik/CLG/Projects/Pratham%20Creation%20Design%20&%20Flex%20Printing/index.html) company header block.
* **Default Services:** Predefined services can be configured in the `<template>` block inside `index.html`.
