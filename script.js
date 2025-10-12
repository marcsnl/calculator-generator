//--------------- Dark Mode toggle logic ---------------

const darkToggle = document.querySelector(".dark-mode-btn i");
const colorText = document.querySelectorAll(".color-text");
const boxElements = document.querySelectorAll(".box");
const root = document.querySelector(":root");

// Default colors for light mode (CSS variables)
const defaultLightModeColors = [
  "#fff",       // --white
  "#000000",    // --text-color
  "#000",       // --primary-color
  "#272B2F",    // --secondary-color
  "#fff"        // --ui-bg
];

// Function to apply theme colors
function applyThemeColors(colors) {
  root.style.setProperty("--white", colors[0]);
  root.style.setProperty("--text-color", colors[1]);
  root.style.setProperty("--primary-color", colors[2]);
  root.style.setProperty("--secondary-color", colors[3]);
  root.style.setProperty("--ui-bg", colors[4]);
}

// Function to toggle dark mode classes
function toggleDarkMode(darkModeStyle) {
  const method = darkModeStyle ? "add" : "remove";
  colorText.forEach(el => el.classList[method]("darkMode"));
  boxElements.forEach(el => el.classList[method]("darkMode"));
}

// Save theme preference
function saveTheme(isDarkMode, colorData) {
  localStorage.setItem("themeMode", isDarkMode ? "dark" : "light");
  localStorage.setItem("themeColors", JSON.stringify(colorData));
}

// Load and apply saved theme
function loadSavedTheme() {
  const savedMode = localStorage.getItem("themeMode");
  const savedColors = JSON.parse(localStorage.getItem("themeColors") || "null");

  if (savedMode === "dark" && savedColors) {
    darkToggle.classList.replace("fa-moon", "fa-sun");
    toggleDarkMode(true);
    applyThemeColors(savedColors);
    darkToggle.parentElement.title = "Light Mode";
  } else {
    // fallback to light
    darkToggle.classList.replace("fa-sun", "fa-moon");
    toggleDarkMode(false);
    applyThemeColors(defaultLightModeColors);
    darkToggle.parentElement.title = "Dark Mode";
  }
}

// Handle dark mode toggle
darkToggle.addEventListener("click", () => {
  const isDarkMode = darkToggle.classList.contains("fa-moon");
  const colorData = darkToggle.getAttribute("data-color").split(" ");

  if (isDarkMode) {
    darkToggle.classList.replace("fa-moon", "fa-sun");
    toggleDarkMode(true);
    applyThemeColors(colorData);
    saveTheme(true, colorData);
    darkToggle.parentElement.title = "Light Mode";
  } else {
    darkToggle.classList.replace("fa-sun", "fa-moon");
    toggleDarkMode(false);
    applyThemeColors(defaultLightModeColors);
    saveTheme(false, defaultLightModeColors);
    darkToggle.parentElement.title = "Dark Mode";
  }
});

// Apply saved theme on load
window.addEventListener("DOMContentLoaded", loadSavedTheme);

// ---------------- Menu Toggle logic ----------------

const mainMenu   = document.getElementById("mainMenu");
const guideMenu  = document.getElementById("guideMenu");
const calcMenu   = document.getElementById("calcMenu");

const guideBtn   = document.getElementById("guideBtn");
const guideBackBtn = document.getElementById("guideBackBtn");
const calculatorBackBtn = document.getElementById("calculatorBackBtn");

// Helper function to show one menu at a time
function showMenu(menu) {
  [mainMenu, guideMenu, calcMenu].forEach(m => m.classList.add("hidden"));
  menu.classList.remove("hidden");
}

// Open Guide Menu
guideBtn.addEventListener("click", () => {
  showMenu(guideMenu);
});

// Back from Guide to Main Menu
guideBackBtn.addEventListener("click", () => {
  showMenu(mainMenu);
});

// Back from Calculator to Main Menu (top-level back button)
calculatorBackBtn.addEventListener("click", () => {
  showMenu(mainMenu);
});


// ---------------- Modal UI logic ----------------
function setupModal({ modalId, openBtnId, confirmBtnId, cancelBtnId, onConfirm }) {
  const modal = document.getElementById(modalId);
  const openBtn = document.getElementById(openBtnId);
  const confirmBtn = document.getElementById(confirmBtnId);
  const cancelBtn = document.getElementById(cancelBtnId);

  const openModal = () => (modal.style.display = 'block');
  const closeModal = () => (modal.style.display = 'none');

  if (openBtn) openBtn.addEventListener('click', openModal);

  confirmBtn.addEventListener('click', () => {
    let shouldClose = true;
    if (onConfirm) {
      const result = onConfirm();
      if (result === false) shouldClose = false;
    }
    if (shouldClose) closeModal();
  });

  cancelBtn.addEventListener('click', closeModal);

  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });
}


