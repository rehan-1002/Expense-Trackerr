let state = {
  transactions: JSON.parse(localStorage.getItem('aura_transactions')) || [],
  budgetLimit: parseFloat(localStorage.getItem('aura_budget_limit')) || 8000.00,
  currentType: 'credit', 
  filters: {
    search: '',
    type: 'all' 
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

  transactionForm: document.getElementById('transactionForm'),
  typeCreditBtn: document.getElementById('typeCreditBtn'),
  typeDebitBtn: document.getElementById('typeDebitBtn'),
  amountInput: document.getElementById('amountInput'),
  categoryInput: document.getElementById('categoryInput'),
  dateInput: document.getElementById('dateInput'),
  noteInput: document.getElementById('noteInput'),

  searchInput: document.getElementById('searchInput'),
  filterTabBtns: document.querySelectorAll('.filter-tab-btn'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  transactionListContainer: document.getElementById('transactionListContainer'),

  budgetModalOverlay: document.getElementById('budgetModalOverlay'),
  budgetConfigForm: document.getElementById('budgetConfigForm'),
  monthlyBudgetLimitInput: document.getElementById('monthlyBudgetLimitInput'),
  closeBudgetModalBtn: document.getElementById('closeBudgetModalBtn'),

  toastContainer: document.getElementById('toastContainer')
};

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${message}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}

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
    timeZone: 'UTC' 
  });
}

function updateHeaderDate() {
  const now = new Date();
  const options = { month: 'long', year: 'numeric' };
  DOM.currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);

  const todayStr = now.toISOString().split('T')[0];
  DOM.dateInput.value = todayStr;
}

function saveToLocalStorage() {
  localStorage.setItem('aura_transactions', JSON.stringify(state.transactions));
  localStorage.setItem('aura_budget_limit', state.budgetLimit.toString());
}

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

  DOM.netBalanceAmount.textContent = formatCurrency(netBalance);
  DOM.totalIncomeAmount.textContent = `+${formatCurrency(income)}`;
  DOM.totalExpenseAmount.textContent = `-${formatCurrency(expense)}`;

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

  const currentBudgetSpent = expense; 
  const budgetPercentageValue = state.budgetLimit > 0 
    ? Math.min(Math.round((currentBudgetSpent / state.budgetLimit) * 100), 200) 
    : 0;

  DOM.budgetPercentage.textContent = `${budgetPercentageValue}%`;
  DOM.budgetSpentVsLimit.textContent = `${formatCurrency(currentBudgetSpent)} spent of ${formatCurrency(state.budgetLimit)}`;

  DOM.budgetProgressBar.style.width = `${Math.min(budgetPercentageValue, 100)}%`;

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

function renderInsights(totalExpense) {

  const dynamicBars = DOM.insightsContainer.querySelectorAll('.category-bar-wrapper, .top-item-highlight');
  dynamicBars.forEach(bar => bar.remove());

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

  categoryEntries.sort((a, b) => b[1] - a[1]);

  const topCategory = categoryEntries[0];
  const maxSpend = topCategory[1];

  const highlightElement = document.createElement('div');
  highlightElement.className = 'top-item-highlight';
  const catMetadata = CATEGORIES[topCategory[0]] || { label: topCategory[0], icon: 'fa-asterisk' };
  highlightElement.innerHTML = `
    <i class="fa-solid ${catMetadata.icon}"></i>
    ${catMetadata.label}
    <span>Top Spend</span>
  `;
  DOM.insightsContainer.appendChild(highlightElement);

  categoryEntries.slice(0, 3).forEach(([catKey, totalSpent]) => {
    const categoryInfo = CATEGORIES[catKey] || { label: catKey, icon: 'fa-asterisk' };
    const pct = totalExpense > 0 ? Math.round((totalSpent / totalExpense) * 100) : 0;

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

function renderTransactionList() {
  DOM.transactionListContainer.innerHTML = '';

  const filtered = state.transactions.filter(t => {

    if (state.filters.type !== 'all' && t.type !== state.filters.type) {
      return false;
    }

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

    card.querySelector('.transaction-delete-btn').addEventListener('click', (e) => {
      const idToDelete = e.currentTarget.getAttribute('data-id');
      deleteTransaction(idToDelete);
    });

    DOM.transactionListContainer.appendChild(card);
  });
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveToLocalStorage();
  renderDashboardMetrics();
  renderTransactionList();
  showToast('Transaction deleted successfully.', 'error');
}

function setTransactionType(type) {
  state.currentType = type;
  if (type === 'credit') {
    DOM.typeCreditBtn.classList.add('active');
    DOM.typeDebitBtn.classList.remove('active');

    DOM.categoryInput.value = 'pocket_money';
  } else {
    DOM.typeDebitBtn.classList.add('active');
    DOM.typeCreditBtn.classList.remove('active');

    DOM.categoryInput.value = 'food';
  }
}

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

  const newTransaction = {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    type: state.currentType,
    amount,
    category,
    date,
    note
  };

  state.transactions.unshift(newTransaction);
  saveToLocalStorage();

  DOM.amountInput.value = '';
  DOM.noteInput.value = '';
  updateHeaderDate(); 

  renderDashboardMetrics();
  renderTransactionList();

  showToast(`Recorded ${state.currentType} transaction!`);
});

DOM.typeCreditBtn.addEventListener('click', () => setTransactionType('credit'));
DOM.typeDebitBtn.addEventListener('click', () => setTransactionType('debit'));

DOM.searchInput.addEventListener('input', (e) => {
  state.filters.search = e.target.value;
  renderTransactionList();
});

DOM.filterTabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    DOM.filterTabBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.filters.type = e.target.getAttribute('data-filter');
    renderTransactionList();
  });
});

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

DOM.exportCsvBtn.addEventListener('click', () => {
  if (state.transactions.length === 0) {
    showToast('No transaction data to export.', 'error');
    return;
  }

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

function init() {
  updateHeaderDate();

  if (state.transactions.length === 0) {
    state.transactions = [];
    saveToLocalStorage();
  }

  setTransactionType('credit');

  renderDashboardMetrics();
  renderTransactionList();
}

init();
