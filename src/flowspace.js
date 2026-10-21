"use strict";

const TASKS_KEY = "flowspace-tasks.v1";
const THEME_KEY = "flowspace.theme.v1";
const USER_KEY = "flowspace.user.v1";
let userName = "";
try {
  userName = (localStorage.getItem(USER_KEY) || "").trim();
} catch {}

function firstName() {
  return userName.split(" ")[0] || "friend";
}
function initials() {
  const parts = userName.split(" ").filter(Boolean);
  if (!parts.length) return "G";
  return (
    parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}
function paintUser() {
  $("#profile-name").textContent = userName || "Guest";
  $("#profile-initials").textContent = initials();
  updateGreeting();
}
function showWelcome(changing = false) {
  document.documentElement.classList.remove("has-user");
  $(".app-shell").inert = true;
  $("#welcome-name").value = changing ? userName : "";
  $("#welcome-error").textContent = "";
  $("#welcome-cancel").hidden = !changing;
  setTimeout(() => $("#welcome-name").focus(), 50);
}
function closeWelcome() {
  document.documentElement.classList.add("has-user");
  $(".app-shell").inert = false;
}
const SETTINGS_KEY = "flowspace.settings.v1";
const ACTIVITY_KEY = "flowspace.activity.v1";
const themes = {
  electric: {
    navy: "#17152b",
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
    line: "#243b43",
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
    lavender: "#f7eae7",
    paper: "#fffaf4",
    ink: "#45353f",
    muted: "#7a646c",
    line: "#eee2dd",
    surface: "#ffffff",
    canvas: "#fbf5f1",
  },
  dark: {
    navy: "#0e0d1a",
    violet: "#8e73ff",
    coral: "#ff7f96",
    orange: "#ffb36b",
    mint: "#64ddb5",
    sky: "#70c8ff",
    lavender: "#262240",
    paper: "#1d1b2e",
    ink: "#edeafb",
    muted: "#a29fb8",
    line: "#2e2b44",
    surface: "#1a1829",
    canvas: "#121120",
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
  document.documentElement.dataset.theme = themeName;
  style.colorScheme = themeName === "dark" ? "dark" : "light";

  Object.entries(palette).forEach(([key, value]) =>
    style.setProperty(`--${key}`, value),
  );
  try {
    localStorage.setItem("flowspace.palette.v1", JSON.stringify(palette));
  } catch {}
  settings.theme = themeName;
  saveSettings();
  try {
    localStorage.setItem(THEME_KEY, themeName);
  } catch {}
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
    `${greeting}, ${esc(firstName())}<span aria-hidden="true">.</span>`;
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
  ensureUniqueIds();
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
            return `<article draggable="true" class="task-card" data-status="${status}" data-task-id="${esc(task.id)}">
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
      return `<div role="img" class="activity-day${day.isToday ? " today" : ""}" aria-label="${esc(day.label)}: ${day.value} focus minutes"><div class="bar-track"><div class="bar-fill"style="height:${height}%"></div></div><span>${esc(day.label)}</span></div>`;
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
  const ok = window.confirm(`Delete "${task.title}"? This cannot be undone.`);
  if (!ok) return;
  tasks = tasks.filter((item) => item !== task);
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
function setupDragAndDrop() {
  const board = $(".board-columns");
  let draggedId = null;
  const clear = () =>
    $$(".dragging, .drag-over", board).forEach((el) =>
      el.classList.remove("dragging", "drag-over"),
    );

  board.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".task-card");
    if (!card) return;
    draggedId = card.dataset.taskId;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", draggedId);
    requestAnimationFrame(() => card.classList.add("dragging"));
  });
  board.addEventListener("dragend", () => {
    draggedId = null;
    clear();
  });
  board.addEventListener("dragover", (e) => {
    const col = e.target.closest(".task-column");
    if (!col || !draggedId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    $$(".drag-over", board).forEach(
      (el) => el !== col && el.classList.remove("drag-over"),
    );
    col.classList.add("drag-over");
  });
  board.addEventListener("dragleave", (e) => {
    const col = e.target.closest(".task-column");
    if (col && !col.contains(e.relatedTarget))
      col.classList.remove("drag-over");
  });
  board.addEventListener("drop", (e) => {
    const col = e.target.closest(".task-column");
    if (!col || !draggedId) return;
    e.preventDefault();
    const task = tasks.find((t) => t.id === draggedId);
    const status = col.dataset.column;
    draggedId = null;
    clear();
    if (task && task.status !== status) setTaskStatus(task, status);
  });
}
setupDragAndDrop();
$("#mobile-menu").addEventListener("click", openMobileNav);
$("#notifications-button").addEventListener("click", () =>
  announce("You're all caught up. Enjoy the quiet."),
);
$("#profile-button").addEventListener("click", () => showWelcome(true));
$("#change-name").addEventListener("click", () => showWelcome(true));
$("#welcome-cancel").addEventListener("click", closeWelcome);

$("#welcome-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#welcome-name").value.replace(/\s+/g, " ").trim();
  const error = $("#welcome-error");
  if (name.length < 2) {
    error.textContent = "Please type your name to continue.";
    return;
  }
  if (!/^[\p{L}][\p{L}\p{M}''.\-]*$/u.test(name)) {
    error.textContent =
      "Letters only, please. Spaces, hyphens and apostrophes are fine.";
    return;
  }
  userName = name;
  try {
    localStorage.setItem(USER_KEY, name);
  } catch {}
  closeWelcome();
  paintUser();
  announce(`Welcome to FlowSpace, ${firstName()}.`);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("#welcome-cancel").hidden) closeWindow();
});
function applyTextScale(value) {
  const scale = Math.max(0.7, Math.min(2, Math.round(value * 10) / 10));
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
/* ===== Multi-select delete (per column) ===== */
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
  const list = document.getElementById(`list-${status}`);
  const bar = document.getElementById(`select-bar-${status}`);
  const toggle = document.getElementById(`select-toggle-${status}`);
  if (!list || !bar || !toggle) return;
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
  toggle.textContent = selectMode[status] ? "Done" : "Select";
  toggle.setAttribute("aria-pressed", String(selectMode[status]));
}

Object.keys(COLUMN_LABELS).forEach((status) => {
  const column = document.querySelector(
    `.task-column[data-column="${status}"]`,
  );
  const list = document.getElementById(`list-${status}`);
  const head = column ? column.querySelector(".column-head") : null;
  if (!column || !list || !head) return;
  column
    .querySelectorAll(".select-toggle, .select-bar")
    .forEach((el) => el.remove());
  head.insertAdjacentHTML(
    "beforeend",
    `<button type="button" class="select-toggle" id="select-toggle-${status}" data-status="${status}" aria-pressed="false">Select</button>`,
  );
  head.insertAdjacentHTML(
    "afterend",
    `<div class="select-bar" id="select-bar-${status}" hidden><label class="select-all"><input type="checkbox" class="select-all-box" data-status="${status}">All</label><span class="select-count">0 selected</span><button type="button" class="select-delete" data-status="${status}" disabled>Delete</button></div>`,
  );
  new MutationObserver(() => syncSelection(status)).observe(list, {
    childList: true,
  });
});

document.addEventListener("click", (event) => {
  const toggle = event.target.closest(".select-toggle");
  if (toggle) {
    const status = toggle.dataset.status;
    selectMode[status] = !selectMode[status];
    selectedIds[status].clear();
    syncSelection(status);
    return;
  }
  const del = event.target.closest(".select-delete");
  if (del) {
    const status = del.dataset.status;
    const ids = selectedIds[status];
    const total = ids.size;
    if (!total) return;
    const matching = tasks.filter((task) => ids.has(String(task.id))).length;
    if (matching !== total) {
      window.alert(
        "Some tasks share the same ID, so deleting now could remove extra tasks.They have been repaired. Please select again.",
      );
      ensureUniqueIds();
      selectedIds[status].clear();
      renderTasks();
      return;
    }
    const ok = window.confirm(
      `Delete ${total} ${total === 1 ? "task" : "tasks"} from "${COLUMN_LABELS[status]}"?\n\nThis action can't be undone.`,
    );
    if (!ok) return;
    const doomed = tasks.filter(
      (task) => task.status === status && ids.has(String(task.id)),
    );
    if (doomed.length != total) {
      window.alert("Something doesn't match, so nothing was deleted.");
      return;
    }
    tasks = tasks.filter((task) => !doomed.includes(task));
    ids.clear();
    selectMode[status] = false;
    saveTasks();
    renderTasks();
    announce(`${total} ${total === 1 ? "task" : "tasks"} deleted.`);
    return;
  }
  const card = event.target.closest(".task-card");
  const list = card ? card.closest(".task-list.selecting") : null;
  if (!list || event.target.closest(".task-menu")) return;
  const status = list.id.replace("list-", "");
  const id = card.dataset.taskId;
  if (selectedIds[status].has(id)) selectedIds[status].delete(id);
  else selectedIds[status].add(id);
  syncSelection(status);
});

