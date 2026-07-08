class Calculator {
  constructor(
    previousOperandTextElement,
    currentOperandTextElement,
    historyListElement,
    emptyMsgElement,
  ) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.historyListElement = historyListElement;
    this.emptyMsgElement = emptyMsgElement;
    this.clear();
  }

  clear() {
    this.currentOperand = "0";
    this.previousOperand = "";
    this.operation = undefined;
    this.shouldResetScreen = false;
  }

  delete() {
    if (this.currentOperand === "Error") {
      this.clear();
      return;
    }
    if (
      this.currentOperand.length === 1 ||
      (this.currentOperand.length === 2 && this.currentOperand.startsWith("-"))
    ) {
      this.currentOperand = "0";
    } else {
      this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }
  }

  appendNumber(number) {
    if (this.currentOperand === "Error" || this.shouldResetScreen) {
      this.currentOperand = "0";
      this.shouldResetScreen = false;
    }
    if (number === "." && this.currentOperand.includes(".")) return;

    if (this.currentOperand === "0" && number !== ".") {
      this.currentOperand = number.toString();
    } else {
      if (this.currentOperand.replace(".", "").length >= 12) return;
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
  }

  executeSingleOperandFunction(action) {
    if (this.currentOperand === "Error") return;
    let current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    let historyText = "";

    switch (action) {
      case "%":
        historyText = `${current}%`;
        current = current / 100;
        break;
      case "√":
        if (current < 0) {
          this.currentOperand = "Error";
          return;
        }
        historyText = `√(${current})`;
        current = Math.sqrt(current);
        break;
      case "x²":
        historyText = `(${current})²`;
        current = Math.pow(current, 2);
        break;
      case "+/-":
        current = current * -1;
        this.currentOperand = current.toString();
        this.updateDisplay();
        return;
    }

    current =
      Math.round((current + Number.EPSILON) * 10000000000) / 10000000000;
    this.addHistory(historyText, current);
    this.currentOperand = current.toString();
    this.shouldResetScreen = true;
  }

  chooseOperation(operation) {
    if (this.currentOperand === "Error") return;

    if (["%", "√", "x²", "+/-"].includes(operation)) {
      this.executeSingleOperandFunction(operation);
      return;
    }

    if (this.currentOperand === "") return;
    if (this.previousOperand !== "") {
      this.compute();
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current) || !this.operation) return;

    switch (this.operation) {
      case "+":
        computation = prev + current;
        break;
      case "-":
        computation = prev - current;
        break;
      case "×":
        computation = prev * current;
        break;
      case "÷":
        if (current === 0) {
          this.currentOperand = "Error";
          this.operation = undefined;
          this.previousOperand = "";
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    computation =
      Math.round((computation + Number.EPSILON) * 10000000000) / 10000000000;

    const historyExpression = `${this.getDisplayNumber(prev)} ${this.operation} ${this.getDisplayNumber(current)}`;
    this.addHistory(historyExpression, computation);

    this.currentOperand = computation.toString();
    this.operation = undefined;
    this.previousOperand = "";
    this.shouldResetScreen = true;
  }

  addHistory(expression, result) {
    if (this.emptyMsgElement) {
      this.emptyMsgElement.style.display = "none";
    }

    const item = document.createElement("div");
    item.classList.add("history-item");
    item.title = "Click to load this result";
    item.innerHTML = `
          <span class="history-expression">${expression} =</span>
          <span class="history-result">${this.getDisplayNumber(result)}</span>
        `;

    item.addEventListener("click", () => {
      this.currentOperand = result.toString();
      this.updateDisplay();
    });

    this.historyListElement.prepend(item);
  }

  clearHistory() {
    this.historyListElement.innerHTML =
      '<div class="empty-history" id="empty-msg">No calculations yet</div>';
    this.emptyMsgElement = document.getElementById("empty-msg");
  }

  getDisplayNumber(number) {
    if (number === "Error") return number;
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];
    let integerDisplay;

    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      integerDisplay = integerDigits.toLocaleString("en", {
        maximumFractionDigits: 0,
      });
    }

    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    this.currentOperandTextElement.innerText = this.getDisplayNumber(
      this.currentOperand,
    );
    if (this.operation != null) {
      this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = "";
    }
  }
}

// --- DOM Initialization ---
const previousOperandTextElement = document.getElementById("previous-operand");
const currentOperandTextElement = document.getElementById("current-operand");
const historyListElement = document.getElementById("history-list");
const emptyMsgElement = document.getElementById("empty-msg");
const themeBtn = document.getElementById("theme-btn");
const clearHistoryBtn = document.getElementById("clear-history-btn");

const calculator = new Calculator(
  previousOperandTextElement,
  currentOperandTextElement,
  historyListElement,
  emptyMsgElement,
);

// Theme Switcher
themeBtn.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "light");
    themeBtn.innerText = "🌙 Dark";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    themeBtn.innerText = "☀️ Light";
  }
});

// Clear History Log
clearHistoryBtn.addEventListener("click", () => {
  calculator.clearHistory();
});

// Event Listeners for Keypad Buttons
document.querySelectorAll("[data-num]").forEach((button) => {
  button.addEventListener("click", () => {
    calculator.appendNumber(button.getAttribute("data-num"));
    calculator.updateDisplay();
  });
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    calculator.chooseOperation(button.getAttribute("data-action"));
    calculator.updateDisplay();
  });
});

document.getElementById("equals-btn").addEventListener("click", () => {
  calculator.compute();
  calculator.updateDisplay();
});

document.getElementById("ac-btn").addEventListener("click", () => {
  calculator.clear();
  calculator.updateDisplay();
});

document.getElementById("del-btn").addEventListener("click", () => {
  calculator.delete();
  calculator.updateDisplay();
});

// --- Keyboard Navigation ---
window.addEventListener("keydown", (e) => {
  if ((e.key >= "0" && e.key <= "9") || e.key === ".") {
    calculator.appendNumber(e.key);
    calculator.updateDisplay();
  }
  if (e.key === "+" || e.key === "-") {
    calculator.chooseOperation(e.key);
    calculator.updateDisplay();
  }
  if (e.key === "*") {
    calculator.chooseOperation("×");
    calculator.updateDisplay();
  }
  if (e.key === "/") {
    e.preventDefault();
    calculator.chooseOperation("÷");
    calculator.updateDisplay();
  }
  if (e.key === "%" || e.key === "p" || e.key === "P") {
    calculator.chooseOperation("%");
    calculator.updateDisplay();
  }
  if (e.key === "r" || e.key === "R") {
    calculator.chooseOperation("√");
    calculator.updateDisplay();
  }
  if (e.key === "s" || e.key === "S") {
    calculator.chooseOperation("x²");
    calculator.updateDisplay();
  }
  if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    calculator.compute();
    calculator.updateDisplay();
  }
  if (e.key === "Backspace") {
    calculator.delete();
    calculator.updateDisplay();
  }
  if (e.key === "Escape" || e.key === "Delete") {
    calculator.clear();
    calculator.updateDisplay();
  }
});
