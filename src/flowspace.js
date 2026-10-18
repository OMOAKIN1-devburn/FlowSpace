"use strict";
console.log("FlowSpace JS loaded");

const TASKS_KEY = "flowspace-tasks.v1";
const SETTINGS_KEY = "flowspace.settings.v1";
const ACTIVITY_KEY = "flowspace.activity.v1";
const themes = {
  electric: {
    navy: "#171525",
    violet: "#7655f6",
    coral: "#ff718b",
    orange: "#ffaa5b",
    mint: "#64ddb5",
    sky: "#70c8ff",
    lavender: "#f0edff",
    paper: "#fffcf8",
    ink: "#292640",
    muted: "#6b6880",
    line: "#eae7f0",
    surface: "#ffffff",
    canvas: "#f8f7fb",
  },
  ocean: {
    navy: "#123344",
    violet: "#188e9b",
    coral: "#ef877a",
    orange: "#f3b969",
    mint: "#5cc6b1",
    sky: "#6ebbdd",
    lavender: "#e5f4f3",
    paper: "#f8fcf9",
    ink: "#dceae7",
    muted: "#4f6a6e",
    line: "#dceae7",
    surface: "#ffffff",
    canvas: "#f2f8f6",
  },
  sunset: {
    navy: "#3a2442",
    violet: "#e87967",
    coral: "#d96170",
    orange: "#f3a34d",
    mint: "#a9c884",
    sky: "#87b9c3",
    lavender: "#f7ea37",
    paper: "#fffaf4",
    ink: "#45353f",
    muted: "#7a646c",
    line: "#eee2dd",
    surface: "#ffffff",
    canvas: "#fbf5f1",
  },
};
const categoryNames = ["Personal", "Work", "Wellbeing", "Learning"];
const todayKey = dateKey(new Date());
const seedTasks = [
  {
    id: "s1",
    title: "Sketch the outline for the spring launch",
    category: "Work",
    priority: "high",
    due: todayKey,
    status: "progress",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "s2",
    title: "Send the revised proposal to Maya",
    category: "Work",
    priority: "medium",
    due: todayKey,
    status: "todo",
    createdAt: Date.now() - 7200000,
  },
  {
    id: "s3",
    title: "Take a proper lunch break",
    category: "Wellbeing",
    priority: "low",
    due: todayKey,
    status: "todo",
    createdAt: Date.now() - 10800000,
  },
  {
    id: "s4",
    title: "Review notes from Monday's brainstorm",
    category: "Work",
    priority: "medium",
    due: futureKey(1),
    status: "todo",
    createdAt: Date.now() - 14000000,
  },
  {
    id: "s5",
    title: "Water the balcony plants",
    category: "Personal",
    priority: "low",
    due: todayKey,
    status: "completed",
    completedAt: todayKey,
    createdAt: Date.now() - 19000000,
  },
  {
    id: "s6",
    title: "Read a chapter before bed",
    category: "Learning",
    priority: "low",
    due: futureKey(2),
    status: "completed",
    completedAt: todayKey,
    createdAt: Date.now() - 25000000,
  },
];

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function futureKey(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dateKey(date);
}
function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

let tasks = loadJson(TASKS_KEY, null);
if (!Array.isArray(tasks)) {
  tasks = seedTasks;
  saveTasks();
}
let settings = loadJson(SETTINGS_KEY, {
  theme: "electric",
  goal: 5,
  focusMinutes: 25,
  breakMinutes: 5,
});
if (!settings || typeof settings !== "objects") settings = {};
settings = {
  theme: "electric",
  goal: 5,
  focusMinutes: 25,
  breakMinutes: 5,
  ...settings,
};
settings.theme = themes[settings.theme] ? settings.theme : "electric";
settings.goal = Math.max(1, Math.min(20, Number(settings.goal) || 5));
settings.focusMinutes = Math.max(
  1,
  Math.min(120, Number(settings.focusMinutes) || 25),
);
settings.breakMinutes = Math.max(
  1,
  Math.min(60, Number(settings.breakMinutes) || 5),
);
let activity = loadJson(ACTIVITY_KEY, {});
if (!activity || typeof activity !== "object") activity = {};

