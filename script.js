// --- DUMMY DATA INITIALIZATION ONCE ---
if (
  !localStorage.getItem("transactions") ||
  JSON.parse(localStorage.getItem("transactions") || "[]").length === 0
) {
  const dummyTx = [
    { id: "1", date: "2025-10-21", type: "Income", category: "Salary", description: "Salary October", amount: 52000 },
    { id: "2", date: "2025-10-23", type: "Expense", category: "Rent", description: "October Rent", amount: 12000 },
    { id: "3", date: "2025-10-25", type: "Expense", category: "Food", description: "Groceries", amount: 3500 },
    { id: "4", date: "2025-10-26", type: "Investment", category: "Gold", description: "Gold ETF", amount: 7000 },
    { id: "5", date: "2025-09-10", type: "Income", category: "Salary", description: "Salary September", amount: 52000 },
    { id: "6", date: "2025-09-13", type: "Expense", category: "Rent", description: "Sept Rent", amount: 12000 },
    { id: "7", date: "2025-09-18", type: "Expense", category: "Food", description: "Dining Out", amount: 2200 },
    { id: "8", date: "2025-08-10", type: "Income", category: "Shop", description: "Side Business", amount: 11000 },
    { id: "9", date: "2025-08-11", type: "Expense", category: "Rent", description: "Aug Rent", amount: 12000 },
    { id: "10", date: "2025-08-16", type: "Expense", category: "Study", description: "Online Course", amount: 3500 },
    { id: "11", date: "2025-08-21", type: "Investment", category: "Stock market", description: "Stocks August", amount: 9000 },
    { id: "12", date: "2025-07-10", type: "Income", category: "Shop", description: "Shop Sale", amount: 8700 },
    { id: "13", date: "2025-07-11", type: "Expense", category: "Food", description: "Groceries", amount: 2700 },
    { id: "14", date: "2025-07-16", type: "Expense", category: "Study", description: "Book Purchase", amount: 2400 },
    { id: "15", date: "2025-07-21", type: "Investment", category: "Stock market", description: "Stocks July", amount: 5000 },
  ];
  localStorage.setItem("transactions", JSON.stringify(dummyTx));
}

if (!localStorage.getItem("categories")) {
  const types = [
    { type: "Investment", categories: ["Gold", "Stock market"] },
    { type: "Income", categories: ["Salary", "Shop"] },
    { type: "Expense", categories: ["Study", "Food", "Rent"] },
  ];
  localStorage.setItem("categories", JSON.stringify(types));
}

// --- ELEMENT REFERENCES ---
const page = document.querySelector("#main");
const setting = document.querySelector("#setting");
const dashboardNav = document.querySelector("#dashboard");
const transactionNav = document.querySelector("#transactions");

// --- CHART.JS INSTANCE TRACKER ---
const charts = {};

