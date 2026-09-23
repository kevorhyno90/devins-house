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
      .then((reg) => {
        console.log("[Devin's House] Service Worker Registered:", reg.scope);
        // Force update check every time app opens
        reg.update();
      })
      .catch((err) => console.log("[Devin's House] Service Worker Error:", err));
  });

  // Automatically refresh the page once a new service worker version activates
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
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

  try {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, "#" + tabId);
    }
  } catch (e) {}

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
// 4. Live Editable Room Measurements Engine (Dimensions in Feet & Sq Ft)
// -------------------------------------------------------------------------
// Original 8.00m (26.25 ft) + 2.0 ft added length = 28.25 ft total length
// Width 5.00m = 16.40 ft total width
// Total Footprint = 28.25 ft × 16.40 ft = 463.3 sq ft
// Exactly 50% split (14.125 ft): Seating Room (14.125 ft × 16.40 ft = 231.65 sq ft)
// Other 50% split (14.125 ft): Kids Bed (14.125 × 8.00 ft) + Kitchen & Bar (14.125 × 8.40 ft)
// Upper Floor 50% split: Master Bedroom Suite (14.125 ft × 16.40 ft = 231.65 sq ft) on metal & timber slab
const DEFAULT_MEASUREMENTS = {
  plotWidth: 28.25, // feet (+2 ft added to original 26.25 ft length)
  plotDepth: 16.40, // feet (5.00m)
  seatingWidth: 14.125, // feet (exact 50% split of 28.25 ft)
  seatingDepth: 16.40, // feet (full depth)
  kidsWidth: 14.125, // feet (half length)
  kidsDepth: 8.00, // feet (half of depth)
  kitchenWidth: 14.125, // feet (half length)
  kitchenDepth: 8.40, // feet (half of depth: 8.00 + 8.40 = 16.40 ft)
  masterWidth: 14.125, // feet (exact 50% split over kitchen + kids room)
  masterDepth: 16.40, // feet (full depth on metal & timber slab)
  doorWidth: 3.50, // feet (standard 3.5ft security entrance door)
  cathedralHeight: 15.70, // feet (soaring cathedral ceiling)
  slabHeight: 8.50, // feet (metal beam + timber joist mezzanine height)
  opt6MasterWidth: 14.125, // feet
  opt6MasterDepth: 16.40, // feet
  opt6KidsWidth: 14.125, // feet
  opt6KidsDepth: 8.00, // feet
  opt6KitchenWidth: 14.125, // feet
  opt6KitchenDepth: 8.40 // feet
};

let measurements = JSON.parse(localStorage.getItem("devins_measurements")) || DEFAULT_MEASUREMENTS;

// Auto-upgrade stored measurements to exact 50/50 split (14.125 ft x 16.40 ft)
if (!measurements || measurements.plotWidth < 20 || measurements.seatingWidth !== 14.125) {
  measurements = { ...DEFAULT_MEASUREMENTS };
  localStorage.setItem("devins_measurements", JSON.stringify(measurements));
}

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
  const footprint = (measurements.plotWidth * measurements.plotDepth).toFixed(1);
  const seatingArea = (measurements.seatingWidth * measurements.seatingDepth).toFixed(1);
  const kidsArea = (measurements.kidsWidth * measurements.kidsDepth).toFixed(1);
  const kitchenArea = (measurements.kitchenWidth * measurements.kitchenDepth).toFixed(1);
  const masterArea = (measurements.masterWidth * measurements.masterDepth).toFixed(1);

  setText("calc_footprint", footprint + " sq ft");
  setText("calc_seatingArea", seatingArea + " sq ft");
  setText("calc_kidsArea", kidsArea + " sq ft");
  setText("calc_kitchenArea", kitchenArea + " sq ft");
  setText("calc_masterArea", masterArea + " sq ft");

  // Option 6 Live Recalculations
  const opt6Master = ((measurements.opt6MasterWidth || 14.125) * (measurements.opt6MasterDepth || 16.40)).toFixed(1);
  const opt6Kids = ((measurements.opt6KidsWidth || 14.125) * (measurements.opt6KidsDepth || 8.00)).toFixed(1);
  const opt6Kitchen = ((measurements.opt6KitchenWidth || 14.125) * (measurements.opt6KitchenDepth || 8.40)).toFixed(1);

  setText("calc_opt6MasterArea", opt6Master + " sq ft");
  setText("calc_opt6KidsArea", opt6Kids + " sq ft");
  setText("calc_opt6KitchenArea", opt6Kitchen + " sq ft");

  // Re-run paint and structural calculators based on updated measurements
  calculateFinishes();
  calculateStructuralCost();
}