const todayDate = dateKey(new Date());
let timerMode = "focus";
let timerSeconds = settings.focusMinutes * 60;
let timerRunning = false;
let timerInterval = null;
let toastTimeout = null;
let currentSearch = "";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&alt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
function saveActivity() {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
}
function announce(message, ms = 2600) {
  const host = $("#toast-root");
  host.innerHTML = `<div class="toast" role="status">${esc(message)}</div>`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    host.innerHTML = "";
  }, ms);
}

function applyTheme(themeName) {
  const palette = themes[themeName] || themes.electric;
  const style = document.documentElement.style;

  Object.entries(palette).forEach(([key, value]) =>
    style.setProperty(`--${key}`, value),
  );
  settings.theme = themeName;
  saveSettings();
  $$(".theme-option").forEach((button) => {
    const selected = button.dataset.theme === themeName;
    button.setAttribute("aria-pressed", String(selected));
  });
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}
function formatDue(value) {
  if (!value) return "No due date";
  if (value === todayDate) return "Today";
  if (value === futureKey(1)) return "Tomorrow";
  const date = new Date(`${value}T12:OO:OO`);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}
function normalizeTime(value) {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(value || "");
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}:${match[3] || "00"}`;
}
function formatTime(value) {
  if (!value) return "";
  const [h, m, s] = normalizeTime(value).split(":").map(Number);
  if (![h, m, s].every(Number.isFinite)) return "";
  const date = new Date();
  date.setHours(h, m, s, 0);
  const options = {
    hour: "numeric",
    minute: "2-digit",
  };
  if (s) options.second = "2-digit";
  return new Intl.DateTimeFormat(undefined, options).format(date);
}
function dueTimestamp(task) {
  if (!task.due) return null;
  return new Date(
    `${task.due}T${normalizeTime(task.dueTime) || "23:59:59"}`,
  ).getTime();
}
function startOfDay(date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

function updateGreeting() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  $("#welcome-title").innerHTML =
    `${greeting}, Alex<span aria-hidden="true">.</span`;
  $("#current-date").textContent = formatDate(new Date()).toUpperCase();
}

function visibleTasks() {
  const category = $("#category-filter").value;
  const priority = $("#priority-filter").value;
  const query = currentSearch.trim().toLowerCase();
  let list = tasks.filter((task) => {
    const matchesCategory = category === "all" || task.category === category;
    const matchesPriority = priority === "all" || task.priority === priority;
    const matchesSearch =
      !query || `${task.title} ${task.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesPriority && matchesSearch;
  });
  const sort = $("#sort-filter").value;
  if (sort === "due")
    list = list
      .slice()
      .sort((a, b) =>
        `${a.due || "9999"} ${a.dueTime || "99:99"}`.localeCompare(
          `${b.due || "9999"} ${b.dueTime || "99:99"}`,
        ),
      );
  list = list
    .slice()
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
  if (sort === "priority") {
    const rank = {
      high: 0,
      medium: 1,
      low: 2,
    };
    list = list.slice().sort((a, b) => rank[a.priority] - rank[b.priority]);
  }
  if (sort === "created")
    list = list.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

function renderTasks() {
  const filtered = visibleTasks();
  const statuses = [
    ["todo", "To do", "fa-circle-plus"],
    ["progress", "In progress", "fa-arrow-right"],
    ["completed", "Completed", "fa-arrow-rotate-left"],
  ];
  statuses.forEach(([status, label, icon]) => {
    const list = filtered.filter((task) => task.status === status);
    $(`#count-${status}`).textContent = list.length;
    const host = $(`#list-${status}`);
    host.innerHTML = list.length
      ? list
          .map((task) => {
            const stamp = dueTimestamp(task);
            const overdue =
              stamp && stamp < Date.now() && task.status !== "completed";
            const nextStatus =
              status === "todo"
                ? "progress"
                : status === "progress"
                  ? "completed"
                  : "todo";
            const nextLabel =
              status === "todo"
                ? "Start task"
                : status === "progress"
                  ? "Complete task"
                  : "Move back to to do";
            return `<article class="task-card" data-status="${status}" data-task-id="${esc(task.id)}">
      <div class="task-card-top">
      <button class="check-task" data-action="complete" data-id="${esc(task.id)}" aria-label="${status === "completed" ? "Move task back to to do" : "Mark task complete"}">${status === "completed" ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : ""}</button>
      <strong class="task-title">${esc(task.title)}</strong>
      <button class="task-menu" data-action="edit" data-id="${esc(task.id)}" aria-label="Edit ${esc(task.title)}"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
      <button class="task-menu" data-action="delete" data-id="${esc(task.id)}" aria-label="Delete ${esc(task.title)}"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button>
      </div>
      <div class="task-meta">
      <span class="tag category">${esc(task.category || "Personal")}</span>
      <span class="tag priority-${esc(task.priority || "medium")}">${esc((task.priority || "medium").replace(/^./, (letter) => letter.toUpperCase()))}</span>
      </div>
      <div class="due-meta${overdue ? " overdue" : ""}"><i class="fa-regular fa-calendar" aria-hidden="true"></i>${esc(formatDue(task.due))}${task.dueTime ? " . " + esc(formatTime(task.dueTime)) : ""}</div>
      <button class="task-move" data-action="move" data-id="${esc(task.id)}" data-status="${nextStatus}" aria-label="${nextLabel}: ${esc(task.title)}"><i class="fa-solid ${icon}" aria-hidden="true"></i> ${nextLabel}</button>
      </article>`;
          })
          .join("")
      : `<p class="empty">No ${label.toLowerCase()} tasks</p>`;
  });
  $("#nav-task-count").textContent = tasks.filter(
    (task) => task.status !== "completed",
  ).length;
  updateStats();
  populateCategories();
}

