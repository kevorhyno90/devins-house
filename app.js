// =========================================================================
// DEVIN'S HOUSE - PWA & ARCHITECTURAL MANAGEMENT APPLICATION ENGINE
// =========================================================================

// -------------------------------------------------------------------------
// 1. PWA Service Worker Registration & App Install Handler
// -------------------------------------------------------------------------
let deferredInstallPrompt = null;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then((reg) => console.log("[Devin's House] Service Worker Registered:", reg.scope))
      .catch((err) => console.log("[Devin's House] Service Worker Error:", err));
  });
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const installBtn = document.getElementById("installAppBtn");
  if (installBtn) {
    installBtn.classList.remove("hidden-element");
  }
});

function triggerAppInstall() {
  if (!deferredInstallPrompt) {
    alert("Devin's House is already installed or your browser supports installing via the browser address bar icon (+).");
    return;
  }
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === "accepted") {
      console.log("[Devin's House] User accepted the PWA install prompt");
    }
    deferredInstallPrompt = null;
    const installBtn = document.getElementById("installAppBtn");
    if (installBtn) installBtn.classList.add("hidden-element");
  });
}

// -------------------------------------------------------------------------
// 2. Google Identity & Profile State Management
// -------------------------------------------------------------------------
const DEFAULT_USER = {
  name: "Devin",
  role: "Homeowner & Master Builder",
  email: "devin.builder@gmail.com",
  photo: "app_icon.jpg"
};

let currentUser = JSON.parse(localStorage.getItem("devins_house_user")) || DEFAULT_USER;

function initUserProfile() {
  const nameEl = document.getElementById("profileName");
  const roleEl = document.getElementById("profileRole");
  const avatarEl = document.getElementById("profileAvatar");

  if (nameEl) nameEl.textContent = currentUser.name;
  if (roleEl) roleEl.textContent = currentUser.role;
  if (avatarEl) avatarEl.src = currentUser.photo;
}

function promptGoogleSignIn() {
  const enteredName = prompt("Sign in with Google - Enter your name:", currentUser.name);
  if (enteredName && enteredName.trim() !== "") {
    currentUser.name = enteredName.trim();
    currentUser.email = enteredName.toLowerCase().replace(/\s+/g, "") + "@gmail.com";
    localStorage.setItem("devins_house_user", JSON.stringify(currentUser));
    initUserProfile();
    alert(`Welcome to Devin's House, ${currentUser.name}! Your workspace is synced and ready offline.`);
  }
}

