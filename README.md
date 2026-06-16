# 💸 AuraWealth — Smart Student Budget Companion

AuraWealth is a clean, single-page expense tracker designed specifically for students to manage pocket money, hostel rent, canteen expenses, books, and campus outings. I built this application to solve the common student struggle of tracking cash flows and setting budget limits without relying on complex, data-heavy apps.

The interface features a custom dark glassmorphic design and operates natively in Indian Rupees (₹), offering an engaging and responsive budgeting companion.

---

## 🚀 Features

- **Rupee-First Formatting:** Formats amounts using the Indian grouping system (Lakhs and Crores) via the native `Intl.NumberFormat` API.
- **Student-Specific Categories:** Tag transactions for pocket money, internships, canteen food, hostel rent, books/stationery, outings, transit, and scholarships.
- **Active Budget Guard:** Set a monthly allowance or pocket money limit. The application warns you when you cross 85% of your budget and alerts you when you run out.
- **Top Spend Analytics:** Displays a visual breakdown of your highest spending categories to identify exactly where your allowance is going.
- **Local & Private:** Everything is kept local. Your transaction logs and budget settings are saved directly in your browser's `localStorage` — no databases, no tracking.
- **CSV Export:** Click to download your complete history as a `.csv` file to analyze in Excel or Google Sheets.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic markup, clean layouts, and input forms.
- **CSS3:** Custom properties (CSS variables), HSL color system, glassmorphic cards, custom scrollbars, animations, and mobile-first responsive breakpoints.
- **JavaScript (ES6+):** Client-side state handling, dynamic dashboard computations, LocalStorage synchronization, and raw CSV data generation.
- **FontAwesome Icons:** Sleek vector icons for category badges and dashboard UI.
- **Google Fonts (Outfit):** Clean, modern Sans-serif typography.

---

## 📂 Project Structure

```text
Expense Tracker/
│
├── index.html       # Markup, input panels, list feeds, and budget adjust modals
├── style.css        # Glassmorphic components, neon glows, and responsive spacing
├── app.js           # Computations, state controller, DOM rendering, and storage sync
└── README.md        # Comprehensive documentation
```

---

## 🎯 Use Cases

- **Allowance Management:** Keep tabs on your monthly pocket money or stipend.
- **Hostel & Room Rent Tracking:** Set aside and monitor rent and utility allocations.
- **Academic Expenses:** Track study materials, textbook purchases, and printing costs.
- **Outings & Fun Budgeting:** Ensure hostel canteen tabs, transit, and weekend outings don't blow past your limits.

---

## 🔮 Future Improvements

- **Multi-Month History:** Filter and compare expenditures across previous months.
- **PDF Report Generation:** Export visual receipt summaries directly as a PDF.
- **Theme Color Customizer:** Toggle between neon purple, emerald green, and electric blue accent colors.
- **Cloud Backup Integration:** Optional encrypted backups using Google Drive or Dropbox.

---

## 🤝 Technical Collaboration & Credits

I designed and built AuraWealth with the help of **Antigravity**, a coding assistant by Google DeepMind. During the development process, Antigravity assisted as a pair programmer with:
- Crafting the responsive glassmorphic UI layout and styling inside `style.css`.
- Building and testing the state management, local storage synchronization, and transaction logic in `app.js`.
- Refining the India-specific currency formatting, search filters, and automated CSV exporting.

---

## 🚀 How to Run Locally

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/rehan-1002/Expense-Trackerr.git
   ```
2. **Open the App:**
   Open `index.html` in any modern web browser or run it using VS Code's Live Server.

---

## 📄 License

This project is open-source and available for educational and personal use.