function resetMeasurements() {
  if (confirm("Reset all dimensions to the updated 28.25 ft × 16.4 ft (+2 ft extended length) specifications?")) {
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
  { id: 1, name: "Site Clearance & Setting Out (28.25ft × 16.4ft)", cat: "Foundation", amount: 650, date: "2026-09-01", status: "Paid" },
  { id: 2, name: "Excavation & 6-Pillar Rebar Footing Concrete", cat: "Foundation", amount: 2800, date: "2026-09-05", status: "Paid" },
  { id: 3, name: "Ground Floor Concrete Slab (463 sq ft)", cat: "Foundation", amount: 3400, date: "2026-09-12", status: "Paid" },
  { id: 4, name: "Perimeter Blockwork Masonry (28.25ft × 16.4ft)", cat: "Masonry", amount: 4100, date: "2026-09-18", status: "Pending" },
  { id: 5, name: "Reinforced Intermediate Slab Over Kitchen", cat: "Masonry", amount: 2100, date: "2026-09-25", status: "Pending" },
  { id: 6, name: "Kangaroo Hidden Parapet Roof Framing", cat: "Roofing", amount: 3900, date: "2026-10-02", status: "Pending" },
  { id: 7, name: "3.5ft Solid Metal Security Entrance Door", cat: "Doors/Windows", amount: 850, date: "2026-10-08", status: "Pending" },
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
// 6. Finishing, Painting & Construction Cost Calculators (Feet & Sq Ft)
// -------------------------------------------------------------------------
function calculateFinishes() {
  const wallAreaGross = (2 * (measurements.plotWidth + measurements.plotDepth)) * measurements.cathedralHeight;
  const openingsArea = 180; // ~180 sq ft deducted for doors & windows
  const netWallArea = Math.max(100, wallAreaGross - openingsArea);

  // 1 Gallon of primer covers ~350 sq ft
  const primerGallons = Math.ceil(netWallArea / 350);
  // 1 Gallon of topcoat covers ~350 sq ft per coat (2 coats required)
  const paintGallons = Math.ceil((netWallArea * 2) / 350);
  const paintCost = (primerGallons * 35) + (paintGallons * 55); // $35/gal primer, $55/gal premium acrylic

  setText("calc_netWallArea", Math.round(netWallArea).toLocaleString() + " sq ft");
  setText("calc_primerLiters", primerGallons + " Gallons");
  setText("calc_paintLiters", paintGallons + " Gallons (2 coats)");
  setText("calc_paintCost", "$" + paintCost.toLocaleString());

  // Flooring Calculator
  const parquetArea = ((measurements.seatingWidth * measurements.seatingDepth) + (measurements.masterWidth * measurements.masterDepth)) * 1.10; // +10% wastage
  const floorCost = Math.round(parquetArea * 4.50); // $4.50/sq ft engineered oak
  setText("calc_parquetArea", Math.round(parquetArea).toLocaleString() + " sq ft (incl 10% wastage)");
  setText("calc_parquetCost", "$" + floorCost.toLocaleString());
}

function calculateElectrical() {
  const lightPoints = parseInt(document.getElementById("input_lightPoints")?.value || 14);
  const socketPoints = parseInt(document.getElementById("input_socketPoints")?.value || 12);
  const coveStrips = parseInt(document.getElementById("input_coveStrips")?.value || 80); // linear feet

  const cost = (lightPoints * 40) + (socketPoints * 55) + (coveStrips * 7) + 650; // $650 DB & breakers
  setText("calc_electricalCost", "$" + cost.toLocaleString());
}

function calculatePlumbing() {
  const gutterLength = parseFloat(document.getElementById("input_gutterLength")?.value || 55); // linear feet of box gutter
  const bathPoints = parseInt(document.getElementById("input_bathPoints")?.value || 4); // Shower, WC, Basin, External tap

  // Note: Kitchen is strictly DRY (saves $1,500 in plumbing costs)
  const cost = (gutterLength * 20) + (bathPoints * 180) + 450; // Drainage & inspection chambers
  setText("calc_plumbingCost", "$" + cost.toLocaleString());
}

function calculateStructuralCost() {
  // Concrete Ground slab: 6-inch (0.5 ft) thick
  const concreteGroundCuFt = (measurements.plotWidth * measurements.plotDepth * 0.5);
  const concreteKitchenCuFt = (measurements.kitchenWidth * measurements.kitchenDepth * 0.5);
  const totalCuFt = concreteGroundCuFt + concreteKitchenCuFt;
  const totalCuYd = (totalCuFt / 27).toFixed(1);

  const perimeter = 2 * (measurements.plotWidth + measurements.plotDepth);
  const masonryBlocks = Math.round(perimeter * measurements.cathedralHeight * 1.15); // standard block estimate
  const structuralCost = Math.round((totalCuYd * 140) + (masonryBlocks * 3.5) + 3800); // 3800 kangaroo roof structure

  setText("calc_totalConcrete", totalCuYd + " cu yd (" + Math.round(totalCuFt) + " cu ft)");
  setText("calc_masonryBlocks", masonryBlocks.toLocaleString() + " blocks");
  setText("calc_structuralEstimate", "$" + structuralCost.toLocaleString());
}

// -------------------------------------------------------------------------
// 7. Construction Milestone Progress Tracker & Daily Site Diary (Feet Specs)
// -------------------------------------------------------------------------
const DEFAULT_MILESTONES = [
  { id: 1, title: "1. Landscaping, Site Clearance & Setting Out (28.25 ft × 16.4 ft)", status: "Done" },
  { id: 2, title: "2. Foundation Trenches & 6 Pillar Rebar Cages Tying (28.25 ft Span)", status: "Done" },
  { id: 3, title: "3. Diagonal Squareness Verification (32.67 ft / 32' 8\") & 2-inch Blinding Concrete", status: "In Progress" },
  { id: 4, title: "4. Reinforced Footing Pads & 6 Column Base Starters", status: "Pending" },
  { id: 5, title: "5. Foundation Plinth Wall & Hardcore Backfilling", status: "Pending" },
  { id: 6, title: "6. Ground Floor Concrete Slab (28.25 ft × 16.4 ft / 463 sq ft)", status: "Pending" },
  { id: 7, title: "7. 6 Reinforced Concrete Pillar Columns & Ring Beam", status: "Pending" },
  { id: 8, title: "8. Superstructure Perimeter Blockwork Walls (28.25 ft × 16.4 ft)", status: "Pending" },
  { id: 9, title: "9. Kitchen Mezzanine Intermediate Support Structure", status: "Pending" },
  { id: 10, title: "10. Kangaroo Hidden Parapet Roof Framing & Box Gutters", status: "Pending" },
  { id: 11, title: "11. Single 3.5ft Metal Security Door & Glazed Windows", status: "Pending" },
  { id: 12, title: "12. Electrical, Plumbing & Box Gutter Rough-In", status: "Pending" },
  { id: 13, title: "13. Wall Plastering, Ceiling & Untouched Timber Stairs", status: "Pending" },
  { id: 14, title: "14. Wardrobe Cabinetry, Painting & Final Handover", status: "Pending" }
];

let milestones = JSON.parse(localStorage.getItem("devins_milestones")) || DEFAULT_MILESTONES;

// Upgrade any stored milestones that still have old meter titles
if (Array.isArray(milestones) && (milestones.length === 10 || (milestones[0] && milestones[0].title.includes("8m")) || (milestones[0] && !milestones[0].title.includes("28.25")))) {
  milestones = DEFAULT_MILESTONES;
  localStorage.setItem("devins_milestones", JSON.stringify(milestones));
}

function syncRealSiteMilestones() {
  if (confirm("Sync milestones with current Day 1 progress in feet (28.25 ft × 16.4 ft footprint, trenches dug, 6 pillar rebar tied, 32.67 ft diagonal check & 2-inch blinding next)?")) {
    milestones = JSON.parse(JSON.stringify(DEFAULT_MILESTONES));
    localStorage.setItem("devins_milestones", JSON.stringify(milestones));
    renderMilestones();
    alert("Milestones synchronized with Day 1 real-world construction progress (in feet)!");
  }
}

function syncPillarsPouringMilestones() {
  if (confirm("Sync milestones to current stage: Superstructure brickwork completed all round & 6 pillars pouring in progress for tomorrow?")) {
    milestones = [
      { id: 1, title: "1. Landscaping, Site Clearance & Setting Out (28.25 ft × 16.4 ft)", status: "Done" },
      { id: 2, title: "2. Foundation Trenches & 6 Pillar Rebar Cages Tying (28.25 ft Span)", status: "Done" },
      { id: 3, title: "3. Diagonal Squareness Verification (32.67 ft / 32' 8\") & 2-inch Blinding Concrete", status: "Done" },
      { id: 4, title: "4. Reinforced Footing Pads & 6 Column Base Starters", status: "Done" },
      { id: 5, title: "5. Foundation Plinth Wall & Hardcore Backfilling", status: "Done" },
      { id: 6, title: "6. Ground Floor Concrete Slab (28.25 ft × 16.4 ft / 463 sq ft)", status: "Done" },
      { id: 7, title: "7. 6 Reinforced Concrete Pillar Columns & Ring Beam", status: "In Progress" },
      { id: 8, title: "8. Superstructure Perimeter Blockwork Walls (28.25 ft × 16.4 ft)", status: "Done" },
      { id: 9, title: "9. Kitchen Mezzanine Intermediate Support Structure", status: "Pending" },
      { id: 10, title: "10. Kangaroo Hidden Parapet Roof Framing & Box Gutters", status: "Pending" },
      { id: 11, title: "11. Single 3.5ft Metal Security Door & Glazed Windows", status: "Pending" },
      { id: 12, title: "12. Electrical, Plumbing & Box Gutter Rough-In", status: "Pending" },
      { id: 13, title: "13. Wall Plastering, Ceiling & Untouched Timber Stairs", status: "Pending" },
      { id: 14, title: "14. Wardrobe Cabinetry, Painting & Final Handover", status: "Pending" }
    ];
    localStorage.setItem("devins_milestones", JSON.stringify(milestones));
    renderMilestones();

    const hasLog2 = siteLogs && siteLogs.some(l => l.day && l.day.includes("Day 8"));
    if (!hasLog2 && Array.isArray(siteLogs)) {
      siteLogs.unshift(DEFAULT_SITE_LOGS[0]);
      localStorage.setItem("devins_site_logs", JSON.stringify(siteLogs));
      renderSiteLogs();
    }
    alert("Milestones synchronized: Brickwork walls marked Done, 6 Pillar Columns marked In Progress for tomorrow's pour!");
  }
}

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
// Daily Site Construction Diary & Inspection Engine
// -------------------------------------------------------------------------
const DEFAULT_SITE_LOGS = [
  {
    id: "log_2",
    day: "Day 8 (Superstructure Brickwork Done & 6 Pillars Pre-Pour)",
    date: new Date().toISOString().split("T")[0],
    summary: "Superstructure perimeter brick walls completed all round for Option 6 (28.25 ft × 16.4 ft). Formwork shutters erected, clamped, and mortar-sealed around the 6 vertical pillar locations (8\"×8\"). Pre-pour checklist completed: bottom cleanout pockets cleared of mortar crumbs, bricks soaked with water, 4 × #4 rebar cover verified, and top levels marked for Option 6 mezzanine steel I-beam bearing plates.",
    crew: "Lead mason, carpenters (shuttering) & concrete mixing crew",
    weather: "Dry, clear conditions",
    materials: "6 bags cement (50kg), 11 cu ft sharp sand (~0.5 ton), 22 cu ft crushed stone (3/4\" / ~1 ton), water, timber shuttering & clamps",
    notes: "Pouring scheduled for tomorrow: 1) Drench adjacent brickwork again 30 min before pouring. 2) C25 mix (1:1.5:3) poured in 3 lifts with poker vibrator/rodding. 3) Embed 5/8\" anchor bolts / steel baseplates coplanar at top level."
  },
  {
    id: "log_1",
    day: "Day 1 (Groundbreaking)",
    date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
    summary: "Construction officially kicked off today! Completed site landscaping and clearance. Excavated foundation trenches for the updated 28.25 ft × 16.4 ft (463 sq ft) footprint (+2 ft length extension) and column footings. Cut, bent, and tied 6 pillar support column metal rebar cages.",
    crew: "Site supervisor, masons & excavation crew",
    weather: "Dry / clear weather, firm ground",
    materials: "Steel rebar rods (main bars + stirrup rings), binding wire",
    notes: "Crucial next steps for tomorrow: 1) Verify opposite diagonals (32.67 ft / 32' 8\") to guarantee 90° right angles. 2) Place 2-inch concrete cover blocks so rebar never touches soil. 3) Pour 2-inch lean blinding concrete before placing column footings."
  }
];

let siteLogs = JSON.parse(localStorage.getItem("devins_site_logs")) || DEFAULT_SITE_LOGS;

// Auto-upgrade siteLogs if containing old 8m/5m/9.43m or missing log_2
if (siteLogs && (siteLogs.length <= 1 || (siteLogs[0] && siteLogs[0].summary && siteLogs[0].summary.includes("8.00m")))) {
  siteLogs = DEFAULT_SITE_LOGS;
  localStorage.setItem("devins_site_logs", JSON.stringify(siteLogs));
}

function initSiteDiary() {
  renderSiteLogs();
  initInspectionChecklist();

  const diaryForm = document.getElementById("siteDiaryForm");
  if (diaryForm) {
    diaryForm.addEventListener("submit", addSiteLog);
  }
}

function renderSiteLogs() {
  const container = document.getElementById("siteDiaryList");
  if (!container) return;

  if (!siteLogs || siteLogs.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--text-muted); font-size: 13px;">No site logs recorded yet. Click "Log Daily Work" to add an entry!</div>`;
    return;
  }

  container.innerHTML = "";
  siteLogs.forEach((log) => {
    const card = document.createElement("div");
    card.className = "site-diary-entry";
    card.innerHTML = `
      <div class="entry-top-row">
        <div class="entry-title">
          <span>🧱</span> ${escapeHTML(log.day || "Site Entry")}
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="entry-date-badge">📅 ${escapeHTML(log.date)}</span>
          <button class="delete-btn" onclick="deleteSiteLog('${log.id}')" title="Delete Log">✕</button>
        </div>
      </div>
      <div class="entry-summary">${escapeHTML(log.summary)}</div>
      <div class="entry-meta-grid">
        <div class="entry-meta-item"><strong>👷 Crew:</strong> ${escapeHTML(log.crew || "N/A")}</div>
        <div class="entry-meta-item"><strong>🌤️ Weather:</strong> ${escapeHTML(log.weather || "N/A")}</div>
        <div class="entry-meta-item"><strong>📦 Materials:</strong> ${escapeHTML(log.materials || "N/A")}</div>
      </div>
      ${log.notes ? `<div class="entry-notes"><strong>💡 Engineering &amp; Next Steps:</strong> ${escapeHTML(log.notes)}</div>` : ""}
    `;
    container.appendChild(card);
  });
}

function toggleDiaryForm() {
  const formEl = document.getElementById("siteDiaryFormContainer");
  if (formEl) {
    formEl.classList.toggle("hidden-element");
    if (!formEl.classList.contains("hidden-element")) {
      const dayInput = document.getElementById("diaryDay");
      if (dayInput && !dayInput.value) {
        dayInput.value = `Day ${siteLogs.length + 1}`;
      }
      const dateInput = document.getElementById("diaryDate");
      if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split("T")[0];
      }
    }
  }
}