document.addEventListener("change", (event) => {
  const allBox = event.target.closest(".select-all-box");
  if (!allBox) return;
  const status = allBox.dataset.status;
  selectedIds[status].clear();
  if (allBox.checked) {
    document
      .querySelectorAll(`#list-${status} .task-card`)
      .forEach((card) => selectedIds[status].add(card.dataset.taskId));
  }
  syncSelection(status);
});
function ensureUniqueIds() {
  const seen = new Set();
  let changed = false;
  tasks.forEach((task) => {
    if (!task.id || seen.has(String(task.id))) {
      task.id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      changed = true;
    }
    seen.add(String(task.id));
  });
  if (changed) saveTasks();
}
ensureUniqueIds();
/* ===== Alarm sounds (timer and reminders) ===== */
const ALARM_SECONDS = 10;
const ALARM_GAP = {
  timer: 1600,
  reminder: 1300,
};
let audioCtx = null;
let alarmBeat = null;
let alarmStop = null;

function unlockAudio() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume();
    if (audioCtx.state === "running")
      document.removeEventListener("click", unlockAudio, true);
  } catch (error) {
    /* sound is optional */
  }
}
document.addEventListener("click", unlockAudio, true);

function tone(freq, start, length, type, volume) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

const ALARM_SOUNDS = {
  timer(t) {
    tone(784, t, 1.2, "sine", 0.35);
    tone(1568, t, 0.8, "sine", 0.12);
  },
  reminder(t) {
    tone(988, t, 0.16, "triangle", 0.3);
    tone(1175, t + 0.2, 0.16, "triangle", 0.3);
    tone(988, t + 0.4, 0.16, "triangle", 0.3);
  },
};