function populateCategories() {
  const select = $("#category-filter");
  const current = select.view || "all";
  const categories = [
    ...new Set([
      ...categoryNames,
      ...tasks.map((task) => task.category).filter(Boolean),
    ]),
  ].sort();
  select.innerHTML -
    `<option value="all">All categories</option>${categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join("")}`;
  select.value = categories.includes(current) ? current : "all";
}

function updateStats() {
  const completed = tasks.filter(
    (task) => task.status === "completed" && task.completedAt === todayDate,
  ).length;
  const progress = tasks.filter((task) => task.status === "progress").length;
  const upcoming = tasks.filter((task) => task.status === "todo").length;
  const focusMinutes = Number(activity[todayDate]) || 0;
  $("#stat-completed").textContent = completed;
  $("#stat-progress").textContent = progress;
  $("#stat-upcoming").textContent = upcoming;
  $("#stat-focus").innerHTML =
    `${focusMinutes}<span style="font-size:13px; font-weight:700">m</span>`;
  const percent = Math.min(100, Math.round((completed / settings.goal) * 100));
  $("#goal-label").textContent = `${completed} of ${settings.goal} tasks`;
  $("#goal-percent").textContent = `${percent}%`;
  $("#goal-ring").style.setProperty("--goal-pct", `${percent}%`);
  $("#goal-ring").setAttribute("aria-label", `Daily goal ${percent}% complete`);
  $("#goal-support").textContent =
    percent >= 100
      ? "You showed up for yourself today."
      : completed === 0
        ? "You're just getting started."
        : `${settings.goal - completed} more to meet your goal.`;
  renderActivity();
}

function renderActivity() {
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = dateKey(date);
    days.push({
      key,
      label: new Intl.DateTimeFormat(undefined, {
        weekday: "short",
      }).format(date),
      value: Number(activity[key]) || 0,
      isToday: offset === 0,
    });
  }
  const max = Math.max(25, ...days.map((day) => day.value));
  $("#activity-bars").innerHTML = days
    .map((day) => {
      const height = Math.max(
        day.value ? 10 : 4,
        Math.round((day.value / max) * 100),
      );
      return `<div class="activity-day${day.isToday ? " today" : ""}" aria-label="${esc(day.label)}: ${day.value} focus minutes"><div class="bar-track"><div class="bar-fill"style="height:${height}%"></div></div><span>${esc(day.label)}</span></div>`;
    })
    .join("");
  const total = days.reduce((sum, day) => sum + day.value, 0);
  $("#week-total").textContent = `${total} min this week`;
}
const COMMON_WORDS =
  "clean room call email send write read buy pay book plan finish review prepare organize schedule meeting report proposal project launch outline sketch study learn practice exercise workout run cook lunch dinner breakfast grocery shopping laundry dishes water plants garden laptop phone invoice budget taxes appointment doctor dentist yoga meditate journal notes brainstorm design update fix test deploy research draft edit submit cancel renew order pick visit birthday gift tidy vacuum sweep wash repair family friend class homework assignment exam course chapter before after today tomorrow weekly monthly morning afternoon evening proper break revised spring from with your that this then have need want make take teeth tooth brush shower bath hair sleep dress shave".split(
    " ",
  );