function addSiteLog(e) {
  if (e) e.preventDefault();
  const day = (document.getElementById("diaryDay")?.value || `Day ${siteLogs.length + 1}`).trim();
  const date = document.getElementById("diaryDate")?.value || new Date().toISOString().split("T")[0];
  const summary = (document.getElementById("diarySummary")?.value || "").trim();
  const crew = (document.getElementById("diaryCrew")?.value || "").trim();
  const weather = (document.getElementById("diaryWeather")?.value || "").trim();
  const materials = (document.getElementById("diaryMaterials")?.value || "").trim();
  const notes = (document.getElementById("diaryNotes")?.value || "").trim();

  if (!summary) {
    alert("Please enter a brief summary of the work completed today.");
    return;
  }

  const newLog = {
    id: "log_" + Date.now(),
    day,
    date,
    summary,
    crew,
    weather,
    materials,
    notes
  };

  siteLogs.unshift(newLog);
  localStorage.setItem("devins_site_logs", JSON.stringify(siteLogs));
  renderSiteLogs();

  const form = document.getElementById("siteDiaryForm");
  if (form) form.reset();
  toggleDiaryForm();
}

function deleteSiteLog(id) {
  if (confirm("Delete this site log entry?")) {
    siteLogs = siteLogs.filter((l) => l.id !== id);
    localStorage.setItem("devins_site_logs", JSON.stringify(siteLogs));
    renderSiteLogs();
  }
}