function stopAlarm() {
  clearInterval(alarmBeat);
  clearTimeout(alarmStop);
  alarmBeat = null;
  alarmStop = null;
  const banner = document.getElementById("alarm-banner");
  if (banner) banner.hidden = true;
}

function showAlarmBanner(message) {
  let banner = document.getElementById("alarm-banner");
  if (!banner) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div id="alarm-banner" class="alarm-banner" role="alert" hidden><i class="fa-sound fa-bell" aria-hidden="true"></i><span id="alarm-text"></span><button type="button" id="alarm-stop">Stop</button></div>`,
    );
    banner = document.getElementById("alarm-banner");
    document.getElementById("alarm-stop").addEventListener("click", stopAlarm);
  }
  document.getElementById("alarm-text").textContent = message;
  banner.hidden = false;
}

function startAlarm(kind, message) {
  stopAlarm();
  showAlarmBanner(message);
  if (settings.alarmSound !== false) {
    unlockAudio();
    if (audioCtx) {
      const beat = () => ALARM_SOUNDS[kind](audioCtx.currentTime + 0.05);
      beat();
      alarmBeat = setInterval(beat, ALARM_GAP[kind]);
    }
  }
  alarmStop = setTimeout(stopAlarm, ALARM_SECONDS * 1000);
}

/* ===== Timer (focus and break, any length) ===== */
const TIMER_KEY = "flowspace.timer.v1";
const DEFAULT_SECONDS = {
  focus: 1500,
  break: 300,
};
const timerState = {
  mode: "focus",
  running: false,
  endAt: 0,
  remaining: 1500,
};
let timerTick = null;
const baseTitle = document.title;

function configuredSeconds(mode) {
  const value = Number(
    settings[mode === "focus" ? "timerFocusSec" : "timerBreakSec"],
  );
  return value > 0 ? value : DEFAULT_SECONDS[mode];
}
function saveTimerState() {
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify(timerState));
  } catch (error) {
    /* ignore */
  }
}
function formatClock(total) {
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}
function readFields() {
  const h = Math.max(
    0,
    Math.min(23, parseInt($("#timer-hours").value, 10) || 0),
  );
  const m = Math.max(
    0,
    Math.min(59, parseInt($("#timer-minutes").value, 10) || 0),
  );
  const s = Math.max(
    0,
    Math.min(59, parseInt($("#timer-seconds").value, 10) || 0),
  );
  return h * 3600 + m * 60 + s;
}
function loadFields(mode) {
  const total = configuredSeconds(mode);
  $("#timer-hours").value = Math.floor(total / 3600);
  $("#timer-minutes").value = Math.floor((total % 3600) / 60);
  $("#timer-seconds").value = total % 60;
  $("#timer-recommended").textContent = mode === "focus" ? "25 min" : "5 min";
}

function paintFlowTimer() {
  const clock = formatClock(timerState.remaining);
  const untouched =
    !timerState.running &&
    timerState.remaining === configuredSeconds(timerState.mode);
  const label = timerState.mode === "focus" ? "focus" : "break";
  $("#timer-display").textContent = clock;
  $("#timer-toggle").innerHTML = timerState.running
    ? `<i class="fa-solid fa-pause" aria-hidden="true"></i>Pause`
    : `<i class="fa-solid fa-play" aria-hidden="true"></i> ${untouched ? `Start ${label}` : "Resume"}`;
  $("#timer-caption").textContent =
    timerState.mode === "focus"
      ? timerState.running
        ? "Stay with this one thing."
        : "One thing at a time. You've got this."
      : "A few quiet minutes to reset.";
  $$(".mode-button").forEach((button) => {
    const selected = button.dataset.mode === timerState.mode;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  ["timer-hours", "timer-minutes", "timer-seconds"].forEach((id) => {
    document.getElementById(id).disabled = timerState.running;
  });
  document.title = timerState.running ? `${clock} . ${baseTitle}` : baseTitle;
}

function applyDuration(total) {
  if (!(total > 0)) return;
  settings[timerState.mode === "focus" ? "timerFocusSec" : "timerBreakSec"] =
    total;
  saveSettings();
  timerState.remaining = total;
  saveTimerState();
  paintFlowTimer();
}

function startFlowTimer() {
  unlockAudio();
  stopAlarm();
  if (timerState.remaining <= 0)
    timerState.remaining = configuredSeconds(timerState.mode);
  timerState.running = true;
  timerState.endAt = Date.now() + timerState.remaining * 1000;
  saveTimerState();
  clearInterval(timerTick);
  timerTick = setInterval(tickFlowTimer, 250);
  paintFlowTimer();
}
function pauseFlowTimer() {
  timerState.remaining = Math.max(
    0,
    Math.ceil((timerState.endAt - Date.now()) / 1000),
  );
  timerState.running = false;
  clearInterval(timerTick);
  timerTick = null;
  saveTimerState();
  paintFlowTimer();
}
function resetFlowTimer() {
  clearInterval(timerTick);
  timerTick = null;
  timerState.running = false;
  timerState.remaining = configuredSeconds(timerState.mode);
  saveTimerState();
  stopAlarm();
  paintFlowTimer();
  announce("Timer reset.");
}
function tickFlowTimer() {
  const left = Math.max(0, Math.ceil((timerState.endAt - Date.now()) / 1000));
  timerState.remaining = left;
  if (left <= 0) {
    finishFlowTimer();
    return;
  }
  paintFlowTimer();
}
function finishFlowTimer() {
  clearInterval(timerTick);
  timerTick = null;
  const finished = timerState.mode;
  timerState.running = false;
  if (finished === "focus") {
    const key = dateKey(new Date());
    activity[key] =
      (Number(activity[key]) || 0) +
      Math.round(configuredSeconds("focus") / 60);
    saveActivity();
  }
  timerState.mode = finished === "focus" ? "break" : "focus";
  timerState.remaining = configuredSeconds(timerState.mode);
  saveTimerState();
  loadFields(timerState.mode);
  paintFlowTimer();
  if (typeof updateStats === "function") updateStats();
  startAlarm(
    "timer",
    finished === "focus"
      ? "Focus time is up. Take a break!"
      : "Break is over. Ready to focus?",
  );
}
function setFlowMode(mode) {
  if (timerState.mode === mode) return;
  if (timerState.running) {
    announce("A timer is running. Pause or reset it before switching.");
    return;
  }
  timerState.mode = mode;
  timerState.remaining = configuredSeconds(mode);
  saveTimerState();
  loadFields(mode);
  paintFlowTimer();
}

function freshButton(selector) {
  const old = $(selector);
  const clone = old.cloneNode(true);
  old.replaceWith(clone);
  return clone;
}
freshButton("#timer-toggle").addEventListener("click", () =>
  timerState.running ? pauseFlowTimer() : startFlowTimer(),
);
freshButton("#timer-reset").addEventListener("click", resetFlowTimer);
$$(".mode-button").forEach((button) => {
  const fresh = button.cloneNode(true);
  button.replaceWith(fresh);
  fresh.addEventListener("click", () => setFlowMode(fresh.dataset.mode));
});
freshButton("#focus-shortcut").addEventListener("click", () => {
  $("#focus").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  setFlowMode("focus");
  if (timerState.mode === "focus" && !timerState.running) startFlowTimer();
});
["timer-hours", "timer-minutes", "timer-seconds"].forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => {
    if (!timerState.running) applyDuration(readFields());
  });
  input.addEventListener("change", () => loadFields(timerState.mode));
});
$("#timer-recommended").addEventListener("click", () => {
  if (timerState.running) return;
  applyDuration(DEFAULT_SECONDS[timerState.mode]);
  loadFields(timerState.mode);
});
const soundBox = $("#alarm-sound");
soundBox.checked = settings.alarmSecond !== false;
soundBox.addEventListener("change", () => {
  settings.alarmSound = soundBox.checked;
  saveSettings();
});
$("#test-timer-bell").addEventListener("click", () =>
  startAlarm("timer", "Timer bell test"),
);
$("#test-reminder-bell").addEventListener("click", () =>
  startAlarm("reminder", "Reminder bell test"),
);

(function initFlowTimer() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(TIMER_KEY));
  } catch (error) {
    saved = null;
  }
  timerState.mode = saved && saved.mode === "break" ? "break" : "focus";
  timerState.remaining = configuredSeconds(timerState.mode);
  if (saved) {
    if (saved.running && saved.endAt > Date.now()) {
      timerState.running = true;
      timerState.endAt = saved.endAt;
      timerState.remaining = Math.ceil((saved.endAt - Date.now()) / 1000);
      timerTick = setInterval(tickFlowTimer, 250);
    } else if (saved.running) {
      timerState.mode = timerState.mode === "focus" ? "break" : "focus";
      timerState.remaining = configuredSeconds(timerState.mode);
      announce("Your timer finished while you were away.");
    } else if (Number(saved.remaining) > 0) {
      timerState.remaining = Math.min(
        Number(saved.remaining),
        configuredSeconds(timerState.mode),
      );
    }
  }
  loadFields(timerState.mode);
  paintFlowTimer();
})();

updateGreeting();
applyTheme(localStorage.getItem(THEME_KEY) || settings.theme);
applyTextScale(Number(settings.textScale) || 1);
renderTasks();
paintUser();
if (userName) document.documentElement.classList.add("has-user");
else showWelcome();

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
    startAlarm("reminder", `Reminder: ${task.title}`);
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