// ---------------- Reset Modal Setup ----------------
setupModal({
  modalId: 'modalA',
  openBtnId: 'resetBtn',
  confirmBtnId: 'resetConfirmBtn',
  cancelBtnId: 'resetCancelBtn',
  onConfirm: () => {
    localStorage.clear();
    showEmptyRow();
    alert('All saved data has been reset.');
  },
});


// ---------------- Add Variable & Equation to Table ----------------

const variableInput = document.getElementById("variableInput");
const equationInput = document.getElementById("equationInput");
const itemTable = document.getElementById("itemTable").querySelector("tbody");

// Helper: count actual data rows (rows with 3 tds)
function getDataRowCount() {
  return Array.from(itemTable.querySelectorAll("tr"))
    .filter(r => r.querySelectorAll("td").length === 3)
    .length;
}

// Helper: remove placeholder rows (any row that isn't a data row)
function removePlaceholderRows() {
  const rows = Array.from(itemTable.querySelectorAll("tr"));
  rows.forEach(row => {
    const tds = row.querySelectorAll("td");
    if (tds.length !== 3 || row.textContent.trim().toLowerCase().includes("empty")) {
      row.remove();
    }
  });
}

// Show Empty placeholder row
function showEmptyRow() {
  const table = document.getElementById("itemTable");
  const headerCols = table.querySelectorAll("thead th").length || 3;
  itemTable.innerHTML = `<tr class="empty-row"><td colspan="${headerCols}">Empty</td></tr>`;
}

// Add Modal setup
setupModal({
  modalId: 'modalB',
  openBtnId: 'addBtn',
  confirmBtnId: 'addConfirmBtn',
  cancelBtnId: 'addCancelBtn',
  onConfirm: () => {
    const variable = variableInput.value.trim();
    const equation = equationInput.value.trim();

    if (variable === "") {
      alert("Please enter a variable name.");
      return false;
    }

    if (!equation) {
      alert("Please enter an equation.");
      return false;
    }

    const allowedPattern = /^[a-zA-Z0-9+\-*/^().\s]+$/;
    if (!allowedPattern.test(equation)) {
      alert("Invalid characters detected. Use only letters, numbers, + - * / ^ ( ) . and spaces.");
      return false;
    }

    if (/\.\./.test(equation) || /[0-9]+\.[a-zA-Z]/.test(equation)) {
      alert("Invalid number format detected. Check your decimal points.");
      return false;
    }

    const openParens = (equation.match(/\(/g) || []).length;
    const closeParens = (equation.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      alert("Parentheses are unbalanced.");
      return false;
    }

    if (/[0-9][a-zA-Z(]/.test(equation) || /[a-zA-Z)][0-9]/.test(equation)) {
      alert("Missing operator detected. Use * between numbers and variables.");
      return false;
    }

    if (/[+\-*/^.]$/.test(equation)) {
      alert("Equation cannot end with an operator.");
      return false;
    }

    // Prevent self-referencing variable in equation
    const varPattern = new RegExp(`\\b${variable}\\b`, "gi");
    if (varPattern.test(equation)) {
      alert(`Invalid variable: "${variable}" is already in the equation.`);
      return false;
    }

    // Duplicate variable check
    let duplicateFound = false;
    itemTable.querySelectorAll("tr").forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length === 3) {
        const existingVar = cells[0].textContent.trim();
        if (existingVar.toLowerCase() === variable.toLowerCase()) {
          alert(`Duplicate variable "${variable}" found.`);
          duplicateFound = true;
        }
      }
    });

    if (duplicateFound) return false;

    addRowToTable(variable, equation);
    saveTableData();

    variableInput.value = "";
    equationInput.value = "";

    return true;
  },
});


// ---------------- Calculator Menu Logic ----------------

const calcMenuContainer = document.querySelector(".loaded-calculator-program");
let currentEquation = "";
let currentVariable = "";