// --- LOCALSTORAGE TRANSACTION CRUD ---
function getTransactions() {
  try {
    const data = JSON.parse(localStorage.getItem("transactions")) || [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function setTransactions(data) {
  localStorage.setItem("transactions", JSON.stringify(data));
}
function addTransaction(tx) {
  const transactions = getTransactions();
  transactions.push(tx);
  setTransactions(transactions);
}
function deleteTransaction(id) {
  let transactions = getTransactions();
  transactions = transactions.filter((tx) => tx.id !== id);
  setTransactions(transactions);
}
function editTransaction(id, updated) {
  let transactions = getTransactions();
  transactions = transactions.map((tx) => (tx.id === id ? { ...tx, ...updated } : tx));
  setTransactions(transactions);
}

// --- LOCALSTORAGE CATEGORY CRUD ---
function getCategories() {
  try {
    const cats = JSON.parse(localStorage.getItem("categories"));
    return Array.isArray(cats) ? cats : [];
  } catch {
    return [];
  }
}
function setCategories(data) {
  localStorage.setItem("categories", JSON.stringify(data));
}
function addCategory(category, type) {
  let data = getCategories();
  const updatedData = data.map((t) => {
    if (t.type === type && !t.categories.includes(category)) {
      t.categories.push(category);
    }
    return t;
  });
  setCategories(updatedData);
}
function removeCategory(c, t) {
  let data = getCategories();
  const updatedData = data.map((type) => {
    if (type.type === t) {
      type.categories = type.categories.filter((cat) => cat !== c);
    }
    return type;
  });
  setCategories(updatedData);
}

// --- TOAST NOTIFICATION ---
function showToast(message, type = "info", duration = 2500) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.minWidth = "220px";
  toast.style.padding = "12px 18px";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.fontSize = "15px";
  toast.style.boxShadow = "0 3px 8px rgba(0,0,0,0.15)";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(-10px)";
  toast.style.animation = "fadeInUp 0.3s forwards";

  if (type === "success") toast.style.backgroundColor = "#4caf50";
  else if (type === "error") toast.style.backgroundColor = "#f44336";
  else toast.style.backgroundColor = "#2196f3";

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s, transform 0.3s";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// --- SMOOTH COUNTER ---
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const stepTime = 16;
  const steps = duration / stepTime;
  const increment = target / steps;
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    element.textContent = `$${Math.floor(start).toLocaleString()}`;
  }, stepTime);
}