// -------------------------------------------------------------------------
// 3. Tab Navigation Engine
// -------------------------------------------------------------------------
function switchToTab(tabId, index, jumpTargetId) {
  document.querySelectorAll(".tab-btn").forEach((btn, i) => {
    const btnTab = btn.getAttribute("data-tab");
    if (btnTab) {
      btn.classList.toggle("active", btnTab === tabId);
    } else if (typeof index === "number") {
      btn.classList.toggle("active", i === index);
    }
  });

  document.querySelectorAll(".deck-card, .opt-summary-card").forEach((card, i) => {
    const cardTab = card.getAttribute("data-tab");
    if (cardTab) {
      card.classList.toggle("active-opt", cardTab === tabId);
    } else if (typeof index === "number") {
      card.classList.toggle("active-opt", i === index);
    }
  });

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  const activeContent = document.getElementById("tab-" + tabId);
  if (activeContent) {
    activeContent.classList.add("active");
  }

  if (jumpTargetId) {
    setTimeout(() => {
      const targetEl = document.getElementById(jumpTargetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function scrollToDesign(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// -------------------------------------------------------------------------
// 4. Live Editable Room Measurements Engine
// -------------------------------------------------------------------------
const DEFAULT_MEASUREMENTS = {
  plotWidth: 8.00,
  plotDepth: 5.00,
  seatingWidth: 4.40,
  seatingDepth: 2.80,
  kidsWidth: 2.80,
  kidsDepth: 2.20,
  kitchenWidth: 3.80,
  kitchenDepth: 2.60,
  masterWidth: 3.80,
  masterDepth: 2.60,
  doorWidth: 1.07, // 3.5 feet
  cathedralHeight: 4.20,
  slabHeight: 2.40,
  opt6MasterWidth: 4.00,
  opt6MasterDepth: 5.00,
  opt6KidsWidth: 2.60,
  opt6KidsDepth: 3.20,
  opt6KitchenWidth: 2.40,
  opt6KitchenDepth: 3.20
};

let measurements = JSON.parse(localStorage.getItem("devins_measurements")) || DEFAULT_MEASUREMENTS;

function initMeasurements() {
  for (const [key, val] of Object.entries(measurements)) {
    const input = document.getElementById("input_" + key);
    if (input) input.value = val;
  }
  recalculateAreas();
}

function onMeasurementChange() {
  for (const key of Object.keys(measurements)) {
    const input = document.getElementById("input_" + key);
    if (input && !isNaN(parseFloat(input.value))) {
      measurements[key] = parseFloat(input.value);
    }
  }
  localStorage.setItem("devins_measurements", JSON.stringify(measurements));
  recalculateAreas();
}

function recalculateAreas() {
  const footprint = (measurements.plotWidth * measurements.plotDepth).toFixed(2);
  const seatingArea = (measurements.seatingWidth * measurements.seatingDepth).toFixed(2);
  const kidsArea = (measurements.kidsWidth * measurements.kidsDepth).toFixed(2);
  const kitchenArea = (measurements.kitchenWidth * measurements.kitchenDepth).toFixed(2);
  const masterArea = (measurements.masterWidth * measurements.masterDepth).toFixed(2);

  setText("calc_footprint", footprint + " m²");
  setText("calc_seatingArea", seatingArea + " m²");
  setText("calc_kidsArea", kidsArea + " m²");
  setText("calc_kitchenArea", kitchenArea + " m²");
  setText("calc_masterArea", masterArea + " m²");

  // Option 6 Live Recalculations
  const opt6Master = ((measurements.opt6MasterWidth || 4.0) * (measurements.opt6MasterDepth || 5.0)).toFixed(2);
  const opt6Kids = ((measurements.opt6KidsWidth || 2.6) * (measurements.opt6KidsDepth || 3.2)).toFixed(2);
  const opt6Kitchen = ((measurements.opt6KitchenWidth || 2.4) * (measurements.opt6KitchenDepth || 3.2)).toFixed(2);

  setText("calc_opt6MasterArea", opt6Master + " m²");
  setText("calc_opt6KidsArea", opt6Kids + " m²");
  setText("calc_opt6KitchenArea", opt6Kitchen + " m²");

  // Re-run paint and structural calculators based on updated measurements
  calculateFinishes();
  calculateStructuralCost();
}

function resetMeasurements() {
  if (confirm("Reset all dimensions to the approved 8.00m x 5.00m specifications?")) {
    measurements = { ...DEFAULT_MEASUREMENTS };
    localStorage.setItem("devins_measurements", JSON.stringify(measurements));
    initMeasurements();
  }
}

// -------------------------------------------------------------------------
// 5. Construction Expense & Budget Tracker
// -------------------------------------------------------------------------
const DEFAULT_BUDGET = 32000;
let totalBudget = parseFloat(localStorage.getItem("devins_budget")) || DEFAULT_BUDGET;

const DEFAULT_EXPENSES = [
  { id: 1, name: "Site Clearance & Setting Out", cat: "Foundation", amount: 650, date: "2026-09-01", status: "Paid" },
  { id: 2, name: "Excavation & Strip Footing Concrete", cat: "Foundation", amount: 2800, date: "2026-09-05", status: "Paid" },
  { id: 3, name: "Ground Floor Concrete Slab (40m²)", cat: "Foundation", amount: 3400, date: "2026-09-12", status: "Paid" },
  { id: 4, name: "Perimeter Blockwork Masonry (8m x 5m)", cat: "Masonry", amount: 4100, date: "2026-09-18", status: "Pending" },
  { id: 5, name: "Reinforced Intermediate Slab Over Kitchen", cat: "Masonry", amount: 2100, date: "2026-09-25", status: "Pending" },
  { id: 6, name: "Kangaroo Hidden Parapet Roof Framing", cat: "Roofing", amount: 3900, date: "2026-10-02", status: "Pending" },
  { id: 7, name: "3.5ft Solid Metal Security Door", cat: "Doors/Windows", amount: 850, date: "2026-10-08", status: "Pending" },
  { id: 8, name: "Electrical Wiring & Conduit Piping", cat: "Electrical", amount: 1400, date: "2026-10-15", status: "Pending" },
  { id: 9, name: "Concealed Box Gutters & Drainage", cat: "Plumbing", amount: 950, date: "2026-10-20", status: "Pending" }
];

let expenses = JSON.parse(localStorage.getItem("devins_expenses")) || DEFAULT_EXPENSES;

function initExpenseTracker() {
  const budgetInput = document.getElementById("totalBudgetInput");
  if (budgetInput) budgetInput.value = totalBudget;
  renderExpenseTable();
}

function updateBudget() {
  const input = document.getElementById("totalBudgetInput");
  if (input && !isNaN(parseFloat(input.value))) {
    totalBudget = parseFloat(input.value);
    localStorage.setItem("devins_budget", totalBudget.toString());
    renderExpenseTable();
  }
}

function addExpense(e) {
  e.preventDefault();
  const name = document.getElementById("expName").value.trim();
  const cat = document.getElementById("expCategory").value;
  const amount = parseFloat(document.getElementById("expAmount").value);
  const date = document.getElementById("expDate").value || new Date().toISOString().slice(0, 10);
  const status = document.getElementById("expStatus").value;

  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid expense title and positive amount.");
    return;
  }

  const newExpense = {
    id: Date.now(),
    name,
    cat,
    amount,
    date,
    status
  };

  expenses.unshift(newExpense);
  localStorage.setItem("devins_expenses", JSON.stringify(expenses));
  document.getElementById("expenseForm").reset();
  renderExpenseTable();
}

let currentlyEditingExpenseId = null;

function adjustBudget(delta) {
  totalBudget = Math.max(0, totalBudget + delta);
  localStorage.setItem("devins_budget", totalBudget.toString());
  const budgetInput = document.getElementById("totalBudgetInput");
  if (budgetInput) budgetInput.value = totalBudget;
  renderExpenseTable();
}

function toggleExpenseStatus(id) {
  const item = expenses.find((e) => e.id === id);
  if (item) {
    item.status = item.status === "Paid" ? "Pending" : "Paid";
    localStorage.setItem("devins_expenses", JSON.stringify(expenses));
    renderExpenseTable();
  }
}

function startEditExpense(id) {
  currentlyEditingExpenseId = id;
  renderExpenseTable();
}

function cancelExpenseEdit() {
  currentlyEditingExpenseId = null;
  renderExpenseTable();
}

function saveExpenseRow(id) {
  const nameEl = document.getElementById("edit_exp_name_" + id);
  const catEl = document.getElementById("edit_exp_cat_" + id);
  const amountEl = document.getElementById("edit_exp_amount_" + id);
  const dateEl = document.getElementById("edit_exp_date_" + id);
  const statusEl = document.getElementById("edit_exp_status_" + id);

  if (!nameEl || !amountEl) return;

  const newName = nameEl.value.trim();
  const newCat = catEl ? catEl.value : "General";
  const newAmount = parseFloat(amountEl.value);
  const newDate = dateEl ? dateEl.value : "";
  const newStatus = statusEl ? statusEl.value : "Pending";

  if (!newName || isNaN(newAmount) || newAmount <= 0) {
    alert("Please enter a valid expense title and positive amount.");
    return;
  }

  const item = expenses.find((e) => e.id === id);
  if (item) {
    item.name = newName;
    item.cat = newCat;
    item.amount = newAmount;
    item.date = newDate;
    item.status = newStatus;

    localStorage.setItem("devins_expenses", JSON.stringify(expenses));
    currentlyEditingExpenseId = null;
    renderExpenseTable();
  }
}

function deleteExpense(id) {
  if (confirm("Delete this expense item?")) {
    expenses = expenses.filter((item) => item.id !== id);
    localStorage.setItem("devins_expenses", JSON.stringify(expenses));
    if (currentlyEditingExpenseId === id) currentlyEditingExpenseId = null;
    renderExpenseTable();
  }
}

function loadOption6EstimateItems() {
  const opt6Items = [
    { id: Date.now() + 1, name: "Option 6: 4 Solid Masonry Pillars & Footings", cat: "Masonry", amount: 480, date: new Date().toISOString().slice(0, 10), status: "Pending" },
    { id: Date.now() + 2, name: "Option 6: Structural Steel I-Beams (150x75mm)", cat: "Masonry", amount: 580, date: new Date().toISOString().slice(0, 10), status: "Pending" },
    { id: Date.now() + 3, name: "Option 6: 50x150mm Timber Joists & T&G Decking", cat: "Roofing", amount: 650, date: new Date().toISOString().slice(0, 10), status: "Pending" },
    { id: Date.now() + 4, name: "Option 6: Under-Stair TV Unit & Bookshelves", cat: "Finishes", amount: 420, date: new Date().toISOString().slice(0, 10), status: "Pending" },
    { id: Date.now() + 5, name: "Option 6: Kids Built-in Bunk Beds & Step Drawers", cat: "Finishes", amount: 550, date: new Date().toISOString().slice(0, 10), status: "Pending" }
  ];

  expenses = [...opt6Items, ...expenses];
  localStorage.setItem("devins_expenses", JSON.stringify(expenses));
  renderExpenseTable();
  alert("Added Option 6 Smart Zero-Slab estimate items to the budget tracker!");
}

const CATEGORY_OPTIONS = [
  "Foundation",
  "Masonry",
  "Roofing",
  "Doors/Windows",
  "Electrical",
  "Plumbing",
  "Finishes",
  "Labor",
  "Permits"
];

function renderExpenseTable() {
  const tbody = document.getElementById("expenseTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  let totalSpent = 0;

  expenses.forEach((item) => {
    totalSpent += item.amount;
    const tr = document.createElement("tr");

    if (currentlyEditingExpenseId === item.id) {
      const catOptionsHTML = CATEGORY_OPTIONS.map(c => `<option value="${c}" ${c === item.cat ? 'selected' : ''}>${c}</option>`).join("");
      tr.innerHTML = `
        <td><input type="text" id="edit_exp_name_${item.id}" class="form-input table-edit-input" value="${escapeHTML(item.name)}" /></td>
        <td><select id="edit_exp_cat_${item.id}" class="form-select table-edit-input">${catOptionsHTML}</select></td>
        <td><input type="number" id="edit_exp_amount_${item.id}" class="form-input table-edit-input" value="${item.amount}" style="max-width: 110px;" /></td>
        <td><input type="date" id="edit_exp_date_${item.id}" class="form-input table-edit-input" value="${item.date}" /></td>
        <td>
          <select id="edit_exp_status_${item.id}" class="form-select table-edit-input">
            <option value="Paid" ${item.status === 'Paid' ? 'selected' : ''}>Paid</option>
            <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
          </select>
        </td>
        <td>
          <div class="table-action-cell">
            <button type="button" class="save-row-btn" onclick="saveExpenseRow(${item.id})">💾 Save</button>
            <button type="button" class="cancel-row-btn" onclick="cancelExpenseEdit()">Cancel</button>
          </div>
        </td>
      `;
    } else {
      tr.innerHTML = `
        <td><strong>${escapeHTML(item.name)}</strong></td>
        <td><span class="badge-pill pill-blue">${item.cat}</span></td>
        <td><strong>$${item.amount.toLocaleString()}</strong></td>
        <td>${item.date}</td>
        <td>
          <span class="badge-pill clickable-status-badge ${item.status === 'Paid' ? 'pill-green' : 'pill-amber'}" 
                onclick="toggleExpenseStatus(${item.id})" title="Click to toggle Paid/Pending">
            ${item.status === 'Paid' ? '✓ Paid' : '⏳ Pending'}
          </span>
        </td>
        <td>
          <div class="table-action-cell">
            <button type="button" class="edit-row-btn" onclick="startEditExpense(${item.id})">✏️ Edit</button>
            <button type="button" class="ctrl-action-btn delete-btn" onclick="deleteExpense(${item.id})">Delete</button>
          </div>
        </td>
      `;
    }

    tbody.appendChild(tr);
  });

  const remaining = totalBudget - totalSpent;
  const percent = Math.min(100, Math.round((totalSpent / (totalBudget || 1)) * 100));

  setText("stat_totalBudget", "$" + totalBudget.toLocaleString());
  setText("stat_totalSpent", "$" + totalSpent.toLocaleString());
  setText("stat_remainingBudget", "$" + remaining.toLocaleString());
  setText("stat_budgetPercent", percent + "%");

  const progressBar = document.getElementById("budgetProgressBar");
  if (progressBar) {
    progressBar.style.width = percent + "%";
    progressBar.className = "progress-fill " + (percent > 90 ? "fill-danger" : percent > 70 ? "fill-warning" : "fill-success");
  }
}

// -------------------------------------------------------------------------
// 6. Finishing, Painting & Construction Cost Calculators
// -------------------------------------------------------------------------
function calculateFinishes() {
  const wallAreaGross = (2 * (measurements.plotWidth + measurements.plotDepth)) * measurements.cathedralHeight;
  const openingsArea = 16.5; // Windows + doors deducted
  const netWallArea = Math.max(10, wallAreaGross - openingsArea);

  // 1 Liter of primer covers ~10 m²
  const primerLiters = Math.ceil(netWallArea / 10);
  // 1 Liter of topcoat covers ~8 m² per coat (2 coats required)
  const paintLiters = Math.ceil((netWallArea * 2) / 8);
  const paintCost = (primerLiters * 18) + (paintLiters * 28); // $18/L primer, $28/L quality acrylic

  setText("calc_netWallArea", netWallArea.toFixed(1) + " m²");
  setText("calc_primerLiters", primerLiters + " Liters");
  setText("calc_paintLiters", paintLiters + " Liters (2 coats)");
  setText("calc_paintCost", "$" + paintCost.toLocaleString());

  // Flooring Calculator
  const parquetArea = ((measurements.seatingWidth * measurements.seatingDepth) + (measurements.masterWidth * measurements.masterDepth)) * 1.10; // +10% wastage
  const floorCost = Math.round(parquetArea * 45); // $45/m² engineered oak
  setText("calc_parquetArea", parquetArea.toFixed(1) + " m² (incl 10% wastage)");
  setText("calc_parquetCost", "$" + floorCost.toLocaleString());
}

function calculateElectrical() {
  const lightPoints = parseInt(document.getElementById("input_lightPoints")?.value || 14);
  const socketPoints = parseInt(document.getElementById("input_socketPoints")?.value || 12);
  const coveStrips = parseInt(document.getElementById("input_coveStrips")?.value || 25); // meters

  const cost = (lightPoints * 40) + (socketPoints * 55) + (coveStrips * 22) + 650; // $650 DB & breakers
  setText("calc_electricalCost", "$" + cost.toLocaleString());
}

function calculatePlumbing() {
  const gutterLength = parseFloat(document.getElementById("input_gutterLength")?.value || 16); // meters of concealed box gutter
  const bathPoints = parseInt(document.getElementById("input_bathPoints")?.value || 4); // Shower, WC, Basin, External tap

  // Note: Kitchen is strictly DRY (saves $1,500 in plumbing costs)
  const cost = (gutterLength * 65) + (bathPoints * 180) + 450; // Drainage & inspection chambers
  setText("calc_plumbingCost", "$" + cost.toLocaleString());
}

function calculateStructuralCost() {
  const concreteGround = (measurements.plotWidth * measurements.plotDepth * 0.15); // 150mm slab
  const concreteKitchenSlab = (measurements.kitchenWidth * measurements.kitchenDepth * 0.15); // Kitchen slab only
  const totalConcrete = (concreteGround + concreteKitchenSlab).toFixed(1);

  const masonryBlocks = Math.round(2 * (measurements.plotWidth + measurements.plotDepth) * measurements.cathedralHeight * 12.5);
  const structuralCost = Math.round((concreteGround * 220) + (concreteKitchenSlab * 260) + (masonryBlocks * 3.5) + 3800); // 3800 kangaroo roof structure

  setText("calc_totalConcrete", totalConcrete + " m³");
  setText("calc_masonryBlocks", masonryBlocks.toLocaleString() + " blocks");
  setText("calc_structuralEstimate", "$" + structuralCost.toLocaleString());
}

// -------------------------------------------------------------------------
// 7. Construction Milestone Progress Tracker
// -------------------------------------------------------------------------
const DEFAULT_MILESTONES = [
  { id: 1, title: "1. Site Clearance & Setting Out", status: "Done" },
  { id: 2, title: "2. Foundation Excavation & Concrete Footings", status: "Done" },
  { id: 3, title: "3. Ground Concrete Slab Pouring (40m²)", status: "Done" },
  { id: 4, title: "4. Superstructure Blockwork Walls (8m x 5m)", status: "In Progress" },
  { id: 5, title: "5. Reinforced Slab Over Kitchen Area", status: "Pending" },
  { id: 6, title: "6. Kangaroo Hidden Roof Framing & Parapet Coping", status: "Pending" },
  { id: 7, title: "7. Single 3.5ft Metal Door & Window Glazing", status: "Pending" },
  { id: 8, title: "8. Electrical, Box Gutters & Plumbing Rough-In", status: "Pending" },
  { id: 9, title: "9. Interior Plastering, Ceilings & Untouched Stairs", status: "Pending" },
  { id: 10, title: "10. Cabinetry, Master Changing Nook & Painting", status: "Pending" }
];

let milestones = JSON.parse(localStorage.getItem("devins_milestones")) || DEFAULT_MILESTONES;

function initMilestones() {
  renderMilestones();
}

function setMilestoneStatus(id, newStatus) {
  const item = milestones.find((m) => m.id === id);
  if (item) {
    item.status = newStatus;
    localStorage.setItem("devins_milestones", JSON.stringify(milestones));
    renderMilestones();
  }
}

function renderMilestones() {
  const container = document.getElementById("milestonesList");
  if (!container) return;

  container.innerHTML = "";
  let doneCount = 0;

  milestones.forEach((m) => {
    if (m.status === "Done") doneCount++;
    const card = document.createElement("div");
    card.className = "milestone-item " + (m.status === "Done" ? "milestone-done" : m.status === "In Progress" ? "milestone-active" : "");
    card.innerHTML = `
      <div class="milestone-title-row">
        <strong>${escapeHTML(m.title)}</strong>
        <span class="badge-pill ${m.status === 'Done' ? 'pill-green' : m.status === 'In Progress' ? 'pill-amber' : 'pill-slate'}">${m.status}</span>
      </div>
      <div class="milestone-controls">
        <button class="ctrl-btn-small" onclick="setMilestoneStatus(${m.id}, 'Done')">Mark Done</button>
        <button class="ctrl-btn-small" onclick="setMilestoneStatus(${m.id}, 'In Progress')">In Progress</button>
        <button class="ctrl-btn-small" onclick="setMilestoneStatus(${m.id}, 'Pending')">Pending</button>
      </div>
    `;
    container.appendChild(card);
  });

  const progressPercent = Math.round((doneCount / milestones.length) * 100);
  setText("stat_milestonePercent", progressPercent + "% Completed");
  const bar = document.getElementById("milestoneProgressBar");
  if (bar) bar.style.width = progressPercent + "%";
}

// -------------------------------------------------------------------------
// 8. Export & Download Hub
// -------------------------------------------------------------------------
function downloadImage(imgSrc, filename) {
  const a = document.createElement("a");
  a.href = imgSrc;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportExpensesCSV() {
  let csv = "ID,Expense Name,Category,Amount ($),Date,Status\n";
  expenses.forEach((item) => {
    csv += `"${item.id}","${item.name.replace(/"/g, '""')}","${item.cat}",${item.amount},"${item.date}","${item.status}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "devins_house_expenses.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportAllDataJSON() {
  const data = {
    user: currentUser,
    measurements,
    totalBudget,
    expenses,
    milestones,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "devins_house_master_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function printFullSpecificationDocument() {
  window.print();
}

// -------------------------------------------------------------------------
// Helper Utilities
// -------------------------------------------------------------------------
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// -------------------------------------------------------------------------
// Initial Setup on DOM Ready
// -------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initUserProfile();
  initMeasurements();
  initExpenseTracker();
  calculateFinishes();
  calculateElectrical();
  calculatePlumbing();
  calculateStructuralCost();
  initMilestones();

  const expForm = document.getElementById("expenseForm");
  if (expForm) expForm.addEventListener("submit", addExpense);

  loadInPlaceEdits();
});

// -------------------------------------------------------------------------
// 12. Universal In-Place Live Editing Engine
// -------------------------------------------------------------------------
let isEditModeActive = false;

function toggleEditMode() {
  isEditModeActive = !isEditModeActive;
  document.body.classList.toggle("in-edit-mode", isEditModeActive);

  const btn = document.getElementById("toggleEditModeBtn");
  const btnText = document.getElementById("editModeBtnText");
  const floatingBar = document.getElementById("floatingEditBar");

  if (btn && btnText) {
    if (isEditModeActive) {
      btn.classList.add("editing-active");
      btnText.textContent = "Edit Mode: ON";
      if (floatingBar) floatingBar.style.display = "flex";
      enableEditableElements(true);
    } else {
      btn.classList.remove("editing-active");
      btnText.textContent = "Edit Mode: OFF";
      if (floatingBar) floatingBar.style.display = "none";
      enableEditableElements(false);
      saveInPlaceEdits();
    }
  }
}

const EDITABLE_SELECTORS = ".spec-title, .spec-content, .card-title, .card-subtitle, td, th, .stat-chip-label, .stat-chip-value, .deck-title, .deck-meta";

function enableEditableElements(enable) {
  const elements = document.querySelectorAll(EDITABLE_SELECTORS);
  elements.forEach((el, index) => {
    if (!el.getAttribute("data-edit-key")) {
      el.setAttribute("data-edit-key", "edit_node_" + index);
    }
    el.contentEditable = enable ? "true" : "false";
  });
}

function saveInPlaceEdits() {
  const customTexts = {};
  const elements = document.querySelectorAll("[data-edit-key]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-edit-key");
    if (key) {
      customTexts[key] = el.innerHTML;
    }
  });
  localStorage.setItem("devins_custom_texts", JSON.stringify(customTexts));
  alert("All text, room dimension notes, and specifications have been saved successfully!");
}

function loadInPlaceEdits() {
  const saved = localStorage.getItem("devins_custom_texts");
  if (!saved) return;
  try {
    const customTexts = JSON.parse(saved);
    const elements = document.querySelectorAll(EDITABLE_SELECTORS);
    elements.forEach((el, index) => {
      const key = "edit_node_" + index;
      el.setAttribute("data-edit-key", key);
      if (customTexts[key]) {
        el.innerHTML = customTexts[key];
      }
    });
  } catch (err) {
    console.error("Error loading custom texts:", err);
  }
}

function resetInPlaceEdits() {
  if (confirm("Reset all text, titles, notes, and tables back to the original specifications?")) {
    localStorage.removeItem("devins_custom_texts");
    location.reload();
  }
}