function levenshtein(a, b) {
  const row = Array.from(
    {
      length: b.length + 1,
    },
    (_, i) => i,
  );
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = temp;
    }
  }
  return row[b.length];
}

function suggestTitle(text) {
  const words = new Set(COMMON_WORDS);
  tasks.forEach((t) =>
    (`${t.title} ${t.category}`.toLowerCase().match(/[a-z']+/g) || []).forEach(
      (w) => words.add(w),
    ),
  );
  const dictionary = [...words];
  let changed = false;
  const fixed = text.replace(/[A-Za-z']{4,}/g, (word) => {
    const lower = word.toLowerCase();
    if (words.has(lower)) return word;
    const limit = lower.length <= 5 ? 1 : 2;
    let best = null;
    let bestDistance = limit + 1;
    for (const candidate of dictionary) {
      if (Math.abs(candidate.length - lower.length) > limit) continue;
      const distance = levenshtein(lower, candidate);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
    if (!best) return word;
    changed = true;
    return word[0] === word[0].toUpperCase()
      ? best[0].toUpperCase() + best.slice(1)
      : best;
  });
  return changed ? fixed : null;
}

function openTaskModal(task = null) {
  const editing = Boolean(task);
  const host = $("#modal-root");
  host.innerHTML = `<div class="modal-backdrop" id="modal-backdrop">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
    <div class="modal-header"><div><h2 id="task-modal-title">${editing ? "Give it a quick edit" : "Make a little plan"}</h2><p>${editing ? "Change the details and keep moving." : "One clear next step is a good start."}</p></div>
    <button class="close-modal" type="button" aria-label="Close dialog"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>
    <form id="task-form" novalidate>
    <div class="form-grid">
    <div class="form-field full"><label for="task-title-input">Task name</label><input id="task-title-input" name="title" maxlength="90" autocomplete="off" required spellcheck="true" lang="en" autocapitalize="sentences" placeholder="What would you like to get done?" value="${editing ? esc(task.title) : ""}"><p class="spell-hint" id="spell-hint" hidden></p></div>
    <div class="form-field"><label for="task-category-input">Category</label><select id="task-category-input" name="category">${[...new Set([...categoryNames, ...tasks.map((item) => item.category).filter(Boolean)])].map((category) => `<option value="${esc(category)}"${editing && task.category === category ? " selected" : ""}>${esc(category)}</option>`).join("")}<option value="__custom">Create a category...</option></select></div>
    <div class="form-field"><label for="task-priority-input">Priority</label><select id="task-priority-input" name="priority"><option value="low"${editing && task.priority === "low" ? " selected" : ""}>Low</option><option value="medium"${!editing || task.priority === "medium" ? " selected" : ""}>Medium</option><option value="high"${editing && task.priority === "high" ? " selected" : ""}>High</option></select></div>
    <div class="form-field"><label for="task-due-input">Due date</label><input id="task-due-input" name="due" type="date" value="${editing ? esc(task.due || "") : todayDate}"></div>
    <div class="form-field"><label for="task-status-input">Board column</label><select id="task-status-input" name="status"><option value="todo"${!editing || task.status === "todo" ? " selected" : ""}>To do</option><option value="progress"${editing && task.status === "progress" ? " selected" : ""}>In progress</option><option value="completed"${editing && task.status === "completed" ? " selected" : ""}>Completed</option></select></div>
    <div class="form-field"><label for="task-time-input">Due time (optional)</label><input id="task-time-input" name="dueTime" type="time" step="1" value="${editing ? esc(task.dueTime || "") : ""}"></div>
    <div class="form-field"><label for="task-remind-input">Remind me</label><select id="task-remind-input" name="remind"><option value="none"${!editing || !task.remind || task.remind === "none" ? " selected" : ""}>No reminder</option><option value="0"${editing && task.remind === "0" ? " selected" : ""}>At the due time</option><option value="10"${editing && task.remind === "10" ? " selected" : ""}> 10 minutes before</option><option value="60"${editing && task.remind === "60" ? " selected" : ""}> 1 hour before</option></select></div>
    <div class="form-field full"><label for="task-in-hours">Or due in...(replaces the date and time above)</label><div class="duration-row"><div class="duration-box"><input id="task-in-hours" type="number" min="0" placeholder="0" aria-label="Hours"><span>hours</span></div><div class="duration-box"><input id="task-in-minutes" type="number" min="0" placeholder="0" aria-label="Minutes"><span>min</span></div><div class="duration-box"><input id="task-in-seconds" type="number" min="0" placeholder="0" aria-label="Seconds"><span>sec</span></div></div></div>
    <div class="form-field full" id="custom-category-wrap" hidden><label for="custom-category-input">New category name</label><input id="custom-category-input" maxlength="24" placeholder="For example, Home"></div>
    </div>
    <p class="form-error" id="task-form-error" role="alert"></p>
    <div class="modal-actions"><button class="button button-soft cancel-modal" type="button">Cancel</button>
    <button class="button button-primary"
    type="submit">${editing ? "Save changes" : "Add task"}</button></div>
    </form>
    </section>
    </div>`;
  const modal = $(".modal", host);
  const close = () => {
    host.innerHTML = "";
    document.removeEventListener("keydown", modalKeyHandler);
  };
  function modalKeyHandler(event) {
    if (event.key === "Escape") close();
    if (event.key === "Tab") {
      const focusable = $$("input,select,button", modal).filter(
        (element) => !element.disabled && element.offsetParent !== null,
      );
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable.at(-1).focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === focusable.at(-1)
      ) {
        event.preventDefault();
        focusable[0].focus();
      }
    }
  }
  document.addEventListener("keydown", modalKeyHandler);
  $(".close-modal", host).addEventListener("click", close);
  $(".cancel-modal", host).addEventListener("click", close);
  $("#modal-backdrop", host).addEventListener("click", (event) => {
    if (event.target.id === "modal-backdrop") close();
  });
  $("#task-category-input", host).addEventListener("change", (event) => {
    $("#custom-category-wrap", host).hidden = event.target.value !== "__custom";
    if (event.target.value === "__custom")
      $("#custom-category-input", host).focus();
  });
  $("#task-form", host).addEventListener("submit", (event) => {
    event.preventDefault();
    const title = $("#task-title-input", host).value.trim();
    const categorySelect = $("#task-category-input", host).value;
    const customCategory = $("#custom-category-input", host).value.trim();
    const category =
      categorySelect === "__custom" ? customCategory : categorySelect;
    let due = $("#task-due-input", host).value;
    const error = $("#task-form-error", host);
    if (title.length < 2) {
      error.textContent = "Add a task name with at least two characters.";
      $("#task-title-input", host).focus();
      return;
    }
    if (!category) {
      error.textContent = "Choose or name a category to continue.";
      $("#custom-category-input", host).focus();
      return;
    }
    let dueTime = $("#task-time-input", host).value;
    const remind = $("#task-remind-input", host).value;
    const inHours = Number($("#task-in-hours", host).value) || 0;
    const inMinutes = Number($("#task-in-minutes", host).value) || 0;
    const inSeconds = Number($("#task-in-seconds", host).value) || 0;
    const countdown = (inHours * 3600 + inMinutes * 60 + inSeconds) * 1000;
    if (countdown > 0) {
      const target = new Date(Date.now() + countdown);
      due = dateKey(target);
      dueTime = target.toTimeString().slice(0, 8);
    }
    dueTime = normalizeTime(dueTime);
    if (dueTime && !due) {
      error.textContent = "Pick a due date to go with that time.";
      $("#task-due-input", host).focus();
      return;
    }
    if (remind !== "none" && !dueTime) {
      error.textContent = "Add a due time to set a reminder.";
      $("#task-time-input", host).focus();
      return;
    }
    if (
      remind !== "none" &&
      "Notification" in window &&
      Notification.permission === "default"
    )
      Notification.requestPermission();
    const status = $("#task-status-input", host).value;
    const priority = $("#task-priority-input", host).value;
    if (editing) {
      Object.assign(task, {
        title,
        dueTime,
        remind,
        reminded: false,
        category,
        due,
        status,
        priority,
        completedAt:
          status === "completed" ? task.completedAt || todayDate : null,
      });
    } else {
      tasks.push({
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        category,
        due,
        dueTime,
        remind,
        reminded: false,
        status,
        priority,
        createdAt: Date.now(),
        completedAt: status === "completed" ? todayDate : null,
      });
    }
    saveTasks();
    close();
    renderTasks();
    announce(editing ? "Task updated." : "A new task is on your board.");
  });

  const titleInput = $("#task-title-input", host);
  const hint = $("#spell-hint", host);
  let spellTimer;
  titleInput.addEventListener("input", () => {
    clearTimeout(spellTimer);
    spellTimer = setTimeout(() => {
      const fixed = suggestTitle(titleInput.value);
      if (!fixed) {
        hint.hidden = true;
        return;
      }
      hint.hidden = false;
      hint.innerHTML = `Did you mean <button type="button" class="spell-apply">${esc(fixed)}</button>?`;
      $(".spell-apply", hint).addEventListener("click", () => {
        titleInput.value = fixed;
        hint.hidden = true;
        titleInput.focus();
      });
    }, 350);
  });
  $("#task-title-input", host).focus();
}

function deleteTask(task) {
  const confirmed = window.confirm(
    `Delete "${task.title}"? This cannot be undone.`,
  );
  if (!confirmed) return;
  tasks = tasks.filter((item) => item.id !== task.id);
  saveTasks();
  renderTasks();
  announce("Task removed.");
}

function setTaskStatus(task, status) {
  task.status = status;
  task.completedAt = status === "completed" ? todayDate : null;
  saveTasks();
  renderTasks();
  announce(
    status === "completed"
      ? "Nicely done. One more thing off your mind."
      : status === "progress"
        ? "Moving along."
        : "Back on your to-do list.",
  );
}

function paintTimer() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  $("#timer-display").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  $("#timer-toggle").innerHTML = timerRunning
    ? '<i class="fa-solid fa-pause" aria-hidden="true"></i> Pause'
    : `<i class="fa-solid fa-play" aria-hidden=:"true"></i> ${timerSeconds === (timerMode === "focus" ? settings.focusMinutes * 60 : settings.breakMinutes * 60) ? (timerMode === "focus" ? "Start focus" : "Start break") : "Resume"}`;
  $("#timer-caption").textContent =
    timerMode === "focus"
      ? timerRunning
        ? "Stay with this one thing."
        : "One thing at a time. You've got this."
      : "A few quiet minutes to reset.";
  $$(".mode-button").forEach((button) => {
    const selected = button.dataset.mode === timerMode;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function stopTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
}
function completeFocus() {
  stopTimer();
  activity[todayDate] =
    (Number(activity[todayDate]) || 0) + settings.focusMinutes;
  saveActivity();
  updateStats();
  timerSeconds = 0;
  paintTimer();
  announce("Focus session complete. Take a breath before the next thing.");
}
function beginTimer() {
  if (timerRunning) {
    stopTimer();
  } else {
    timerRunning = true;
    timerInterval = setInterval(() => {
      timerSeconds = Math.max(0, timerSeconds - 1);
      paintTimer();
      if (timerSeconds === 0) {
        if (timerMode === "focus") completeFocus();
        else {
          stopTimer();
          timerSeconds = 0;
          paintTimer();
          announce("Break is over. Ready when you are.");
        }
      }
    }, 1000);
  }
  paintTimer();
}
function changeMode(mode) {
  stopTimer();
  timerMode = mode;
  timerSeconds =
    (mode === "focus" ? settings.focusMinutes : settings.breakMinutes) * 60;
  paintTimer();
}

function openMobileNav() {
  const host = $("#modal-root");
  if ($(".mobile-nav-modal", host)) {
    host.innerHTML = "";
    return;
  }
  host.innerHTML = `<div class="modal-backdrop mobile-nav-backdrop"><section class="modal mobile-nav-modal" role="dialog" aria-modal=:true" aria-label="Navigation"><div class="modal-header"><div><h2>Go to</h2><p>Your day, at a glance.</p></div><button class="close-modal" aria-label="Close navigation'><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div><div class="nav-list">${$$(
    ".nav-link",
  )
    .map(
      (button) =>
        `<button class="nav-link" data-target="${button.dataset.target}"><i class="${$("i", button).className}" aria-hidden="true"></i><span>${$("span", button).textContent}</span></button`,
    )
    .join("")}</div></section></div>`;
  $(".close-modal", host).addEventListener("click", () => {
    host.innerHTML = "";
  });
  $$(".nav-link", host).forEach((button) =>
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.target);
      host.innerHTML = "";
      target?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }),
  );
  $(".mobile-nav-backdrop", host).addEventListener("click", (event) => {
    if (event.target.classList.contains("mobile-nav-backdrop"))
      host.innerHTML = "";
  });
}

