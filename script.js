
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const feedback = document.querySelector("#task-feedback");

const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const progressCount = document.querySelector("#progress-count");
const themeToggle = document.querySelector("#theme-toggle");
const filterButtons = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem("focusflow-tasks") || "[]");
    return Array.isArray(saved) ? saved.filter(
      task =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean"
    ) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem("focusflow-tasks", JSON.stringify(tasks));
    feedback.textContent = "";
  } catch {
    feedback.textContent = "Não foi possível salvar as tarefas neste navegador.";
  }
}

function updateDashboard() {
  const completed = tasks.filter(task => task.completed).length;
  const percentage = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  progressCount.textContent = `${percentage}%`;
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = `task-item${task.completed ? " done" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Concluir ${task.title}`);

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    saveTasks();
    renderTasks();
  });

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.textContent = "Excluir";
  deleteButton.setAttribute("aria-label", `Excluir ${task.title}`);

  deleteButton.addEventListener("click", () => {
    tasks = tasks.filter(item => item.id !== task.id);
    saveTasks();
    renderTasks();
  });

  li.append(checkbox, title, deleteButton);
  return li;
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    taskList.appendChild(createTaskElement(task));
  });

  emptyState.hidden = visibleTasks.length > 0;
  emptyState.textContent = tasks.length === 0
    ? "Você ainda não tem tarefas. Adicione sua primeira!"
    : "Nenhuma tarefa encontrada neste filtro.";

  updateDashboard();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    completed: false
  });

  saveTasks();
  input.value = "";
  currentFilter = "all";

  filterButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });

  renderTasks();
  input.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    renderTasks();
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  themeToggle.textContent = isLight ? "☀" : "☾";

  try {
    localStorage.setItem("focusflow-theme", isLight ? "light" : "dark");
  } catch {
    // O tema continua funcionando durante esta sessão.
  }
});

try {
  if (localStorage.getItem("focusflow-theme") === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀";
  }
} catch {
  // Mantém o tema escuro padrão.
}

renderTasks();