// -------------------------------------------------------------------------
// Foundation & 6-Pillar Quality Inspection Checklist
// -------------------------------------------------------------------------
const DEFAULT_INSPECTION = {
  check_diagonals: true,
  check_trench_depth: true,
  check_pillar_rebar: true,
  check_cover_blocks: true,
  check_blinding: true,
  check_column_anchors: true,
  check_column_cleanout: false,
  check_brick_wetting: false,
  check_shutter_clamping: false,
  check_rebar_cover: false,
  check_top_datum_level: false,
  check_anchor_bolts_ready: false
};

let inspectionState = JSON.parse(localStorage.getItem("devins_inspection_checklist")) || DEFAULT_INSPECTION;

// Merge any missing keys from DEFAULT_INSPECTION into saved state
Object.keys(DEFAULT_INSPECTION).forEach((k) => {
  if (inspectionState[k] === undefined) {
    inspectionState[k] = DEFAULT_INSPECTION[k];
  }
});

function initInspectionChecklist() {
  Object.keys(inspectionState).forEach((key) => {
    const el = document.getElementById(key);
    if (el) {
      el.checked = !!inspectionState[key];
      const parent = el.closest(".checklist-item");
      if (parent) parent.classList.toggle("checked", el.checked);
    }
  });
}

function toggleInspectionCheck(key) {
  const el = document.getElementById(key);
  if (el) {
    inspectionState[key] = el.checked;
    localStorage.setItem("devins_inspection_checklist", JSON.stringify(inspectionState));
    const parent = el.closest(".checklist-item");
    if (parent) parent.classList.toggle("checked", el.checked);
  }
}