$("#add-task").addEventListener("click", () => openTaskModal());
$("#board-add").addEventListener("click", () => openTaskModal());
$("#task-search").addEventListener("input", (event) => {
  currentSearch = event.target.value;
  renderTasks();
});
["category-filter", "priority-filter", "sort-filter"].forEach((id) =>
  $(`#${id}`).addEventListener("change", renderTasks),
);
$$(".board-columns").forEach((board) =>
  board.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const task = tasks.find((item) => item.id === button.dataset.id);
    if (!task) return;
    if (button.dataset.action === "edit") openTaskModal(task);
    if (button.dataset.action === "delete") deleteTask(task);
    if (button.dataset.action === "move")
      setTaskStatus(task, button.dataset.status);
    if (button.dataset.action === "complete")
      setTaskStatus(task, task.status === "completed" ? "todo" : "completed");
  }),
);
$("#timer-toggle").addEventListener("click", beginTimer);
$("#timer-reset").addEventListener("click", () => {
  stopTimer();
  timerSeconds =
    (timerMode === "focus" ? settings.focusMinutes : settings.breakMinutes) *
    60;
  paintTimer();
  announce("Timer reset.");
});
$$(".mode-button").forEach((button) =>
  button.addEventListener("click", () => changeMode(button.dataset.mode)),
);
$("#focus-shortcut").addEventListener("click", () => {
  $("#focus").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  if (timerMode !== "focus") changeMode("focus");
  if (!timerRunning) beginTimer();
});
$("#goal-plus").addEventListener("click", () => {
  settings.goal = Math.min(20, settings.goal + 1);
  saveSettings();
  updateStats();
  announce(`Daily goal set to ${settings.goal} tasks.`);
});
$("#goal-minus").addEventListener("click", () => {
  settings.goal = Math.max(1, settings.goal - 1);
  saveSettings();
  updateStats();
  announce(`Daily goal set to ${settings.goal} tasks.`);
});
$$(".theme-option").forEach((button) =>
  button.addEventListener("click", () => {
    applyTheme(button.dataset.theme);
    announce(`${button.textContent.trim()} is ready.`);
  }),
);
$$(".nav-link").forEach((button) =>
  button.addEventListener("click", () => {
    $$(".nav-link").forEach((item) => {
      item.classList.remove("active");
      item.removeAttribute("aria-current");
    });
    button.classList.add("active");
    button.setAttribute("aria-current", "page");

    document.getElementById(button.dataset.target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }),
);
$("#mobile-menu").addEventListener("click", openMobileNav);
$("#notifications-button").addEventListener("click", () =>
  announce("You're all caught up. Enjoy the quiet."),
);
$("#profile-button").addEventListener("click", () =>
  announce("You're in your personal workspace, Alex."),
);
function applyTextScale(value) {
  const scale = Math.max(0.7, Math.min(1.5, Math.round(value * 10) / 10));
  settings.textScale = scale;
  document.documentElement.style.setProperty("--text-scale", scale);
  const label = $("#text-size-label");
  if (label) label.textContent = `${Math.round(scale * 100)}%`;
  saveSettings();
}
$("#text-smaller").addEventListener("click", () =>
  applyTextScale((settings.textScale || 1) - 0.1),
);
$("#text-larger").addEventListener("click", () =>
  applyTextScale((settings.textScale || 1) + 0.1),
);
$("#text-reset").addEventListener("click", () => applyTextScale(1));
const COLUMN_LABELS = {
  todo: "To do",
  progress: "In progress",
  completed: "Completed",
};
const selectMode = {
  todo: false,
  progress: false,
  completed: false,
};
const selectedIds = {
  todo: new Set(),
  progress: new Set(),
  completed: new Set(),
};

function syncSelection(status) {
  const column = document.querySelector(`.task-column[data-column="${status}]`);
  const list = document.getElementById(`list-${status}`);
  const bar = document.getElementById(`select-bar-${status}`);
  if (!column || !list || !bar) return;
  const cards = [...list.querySelectorAll(".task-card")];
  const visible = new Set(cards.map((card) => card.dataset.taskId));
  [...selectedIds[status]].forEach((id) => {
    if (!visible.has(id)) selectedIds[status].delete(id);
  });
  list.classList.toggle("selecting", selectMode[status]);
  cards.forEach((card) => {
    let box = card.querySelector(".select-box");
    if (!selectMode[status]) {
      if (box) box.remove();
      card.classList.remove("is-selected");
      return;
    }
    if (!box) {
      card.insertAdjacentHTML(
        "afterbegin",
        `<input type="checkbox" class="select-box" aria-label="Select this task">`,
      );
      box = card.querySelector(".select-box");
    }
    const on = selectedIds[status].has(card.dataset.taskId);
    box.checked = on;
    card.classList.toggle("is-selected", on);
  });
  const count = selectedIds[status].size;
  bar.hidden = !selectMode[status];
  bar.querySelector(".select-count").textContent = `${count} selected`;
  const del = bar.querySelector(".select-delete");
  del.disabled = count === 0;
  del.textContent = count ? `Delete ${count}` : "Delete";
  bar.querySelector(".select-all-box").checked =
    cards.length > 0 && count === cards.length;
  const toggle = column.querySelector(".select-toggle");
  toggle.textContent = selectMode[status] ? "Done" : "Select";
  toggle.setAttribute("aria-pressed", String(selectMode[status]));
}

Object.keys(COLUMN_LABELS).forEach((status) => {
  const column = document.querySelector(
    `.task-column[data-column="${status}"]`,
  );
  const list = document.getElementById(`list-${status}`);
  if (!column || !list) return;
  const head = column.querySelector("column-head");

  head.insertAdjacentHTML(
    "beforeend",
    `<button type="button" class="select-toggle">Select</button>`,
  );
  const toggle = head.querySelector(".select-toggle");

  head.insertAdjacentHTML(
    "afterend",
    `<div class="select-bar" id="select-bar-${status}" hidden><label class="select-all"><input type="checkbox" class="select-all-box">All</label><span class="select-count">0 selected</span><button type="button" class="select-delete" disabled>Delete</button></div>`,
  );
  const bar = document.getElementById(`select-bar-${status}`);

  toggle.addEventListener("click", () => {
    selectMode[status] = !selectMode[status];
    selectedIds[status].clear();
    syncSelection(status);
  });
  bar.querySelector(".select-all-box").addEventListener("change", (event) => {
    selectedIds[status].clear();
    if (event.target.checked) {
      list
        .querySelectorAll(".task-card")
        .forEach((card) => selectedIds[status].add(card.dataset.taskId));
    }
    syncSelection(status);
  });
  list.addEventListener("click", (event) => {
    if (!selectMode[status]) return;
    const card = event.target.closest(".task-card");
    if (!card) return;
    const id = card.dataset.taskId;
    if (selectedIds[status].has(id)) selectedIds[status].delete(id);
    else selectedIds[status].add(id);
    syncSelection(status);
  });
  bar.querySelector(".select-delete").addEventListener("click", () => {
    const ids = selectedIds[status];
    const total = ids.size;
    if (!total) return;
    const ok = window.confirm(
      `Delete ${total} ${total === 1 ? "task" : "tasks"} from "${COLUMN_LABELS[status]}"?\n\nThis action can't be undone.`,
    );
    if (!ok) return;
    tasks = tasks.filter((task) => !ids.has(task.id));
    ids.clear();
    selectMode[status] = false;
    saveTasks();
    renderTasks();
    announce(`${total} ${total === 1 ? "task" : "tasks"} deleted.`);
  });
  new MutationObserver(() => syncSelection(status)).observe(list, {
    childList: true,
  });
});
updateGreeting();
applyTheme(settings.theme);
applyTextScale(Number(settings.textScale) || 1);
paintTimer();
renderTasks();

function checkReminders() {
  const now = Date.now();
  let changed = false;
  tasks.forEach((task) => {
    if (task.status === "completed" || task.reminded || !task.dueTime) return;
    if (!task.remind || task.remind === "none") return;
    const stamp = dueTimestamp(task);
    if (!stamp || now < stamp - Number(task.remind) * 60000) return;
    task.reminded = true;
    changed = true;
    if (now - stamp > 2 * 3600000) return;
    const when =
      Number(task.remind) === 0
        ? "is due now"
        : `is due at ${formatTime(task.dueTime)}`;
    announce(`Reminder: ${task.title} ${when}.`, 10000);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("FlowSpace reminder", {
        body: `${task.title} ${when}.`,
      });
    }
  });
  if (changed) {
    saveTasks();
    renderTasks();
  }
}
setInterval(checkReminders, 5000);
checkReminders();
