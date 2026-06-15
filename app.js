// AuraWealth Expense Tracker - Application Logic

// --- Constants & State ---
let state = {
  transactions: JSON.parse(localStorage.getItem('aura_transactions')) || [],
  budgetLimit: parseFloat(localStorage.getItem('aura_budget_limit')) || 8000.00,
  currentType: 'credit', // Default transaction form type selector
  filters: {
    search: '',
    type: 'all' // 'all', 'credit', 'debit'
  }
};

const CATEGORIES = {
  pocket_money: { label: 'Pocket Money / Allowance', icon: 'fa-hand-holding-dollar' },
  part_time: { label: 'Part-time / Internship', icon: 'fa-briefcase' },
  scholarship: { label: 'Scholarship / Grant', icon: 'fa-graduation-cap' },
  food: { label: 'Food & Cafeteria', icon: 'fa-utensils' },
  books: { label: 'Books & Study Materials', icon: 'fa-book-open' },
  rent: { label: 'Hostel / Room Rent', icon: 'fa-house-user' },
  transport: { label: 'Transit & Travel', icon: 'fa-bus' },
  entertainment: { label: 'Outings & Fun', icon: 'fa-gamepad' },
  others: { label: 'Others / Misc', icon: 'fa-asterisk' }
};

// --- DOM Selectors ---
const DOM = {
  currentDateDisplay: document.getElementById('currentDateDisplay'),
  netBalanceAmount: document.getElementById('netBalanceAmount'),
  totalIncomeAmount: document.getElementById('totalIncomeAmount'),
  totalExpenseAmount: document.getElementById('totalExpenseAmount'),
  budgetPercentage: document.getElementById('budgetPercentage'),
  budgetSpentVsLimit: document.getElementById('budgetSpentVsLimit'),
  budgetProgressBar: document.getElementById('budgetProgressBar'),
  budgetStatusText: document.getElementById('budgetStatusText'),
  openBudgetModalBtn: document.getElementById('openBudgetModalBtn'),
  insightsContainer: document.getElementById('insightsContainer'),
  noInsightsText: document.getElementById('noInsightsText'),
  
  // Form elements
  transactionForm: document.getElementById('transactionForm'),
  typeCreditBtn: document.getElementById('typeCreditBtn'),
  typeDebitBtn: document.getElementById('typeDebitBtn'),
  amountInput: document.getElementById('amountInput'),
  categoryInput: document.getElementById('categoryInput'),
  dateInput: document.getElementById('dateInput'),
  noteInput: document.getElementById('noteInput'),
  
  // Search & Filter & Action elements
  searchInput: document.getElementById('searchInput'),
  filterTabBtns: document.querySelectorAll('.filter-tab-btn'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  transactionListContainer: document.getElementById('transactionListContainer'),
  
  // Budget Modal elements
  budgetModalOverlay: document.getElementById('budgetModalOverlay'),
  budgetConfigForm: document.getElementById('budgetConfigForm'),
  monthlyBudgetLimitInput: document.getElementById('monthlyBudgetLimitInput'),
  closeBudgetModalBtn: document.getElementById('closeBudgetModalBtn'),
  
  // Toast container
  toastContainer: document.getElementById('toastContainer')
};

// --- Toast System ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${message}</span>
  `;
  
  DOM.toastContainer.appendChild(toast);
  
  // Slide in
  setTimeout(() => {
    toast.classList.add('show');
  }, 50);
  
  // Slide out and remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}

// --- Formatting Utils ---
function formatCurrency(value) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });
  return formatter.format(value);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC' // Keep date exact to input selector
  });
}

// --- Date Header Setup ---
function updateHeaderDate() {
  const now = new Date();
  const options = { month: 'long', year: 'numeric' };
  DOM.currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);
  
  // Set default date picker to today
  const todayStr = now.toISOString().split('T')[0];
  DOM.dateInput.value = todayStr;
}

// --- LocalStorage Sync ---
function saveToLocalStorage() {
  localStorage.setItem('aura_transactions', JSON.stringify(state.transactions));
  localStorage.setItem('aura_budget_limit', state.budgetLimit.toString());
}

// --- Core Computations & Renderers ---

// Update Financial Calculations and cards
function renderDashboardMetrics() {
  let income = 0;
  let expense = 0;

  state.transactions.forEach(t => {
    const amt = parseFloat(t.amount);
    if (t.type === 'credit') {
      income += amt;
    } else {
      expense += amt;
    }
  });

  const netBalance = income - expense;

  // Render values
  DOM.netBalanceAmount.textContent = formatCurrency(netBalance);
  DOM.totalIncomeAmount.textContent = `+${formatCurrency(income)}`;
  DOM.totalExpenseAmount.textContent = `-${formatCurrency(expense)}`;

  // Apply visual styling to Net Balance depending on positive/negative
  if (netBalance < 0) {
    DOM.netBalanceAmount.style.color = 'var(--debit)';
    DOM.netBalanceAmount.style.textShadow = '0 0 15px rgba(244, 63, 94, 0.25)';
  } else if (netBalance > 0) {
    DOM.netBalanceAmount.style.color = 'var(--credit)';
    DOM.netBalanceAmount.style.textShadow = '0 0 15px rgba(52, 211, 153, 0.25)';
  } else {
    DOM.netBalanceAmount.style.color = 'var(--text-main)';
    DOM.netBalanceAmount.style.textShadow = 'none';
  }

  // Budget Calculations (Calculated dynamically for current month)
  // For safety, we sum all expenses in the system. 
  // In a future update, we can restrict to the active month.
  const currentBudgetSpent = expense; 
  const budgetPercentageValue = state.budgetLimit > 0 
    ? Math.min(Math.round((currentBudgetSpent / state.budgetLimit) * 100), 200) // cap layout display at 200%
    : 0;

  DOM.budgetPercentage.textContent = `${budgetPercentageValue}%`;
  DOM.budgetSpentVsLimit.textContent = `${formatCurrency(currentBudgetSpent)} spent of ${formatCurrency(state.budgetLimit)}`;
  
  // Animating progress bar
  DOM.budgetProgressBar.style.width = `${Math.min(budgetPercentageValue, 100)}%`;
  
  // Set alert state for budget limit
  if (budgetPercentageValue >= 85) {
    DOM.budgetProgressBar.classList.add('warning');
    DOM.budgetStatusText.textContent = budgetPercentageValue >= 100 
      ? '🚨 Campus budget exceeded! Avoid unnecessary outings!' 
      : '⚠️ Watch out! Campus savings running low (85%+ spent)!';
    DOM.budgetStatusText.style.color = 'var(--debit)';
  } else {
    DOM.budgetProgressBar.classList.remove('warning');
    DOM.budgetStatusText.textContent = '🎓 Campus budget is healthy! Nice job saving!';
    DOM.budgetStatusText.style.color = 'var(--text-muted)';
  }

  renderInsights(expense);
}

// Render Top Spending Analytics (Insights)
function renderInsights(totalExpense) {
  // Clear dynamic elements first (keeping fallback elements hidden as needed)
  const dynamicBars = DOM.insightsContainer.querySelectorAll('.category-bar-wrapper, .top-item-highlight');
  dynamicBars.forEach(bar => bar.remove());

  // Aggregate spending by category
  const spendings = {};
  state.transactions.forEach(t => {
    if (t.type === 'debit') {
      const amt = parseFloat(t.amount);
      spendings[t.category] = (spendings[t.category] || 0) + amt;
    }
  });

  const categoryEntries = Object.entries(spendings);

  if (categoryEntries.length === 0) {
    DOM.noInsightsText.style.display = 'block';
    return;
  }

  DOM.noInsightsText.style.display = 'none';

  // Sort descending by total amount spent
  categoryEntries.sort((a, b) => b[1] - a[1]);

  const topCategory = categoryEntries[0];
  const maxSpend = topCategory[1];

  // Render Top highlight header
  const highlightElement = document.createElement('div');
  highlightElement.className = 'top-item-highlight';
  const catMetadata = CATEGORIES[topCategory[0]] || { label: topCategory[0], icon: 'fa-asterisk' };
  highlightElement.innerHTML = `
    <i class="fa-solid ${catMetadata.icon}"></i>
    ${catMetadata.label}
    <span>Top Spend</span>
  `;
  DOM.insightsContainer.appendChild(highlightElement);

  // Render bars for each category up to top 3
  categoryEntries.slice(0, 3).forEach(([catKey, totalSpent]) => {
    const categoryInfo = CATEGORIES[catKey] || { label: catKey, icon: 'fa-asterisk' };
    const pct = totalExpense > 0 ? Math.round((totalSpent / totalExpense) * 100) : 0;
    
    // Width ratio relative to the max spend category for neat proportional comparison
    const widthRatio = maxSpend > 0 ? (totalSpent / maxSpend) * 100 : 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'category-bar-wrapper';
    wrapper.innerHTML = `
      <div class="category-bar-label">
        <span>${categoryInfo.label} (${pct}%)</span>
        <strong>${formatCurrency(totalSpent)}</strong>
      </div>
      <div class="category-bar-track">
        <div class="category-bar-fill" style="width: ${widthRatio}%"></div>
      </div>
    `;
    DOM.insightsContainer.appendChild(wrapper);
  });
}

// Render filtered transactions list
function renderTransactionList() {
  DOM.transactionListContainer.innerHTML = '';

  // Filter items
  const filtered = state.transactions.filter(t => {
    // Filter type tab
    if (state.filters.type !== 'all' && t.type !== state.filters.type) {
      return false;
    }
    // Search query matches note or category label
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      const catLabel = (CATEGORIES[t.category]?.label || '').toLowerCase();
      const note = (t.note || '').toLowerCase();
      return catLabel.includes(q) || note.includes(q);
    }
    return true;
  });

  if (filtered.length === 0) {
    DOM.transactionListContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-receipt"></i>
        <p>No matching transactions found.<br>Start by recording one on the left!</p>
      </div>
    `;
    return;
  }

  // Render cards
  filtered.forEach(t => {
    const catInfo = CATEGORIES[t.category] || { label: t.category, icon: 'fa-asterisk' };
    const isCredit = t.type === 'credit';
    const card = document.createElement('div');
    card.className = 'transaction-card';
    card.innerHTML = `
      <div class="transaction-icon-box ${t.type}">
        <i class="fa-solid ${isCredit ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
      </div>
      <div class="transaction-details">
        <h4>${t.note || catInfo.label}</h4>
        <div class="transaction-meta">
          <span class="transaction-tag"><i class="fa-solid ${catInfo.icon}"></i> ${catInfo.label}</span>
          <span><i class="fa-regular fa-clock"></i> ${formatDate(t.date)}</span>
        </div>
      </div>
      <div class="transaction-amount-col">
        <div class="transaction-amount-val ${t.type}">
          ${isCredit ? '+' : '-'}${formatCurrency(t.amount)}
        </div>
      </div>
      <button class="transaction-delete-btn" data-id="${t.id}" title="Delete Transaction">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;

    // Add delete action to this specific button
    card.querySelector('.transaction-delete-btn').addEventListener('click', (e) => {
      const idToDelete = e.currentTarget.getAttribute('data-id');
      deleteTransaction(idToDelete);
    });

    DOM.transactionListContainer.appendChild(card);
  });
}

// --- Controller Actions ---

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveToLocalStorage();
  renderDashboardMetrics();
  renderTransactionList();
  showToast('Transaction deleted successfully.', 'error');
}

// Switch between credit / debit input button styles
function setTransactionType(type) {
  state.currentType = type;
  if (type === 'credit') {
    DOM.typeCreditBtn.classList.add('active');
    DOM.typeDebitBtn.classList.remove('active');
    
    // Autofill category values mapping to Credit defaults
    DOM.categoryInput.value = 'pocket_money';
  } else {
    DOM.typeDebitBtn.classList.add('active');
    DOM.typeCreditBtn.classList.remove('active');
    
    // Autofill category values mapping to Debit defaults
    DOM.categoryInput.value = 'food';
  }
}

// --- Action Event Bindings ---

// Transaction Form Submit
DOM.transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const amount = parseFloat(DOM.amountInput.value);
  const category = DOM.categoryInput.value;
  const date = DOM.dateInput.value;
  const note = DOM.noteInput.value.trim();

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid positive amount.', 'error');
    return;
  }

  // Create transaction object
  const newTransaction = {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    type: state.currentType,
    amount,
    category,
    date,
    note
  };

  // Prepend to active items
  state.transactions.unshift(newTransaction);
  saveToLocalStorage();

  // Reset inputs
  DOM.amountInput.value = '';
  DOM.noteInput.value = '';
  updateHeaderDate(); // resets date picker input to today

  // Refresh UI
  renderDashboardMetrics();
  renderTransactionList();

  showToast(`Recorded ${state.currentType} transaction!`);
});

// Toggle type switch credit / debit click listeners
DOM.typeCreditBtn.addEventListener('click', () => setTransactionType('credit'));
DOM.typeDebitBtn.addEventListener('click', () => setTransactionType('debit'));

// Search Text input keyup
DOM.searchInput.addEventListener('input', (e) => {
  state.filters.search = e.target.value;
  renderTransactionList();
});

// Filter Tabs switches click
DOM.filterTabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    DOM.filterTabBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.filters.type = e.target.getAttribute('data-filter');
    renderTransactionList();
  });
});

// Budget Modal Config Open/Close
DOM.openBudgetModalBtn.addEventListener('click', () => {
  DOM.monthlyBudgetLimitInput.value = state.budgetLimit;
  DOM.budgetModalOverlay.classList.add('active');
  DOM.monthlyBudgetLimitInput.focus();
});

function closeBudgetModal() {
  DOM.budgetModalOverlay.classList.remove('active');
}

DOM.closeBudgetModalBtn.addEventListener('click', closeBudgetModal);
DOM.budgetModalOverlay.addEventListener('click', (e) => {
  if (e.target === DOM.budgetModalOverlay) {
    closeBudgetModal();
  }
});

// Budget form submission save
DOM.budgetConfigForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newLimit = parseFloat(DOM.monthlyBudgetLimitInput.value);
  if (isNaN(newLimit) || newLimit < 0) {
    showToast('Invalid budget limit value.', 'error');
    return;
  }

  state.budgetLimit = newLimit;
  saveToLocalStorage();
  closeBudgetModal();
  renderDashboardMetrics();
  showToast(`Monthly budget set to ${formatCurrency(newLimit)}`);
});

// Export Log data to CSV file format
DOM.exportCsvBtn.addEventListener('click', () => {
  if (state.transactions.length === 0) {
    showToast('No transaction data to export.', 'error');
    return;
  }

  // Build CSV content
  const headers = ['ID', 'Type', 'Amount (₹)', 'Category', 'Date', 'Note'];
  const rows = state.transactions.map(t => [
    t.id,
    t.type.toUpperCase(),
    t.amount.toFixed(2),
    t.category,
    t.date,
    `"${(t.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  // Download CSV via virtual anchor tag click
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `aura_wealth_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast('CSV Exported successfully.');
});

// --- Bootstrapping Execution ---
function init() {
  updateHeaderDate();
  
  // App starts fresh with no preloaded demo data
  if (state.transactions.length === 0) {
    state.transactions = [];
    saveToLocalStorage();
  }

  // Pre-fill default form state category to match Received
  setTransactionType('credit');

  // Load dashboards
  renderDashboardMetrics();
  renderTransactionList();
}

// Execute initial load
init();