// -------------------------------------------------------------------------
// Option 6: 6-Pillar Concrete Takeoff Calculator Engine
// -------------------------------------------------------------------------
function calculatePillarConcrete() {
  const numPillars = parseFloat(document.getElementById("input_pillarCount")?.value) || 6;
  const colWidthIn = parseFloat(document.getElementById("input_pillarWidth")?.value) || 8;
  const colDepthIn = parseFloat(document.getElementById("input_pillarDepth")?.value) || 8;
  const colHeightFt = parseFloat(document.getElementById("input_pillarHeight")?.value) || 8.53;
  const wastePct = parseFloat(document.getElementById("input_pillarWaste")?.value) || 15;
  const mixGrade = document.getElementById("select_pillarMix")?.value || "c25";

  const volPerColCuFt = (colWidthIn / 12) * (colDepthIn / 12) * colHeightFt;
  const totalWetCuFt = volPerColCuFt * numPillars * (1 + wastePct / 100);
  const totalWetM3 = totalWetCuFt * 0.0283168;
  const totalDryM3 = totalWetM3 * 1.54;

  let cementParts = 1, sandParts = 1.5, stoneParts = 3;
  if (mixGrade === "c20") {
    sandParts = 2;
    stoneParts = 4;
  }
  const totalParts = cementParts + sandParts + stoneParts;

  // Cement (density 1440 kg/m3)
  const cementVolM3 = (cementParts / totalParts) * totalDryM3;
  const cementKg = cementVolM3 * 1440;
  const cementBags50kg = Math.ceil(cementKg / 50);
  const cementBags94lb = Math.ceil((cementKg * 2.20462) / 94);

  // Sand (density ~1600 kg/m3)
  const sandVolM3 = (sandParts / totalParts) * totalDryM3;
  const sandCuFt = sandVolM3 * 35.3147;
  const sandKg = sandVolM3 * 1600;
  const sandWheelbarrows = (sandCuFt / 1.8).toFixed(1);

  // Stone (density ~1600 kg/m3)
  const stoneVolM3 = (stoneParts / totalParts) * totalDryM3;
  const stoneCuFt = stoneVolM3 * 35.3147;
  const stoneKg = stoneVolM3 * 1600;
  const stoneWheelbarrows = (stoneCuFt / 1.8).toFixed(1);

  // Water (~22-25L per 50kg bag)
  const waterLiters = Math.round(cementKg * 0.48);
  const waterBuckets = Math.round(waterLiters / 20);

  setText("pillar_res_wetVol", totalWetCuFt.toFixed(1) + " cu ft (" + totalWetM3.toFixed(2) + " m³)");
  setText("pillar_res_cement50", cementBags50kg + " bags (50kg)");
  setText("pillar_res_cement94", cementBags94lb + " bags (94lb)");
  setText("pillar_res_sand", Math.round(sandCuFt) + " cu ft (~" + Math.round(sandKg) + " kg)");
  setText("pillar_res_stone", Math.round(stoneCuFt) + " cu ft (~" + (stoneKg / 1000).toFixed(2) + " tonnes)");
  setText("pillar_res_water", waterLiters + " Liters (~" + waterBuckets + " buckets)");
  setText("pillar_res_batches", cementBags50kg + " Single-Bag Batches");
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
    siteLogs,
    inspectionState,
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
  initSiteDiary();
  calculatePillarConcrete();

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

// -------------------------------------------------------------------------
// 12. Pinterest Business Kit & Social Share Engine
// -------------------------------------------------------------------------
function copyTextToClipboard(text, alertMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      alert(alertMsg || "Copied to clipboard!");
    }).catch(() => {
      fallbackCopy(text, alertMsg);
    });
  } else {
    fallbackCopy(text, alertMsg);
  }
}