// Build calculator UI dynamically logic
function buildCalculator(variable, equation) {
  calcMenuContainer.innerHTML = `
    <h3 id="calcHeader" class="mb-3">Formula :</h3>
    <div id="calcFormula" class="mb-2">${variable} = ${equation}</div>
    <div id="calcInputs" class="mb-3"></div>
    
    <div class="result-section mb-3">
      <label>Result:</label>
      <p id="calcResult">Result will display here</p>
    </div>
    
    <button id="calcComputeBtn">Compute</button>
    <button id="calcResetBtn">Reset</button>
    <br><br>
    <button id="calculatorBackBtn">Back</button>
  `;

  const calcInputsContainer = document.getElementById("calcInputs");

  const variableMatches = equation.match(/[a-zA-Z]+/g) || [];
  const uniqueVars = [...new Set(variableMatches.filter(v => v.toLowerCase() !== variable.toLowerCase()))];

  if (uniqueVars.length === 0) {
    calcInputsContainer.innerHTML = "<p>No variables found in this equation.</p>";
  } else {
    uniqueVars.forEach(v => {
      const div = document.createElement("div");
      div.classList.add("input-group");
      div.innerHTML = `
        <label for="input_${v}">${v} :</label>
        <input type="number" id="input_${v}">
      `;
      calcInputsContainer.appendChild(div);
    });
  }

  const computeBtn = document.getElementById("calcComputeBtn");
  const resetBtn = document.getElementById("calcResetBtn");
  const resultDisplay = document.getElementById("calcResult");
  const backBtn = document.getElementById("calculatorBackBtn");

  //  PEMDAS fix (convert ^ to **)
  computeBtn.addEventListener("click", () => {
    let eqToEval = equation;
    const inputs = calcInputsContainer.querySelectorAll("input");

    for (let input of inputs) {
      const name = input.id.replace("input_", "");
      const val = parseFloat(input.value);
      if (isNaN(val)) {
        alert(`Please enter a value for "${name}".`);
        return;
      }
      const regex = new RegExp(`\\b${name}\\b`, "g");
      eqToEval = eqToEval.replace(regex, val);
    }

    // Convert ^ to ** for true exponentiation
    eqToEval = eqToEval.replace(/\^/g, "**");

    try {
      const result = eval(eqToEval);
      resultDisplay.textContent = result;
    } catch {
      alert("Invalid equation or missing inputs.");
    }
  });

  resetBtn.addEventListener("click", () => {
    calcInputsContainer.querySelectorAll("input").forEach(i => (i.value = ""));
    resultDisplay.textContent = "Result will display here";
  });

  backBtn.addEventListener("click", () => {
    showMenu(mainMenu);
    calcMenuContainer.innerHTML = "";
  });
}

// Function to open calculator
function openCalculator(variable, equation) {
  currentVariable = variable;
  currentEquation = equation;
  buildCalculator(variable, equation);
  showMenu(calcMenu);
}


// ---------------- DELETE MODAL LOGIC ----------------

const deleteModal = document.getElementById("modalC");
const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
const deleteCancelBtn = document.getElementById("deleteCancelBtn");
let currentDeleteRow = null;

function openDeleteModal(row) {
  currentDeleteRow = row;
  deleteModal.style.display = "block";
}

function closeDeleteModal() {
  deleteModal.style.display = "none";
  currentDeleteRow = null;
}

deleteConfirmBtn.addEventListener("click", () => {
  if (currentDeleteRow) {
    currentDeleteRow.remove();
    saveTableData();
    if (getDataRowCount() === 0) showEmptyRow();
    closeDeleteModal();
  }
});

deleteCancelBtn.addEventListener("click", closeDeleteModal);

window.addEventListener("click", e => {
  if (e.target === deleteModal) closeDeleteModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && deleteModal.style.display === "block") closeDeleteModal();
});


// ---------------- TABLE LOGIC ----------------

function addRowToTable(variable, equation) {
  removePlaceholderRows();

  const row = itemTable.insertRow();
  const varCell = row.insertCell(0);
  const eqCell = row.insertCell(1);
  const actionCell = row.insertCell(2);

  varCell.textContent = variable;
  eqCell.textContent = equation;
  actionCell.innerHTML = `
    <button class="load-btn" title="Load this equation">Load</button>
    <button class="delete-btn" title="Delete this equation">Delete</button>
  `;

  const loadBtn = actionCell.querySelector(".load-btn");
  loadBtn.addEventListener("click", () => {
    openCalculator(variable, equation);
  });

  const deleteBtn = actionCell.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => openDeleteModal(row));
}


// ---------------- LOCAL STORAGE ----------------

function saveTableData() {
  const data = [];
  itemTable.querySelectorAll("tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length === 3) {
      data.push({
        variable: cells[0].textContent,
        equation: cells[1].textContent
      });
    }
  });
  localStorage.setItem("calculatorData", JSON.stringify(data));
}

function loadTableData() {
  itemTable.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem("calculatorData") || "[]");
  if (saved.length > 0) {
    saved.forEach(item => addRowToTable(item.variable, item.equation));
  } else {
    showEmptyRow();
  }
}

window.addEventListener("DOMContentLoaded", loadTableData);
