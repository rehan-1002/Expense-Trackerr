# AuraWealth — Student Budget Companion

AuraWealth is a clean, single-page expense tracker designed specifically for students to manage pocket money, hostel rent, canteen expenses, books, and campus outings. I built this to solve the common student struggle of tracking cash flows and setting budget limits without relying on complex, data-heavy apps.

The interface is styled with a custom dark glassmorphic design and operates natively in Indian Rupees (₹).

## Features

- **Rupee-First Formatting:** Handles native Indian Rupee formatting (lakhs/crores) using the `Intl.NumberFormat` API.
- **Student-Specific Categories:** Tag transactions for pocket money, internships, canteen food, hostel rent, books/stationery, outings, and transport.
- **Active Budget Guard:** Set a monthly allowance or pocket money limit. The application warns you when you cross 85% of your budget and alerts you when you run out.
- **Top Spend Analytics:** Displays a visual breakdown of your highest spending categories to identify where your money is going.
- **Local & Private:** Everything is kept local. Your transaction logs and budget settings are saved directly in your browser's `localStorage` — no databases, no tracking.
- **CSV Export:** Click to download your complete history as a `.csv` file to analyze in Excel or Google Sheets.

## Technical Collaboration & Credits

I designed and built AuraWealth with the help of **Antigravity**, a coding assistant by Google DeepMind. During the development process, Antigravity assisted as a pair programmer with:
- Crafting the responsive glassmorphic UI layout and styling inside `style.css`.
- Building and testing the state management, local storage synchronization, and transaction logic in `app.js`.
- Refining the India-specific currency formatting, search filters, and automated CSV exporting.

## Project Structure

- `index.html` - Core layout, transaction forms, panels, and modal UI
- `style.css` - Custom styling, CSS custom properties, and responsive grid layouts
- `app.js` - State logic, storage syncing, and dashboard metrics rendering

## Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/rehan-1002/Expense-Trackerr.git
   ```
2. Open `index.html` in any web browser (or use VS Code Live Server).