// --- DASHBOARD ---
const getDashboard = () => {
  const transactions = getTransactions();
  let totalIncome = 0,
    totalExpense = 0,
    totalInvestment = 0;
  let expenseByCategory = {},
    investmentByCategory = {},
    expenseMonthly = {};
  let months = [];

  transactions.forEach((t) => {
    if (t.type === "Income") totalIncome += t.amount;
    else if (t.type === "Expense") {
      totalExpense += t.amount;
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      const monthKey = t.date.slice(0, 7);
      expenseMonthly[monthKey] = (expenseMonthly[monthKey] || 0) + t.amount;
      if (!months.includes(monthKey)) months.push(monthKey);
    } else if (t.type === "Investment") {
      totalInvestment += t.amount;
      investmentByCategory[t.category] = (investmentByCategory[t.category] || 0) + t.amount;
    }
  });

  let incomeMonthly = {};
  transactions.forEach((t) => {
    if (t.type === "Income") {
      const monthKey = t.date.slice(0, 7);
      incomeMonthly[monthKey] = (incomeMonthly[monthKey] || 0) + t.amount;
      if (!months.includes(monthKey)) months.push(monthKey);
    }
  });
  months.sort();

  const totalBalance = totalIncome - totalExpense + totalInvestment;
  const pieLabels = Object.keys(expenseByCategory);
  const pieData = Object.values(expenseByCategory);
  const investLabels = Object.keys(investmentByCategory);
  const investData = Object.values(investmentByCategory);
  const incomeBar = months.map((m) => incomeMonthly[m] || 0);
  const expenseBar = months.map((m) => expenseMonthly[m] || 0);
  const lineLabels = months;
  const lineData = months.map((m) => expenseMonthly[m] || 0);

  page.innerHTML = `
    <section class="balanceDisplayCtn">
      <article class="balanceCard box1">
        <h2 class="total_balance">Total Balance</h2>
        <p id="totalBalance">$0</p>
      </article>
      <article class="balanceCard"><canvas id="investmentChart"></canvas></article>
      <article class="balanceCard"><canvas id="expenseChart"></canvas></article>
    </section>
    <article class="balanceCard"><canvas id="incomeExpenseChart"></canvas></article>
    <article class="balanceCard"><h3>Monthly Spending Trends</h3><canvas id="spendingTrendChart"></canvas></article>
  `;

  const totalBalanceEl = document.getElementById("totalBalance");
  animateCounter(totalBalanceEl, totalBalance, 2000);

  // Expense Pie
  if (charts.expenseChart) charts.expenseChart.destroy();
  charts.expenseChart = new Chart(document.getElementById("expenseChart").getContext("2d"), {
    type: "pie",
    data: { labels: pieLabels, datasets: [{ data: pieData, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"] }] },
    options: { plugins: { title: { display: true, text: "Expense Breakdown by Category" } } },
  });

  // Investment Doughnut
  if (charts.investmentChart) charts.investmentChart.destroy();
  charts.investmentChart = new Chart(document.getElementById("investmentChart").getContext("2d"), {
    type: "doughnut",
    data: { labels: investLabels, datasets: [{ data: investData, backgroundColor: ["#3F51B5", "#009688", "#FFC107"] }] },
    options: { plugins: { title: { display: true, text: "Investment" } } },
  });

  // Income vs Expense Bar
  if (charts.incomeExpenseChart) charts.incomeExpenseChart.destroy();
  charts.incomeExpenseChart = new Chart(document.getElementById("incomeExpenseChart").getContext("2d"), {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        { label: "Income (₹)", data: incomeBar, backgroundColor: "#4CAF50" },
        { label: "Expenses (₹)", data: expenseBar, backgroundColor: "#F44336" },
      ],
    },
    options: { plugins: { title: { display: true, text: "Expense Vs Income" } } },
  });

  // Monthly Line
  if (charts.spendingTrendChart) charts.spendingTrendChart.destroy();
  charts.spendingTrendChart = new Chart(document.getElementById("spendingTrendChart").getContext("2d"), {
    type: "line",
    data: { labels: lineLabels, datasets: [{ label: "Monthly Expenses (₹)", data: lineData, borderColor: "#42A5F5", fill: false, tension: 0.25 }] },
  });
};

// --- SETTINGS PAGE ---
setting.onclick = () => {
  let data = getCategories();
  page.innerHTML = `
    <section class="settingCtn">
      ${data
        .map(
          (group) => `
        <section class="income">
          <h2>${group.type} Category</h2>
          <section class="categoryCtn">
            ${group.categories
              .map(
                (c) => `
              <article>${c}<i class="fa-solid fa-xmark remove-cat" data-type="${group.type}" data-cat="${c}"></i></article>
            `
              )
              .join("")}
          </section>
          <section class="categoryForm">
            <input type="text" class="new-cat-input" placeholder="Add new category">
            <button class="add-cat-btn" data-type="${group.type}">Add</button>
          </section>
        </section>
      `
        )
        .join("")}
    </section>
  `;
  document.querySelectorAll(".add-cat-btn").forEach((btn) => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      const input = btn.previousElementSibling;
      const category = input.value.trim();
      if (category) {
        addCategory(category, type);
        setting.onclick();
        showToast("Category added successfully!", "success");
      } else {
        showToast("Please enter a category name.", "error");
      }
    };
  });
  document.querySelectorAll(".remove-cat").forEach((icon) => {
    icon.onclick = () => {
      const type = icon.dataset.type;
      const cat = icon.dataset.cat;
      removeCategory(cat, type);
      setting.onclick();
      showToast("Category removed.", "info");
    };
  });
};