function fallbackCopy(text, alertMsg) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-999999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    alert(alertMsg || "Copied to clipboard!");
  } catch (e) {
    prompt("Copy to clipboard:", text);
  }
  document.body.removeChild(ta);
}

function shareOnPinterest(url, mediaUrl, description) {
  const fullUrl = url.startsWith("http") ? url : window.location.origin + "/" + url.replace(/^\.\//, "");
  const fullMedia = mediaUrl.startsWith("http") ? mediaUrl : window.location.origin + "/" + mediaUrl.replace(/^\.\//, "");
  const pinterestUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(fullUrl)}&media=${encodeURIComponent(fullMedia)}&description=${encodeURIComponent(description)}`;
  window.open(pinterestUrl, "_blank", "width=750,height=620,scrollbars=yes,resizable=yes");
}

// -------------------------------------------------------------------------
// 13. Deep Linking & Cache Purge Engine
// -------------------------------------------------------------------------
async function forceAppUpdateAndRefresh() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    }
  } catch (err) {
    console.error("Cache purge failed:", err);
  }
  window.location.reload(true);
}

function handleDeepLinkTabRouting() {
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    if (hash === "site-engineering" || hash === "opt-site-engineering" || hash === "tab-opt-site-engineering") {
      switchToTab("opt-site-engineering");
    } else {
      switchToTab(hash);
    }
  }
}

window.addEventListener("DOMContentLoaded", handleDeepLinkTabRouting);
window.addEventListener("hashchange", handleDeepLinkTabRouting);


