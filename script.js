
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
menuToggle.onclick = () => navMenu.classList.toggle("show");

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterBtns = document.querySelectorAll(".filters button");
const searchInput = document.getElementById("searchInput");

const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

 
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* UPDATE COUNTS */
function updateCounts() {
  totalCount.textContent = "Total: " + tasks.length;
  completedCount.textContent =
    "Completed: " + tasks.filter(t => t.completed).length;
  pendingCount.textContent =
    "Pending: " + tasks.filter(t => !t.completed).length;

  completedCount.classList.add("highlight");
  setTimeout(() => completedCount.classList.remove("highlight"), 300);
}
function updateDashboard() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("pendingCount").textContent = pending;

  const percent = total === 0 ? 0 : (completed / total) * 100;
  document.getElementById("progressFill").style.width = percent + "%";
}


/* RENDER TASKS */
function renderTasks() {
  taskList.innerHTML = "";
  const searchValue = searchInput.value.toLowerCase();

  tasks
    .slice()
    .sort((a, b) => b.completed - a.completed) // completed on top
    .filter(task => {
      if (currentFilter === "completed") return task.completed;
      if (currentFilter === "pending") return !task.completed;
      return true;
    })
    .filter(task => task.text.toLowerCase().includes(searchValue))
    .forEach((task, index) => {
      const li = document.createElement("li");

      /* EDIT MODE */
      if (task.isEditing) {
        li.classList.add("editing");

        const input = document.createElement("input");
        input.value = task.text;

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.style.background = "#22c55e";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.style.background = "#6b7280";

        saveBtn.onclick = () => {
          if (input.value.trim()) {
            task.text = input.value;
            task.isEditing = false;
            saveTasks();
            renderTasks();
          }
        };

        cancelBtn.onclick = () => {
          task.isEditing = false;
          renderTasks();
        };

        const actions = document.createElement("div");
        actions.className = "edit-actions";
        actions.append(saveBtn, cancelBtn);

        li.append(input, actions);
      }
      /* NORMAL MODE */
      else {
        const span = document.createElement("span");
        span.textContent = task.text;

        if (task.completed) {
          li.classList.add("completed");

          const badge = document.createElement("span");
          badge.textContent = "✔ Completed";
          badge.className = "completed-badge";
          span.appendChild(badge);
        }


        span.onclick = () => {
          task.completed = !task.completed;
          saveTasks();
          renderTasks();
        };

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.background = "#22c55e";
        editBtn.onclick = e => {
          e.stopPropagation();
          task.isEditing = true;
          renderTasks();
        };

        const delBtn = document.createElement("button");
        delBtn.textContent = "X";
        delBtn.style.background = "#ef4444";
        delBtn.onclick = e => {
          e.stopPropagation();
          tasks.splice(index, 1);
          saveTasks();
          renderTasks();
        };

        li.append(span, editBtn, delBtn);
      }

      taskList.appendChild(li);
    });

  updateCounts();
  updateDashboard();
}
/* FETCH QUOTE FROM API */
async function loadQuote() {
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");

  try {
    const res = await fetch("https://zenquotes.io/api/random");
    const data = await res.json();

    quoteText.textContent = `"${data[0].q}"`;
    quoteAuthor.textContent = `— ${data[0].a}`;
  } catch (error) {
    quoteText.textContent = "Could not load quote.";
    quoteAuthor.textContent = "";
    console.error("Quote API Error:", error);
  }
}



/* ADD TASK */
addBtn.onclick = () => {
  if (!taskInput.value.trim()) return alert("Enter a task");
  tasks.push({ text: taskInput.value, completed: false });
  taskInput.value = "";
  saveTasks();
  renderTasks();
};

/* FILTER BUTTONS */
filterBtns.forEach(btn => {
  btn.onclick = () => {
    currentFilter = btn.dataset.filter;
    renderTasks();
  };
});

/* SEARCH */
searchInput.addEventListener("input", renderTasks);

renderTasks();