// --- TRANSACTIONS PAGE ---
transactionNav.onclick = () => {
  const categories = getCategories();
  const Transactionpage = document.querySelector("#main");

  Transactionpage.innerHTML = `
    <section class="transaction-container">
      <header class="transaction-header">
        <h2>Transaction</h2>
        <button id="addTransactionBtn"><i class="fa-solid fa-plus"></i> Add Transaction</button>
      </header>
      <section class="filter-section" id="filterBar">
        <button class="filter-btn active" data-type="All">All</button>
        <button class="filter-btn" data-type="Income">Income</button>
        <button class="filter-btn" data-type="Expense">Expense</button>
        <button class="filter-btn" data-type="Investment">Investment</button>
      </section>
      <section class="transaction-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="transactionList"></tbody>
        </table>
      </section>
    </section>
    <div class="modal" id="transactionModal" style="display:none">
      <div class="modal-content">
        <h3 id="modalTitle">Add New Transaction</h3>
        <form id="transactionForm">
          <label>Type:</label>
          <select id="type">
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
            <option value="Investment">Investment</option>
          </select>
          <label>Category:</label>
          <select id="category"></select>
          <label>Description:</label>
          <input type="text" id="description" placeholder="Enter details">
          <label>Amount (₹):</label>
          <input type="number" id="amount" placeholder="Enter amount" min="0">
          <button type="submit" id="submitBtn">Add</button>
          <button type="button" id="cancelModal">Cancel</button>
        </form>
      </div>
    </div>
  `;

  const modal = document.querySelector("#transactionModal");
  const addBtn = document.querySelector("#addTransactionBtn");
  const cancelModal = document.querySelector("#cancelModal");
  const typeSelect = document.querySelector("#type");
  const categorySelect = document.querySelector("#category");
  const transactionForm = document.getElementById("transactionForm");
  const modalTitle = document.getElementById("modalTitle");
  const submitBtn = document.getElementById("submitBtn");
  let editId = null;

  function filterCategories(selectedType) {
    const group = categories.find((c) => c.type === selectedType);
    categorySelect.innerHTML = "";
    if (group && Array.isArray(group.categories)) {
      group.categories.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
      });
    }
  }
  filterCategories(typeSelect.value);
  typeSelect.addEventListener("change", (e) => filterCategories(e.target.value));

  let currentFilter = "All";

  function renderTransactions() {
    const tbody = document.getElementById("transactionList");
    let transactions = getTransactions();
    if (currentFilter !== "All") {
      transactions = transactions.filter((tx) => tx.type === currentFilter);
    }
    tbody.innerHTML = transactions
      .map(
        (tx) => `
      <tr>
        <td>${tx.date}</td>
        <td>${tx.category}</td>
        <td>${tx.description}</td>
        <td>${tx.type}</td>
        <td>${tx.amount}</td>
        <td>
          <button class="edit-btn" data-id="${tx.id}" title="Edit"><i class="fa-solid fa-pencil"></i></button>
          <button class="delete-btn" data-id="${tx.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `
      )
      .join("");
    attachRowListeners();
  }

  function resetForm() {
    transactionForm.reset();
    typeSelect.value = "Income";
    filterCategories("Income");
    editId = null;
    modalTitle.textContent = "Add New Transaction";
    submitBtn.textContent = "Add";
  }

  function attachRowListeners() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const tx = getTransactions().find((t) => t.id === id);
        if (tx) {
          modal.style.display = "flex";
          modalTitle.textContent = "Edit Transaction";
          submitBtn.textContent = "Update";
          typeSelect.value = tx.type;
          filterCategories(tx.type);
          categorySelect.value = tx.category;
          document.getElementById("description").value = tx.description;
          document.getElementById("amount").value = tx.amount;
          editId = id;
        }
      };
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        if (confirm("Delete this transaction?")) {
          deleteTransaction(id);
          renderTransactions();
          showToast("Transaction deleted!", "info");
        }
      };
    });
  }

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.type;
      renderTransactions();
    };
  });

  addBtn.onclick = () => {
    modal.style.display = "flex";
    resetForm();
  };
  cancelModal.onclick = () => {
    modal.style.display = "none";
  };

  transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = typeSelect.value;
    const category = categorySelect.value;
    const description = document.getElementById("description").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);

    if (!description) return showToast("Please enter description.", "error");
    if (!amount || amount <= 0) return showToast("Enter valid amount.", "error");

    const txData = {
      id: editId || Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      type,
      category,
      description,
      amount,
    };

    if (editId) {
      editTransaction(editId, txData);
      showToast("Transaction updated!", "success");
    } else {
      addTransaction(txData);
      showToast("Transaction added successfully!", "success");
    }

    modal.style.display = "none";
    renderTransactions();
  });

  renderTransactions();
};

// --- INITIAL DASHBOARD LOAD ---
dashboardNav.onclick = getDashboard;
getDashboard();
