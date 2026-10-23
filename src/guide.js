"use strict";

const PALETTE = [
  { bg: "#6D4CF0", a1: "#6544E6", a2: "#B8329A" },
  { bg: "#F0627F", a1: "#D63A5E", a2: "#B45309" },
  { bg: "#18B79A", a1: "#0B7F69", a2: "#1F6FD6" },
  { bg: "#F5A03A", a1: "#B45309", a2: "#D63A5E" },
  { bg: "#3B8CF0", a1: "#1F6FD6", a2: "#6544E6" },
  { bg: "#D24CB3", a1: "#B8329A", a2: "#6544E6" },
];

const STEPS = [
  {
    icon: "fa-wand-magic-sparkles",
    title: "Welcome to FlowSpace",
    text: "Your calm place to plan the day. This quick tour shows you how everything works. Press <strong>Next</strong> to begin. It takes about a minute.",
    demo: `<i class="fa-solid fa-wand-magic-sparkles g-bigicon"></i>`,
  },
  {
    icon: "fa-user",
    title: "Start with your name",
    text: "Type your full name, like <strong>Jennifer Richards</strong>, or a nickname like <strong>Jenny</strong>. FlowSpace greets you by name everywhere.",
    demo: `<div class="g-col"><div class="g-input"><span class="g-typing">Jennifer Richards</span></div><span class="g-mini-btn">Enter FlowSpace <i class="fa-solid fa-arrow-right"></i></span></div>`,
  },
  {
    icon: "fa-plus",
    title: "Add your first task",
    text: "Press <strong>Add a task</strong> (or <strong>New task</strong> on the board). Give it a name, a category and a priority. Misspelled a word? FlowSpace offers a quick fix.",
    demo: `<div class="g-col"><span class="g-mini-btn"><i class="fa-solid fa-plus"></i> Add a task</span><div class="g-task g-pop"><strong>Plan my week</strong><span class="g-tags"><em>Work</em><em class="hi">High</em></span></div></div>`,
  },
  {
    icon: "fa-bell",
    title: "Dates, times and reminders",
    text: "Pick a due date and time, then choose <strong>Remind me</strong>. In a hurry? Use <strong>Due in</strong>, for example 3 hours, and FlowSpace works out the time for you. Keep the tab open and you get an alert.",
    demo: `<div class="g-chips"><span class="g-chip" style="--i:0"><i class="fa-regular fa-calendar"></i> Today</span><span class="g-chip" style="--i:1"><i class="fa-regular fa-clock"></i> 6:00 PM</span><span class="g-chip" style="--i:2"><i class="fa-regular fa-bell"></i> Remind me 10 min before</span><span class="g-chip" style="--i:3"><i class="fa-solid fa-hourglass-half"></i> Or due in 3 h 0 m 0 s</span></div>`,
  },
  {
    icon: "fa-arrows-left-right",
    title: "Move tasks along",
    text: "Press the button on a card to move it from <strong>To do</strong> to <strong>In progress</strong> to <strong>Completed</strong>. Tap the circle to finish a task fast.",
    demo: `<div class="g-cols"><div class="g-col-box">To do</div><div class="g-col-box">In progress</div><div class="g-col-box">Completed</div><div class="g-card-mini g-hop">My task</div></div>`,
  },
  {
    icon: "fa-hand-pointer",
    title: "Drag and drop",
    text: "On a computer, drag a card to another column. On a phone or tablet, <strong>press and hold</strong> a card, then slide it where you want it.",
    demo: `<div class="g-col"><div class="g-cols"><div class="g-col-box">To do</div><div class="g-col-box">In progress</div><div class="g-col-box">Completed</div><div class="g-card-mini g-drag">My task<i class="fa-solid fa-hand-pointer g-hand"></i></div></div><p class="g-note">Phones: press and hold, then slide</p></div>`,
  },
  {
    icon: "fa-square-check",
    title: "Select and delete many",
    text: "Press <strong>Select</strong> on a column, tick the tasks you want, and delete them together. FlowSpace asks <strong>Are you sure?</strong> first, because deleted tasks can't be brought back.",
    demo: `<div class="g-col"><div class="g-rows"><div class="g-row"><span class="g-box" style="--i:0"><i class="fa-solid fa-check"></i></span> Water the plants</div><div class="g-row"><span class="g-box" style="--i:1"><i class="fa-solid fa-check"></i></span> Take a lunch break</div><div class="g-row"><span class="g-box" style="--i:2"><i class="fa-solid fa-check"></i></span> Read a chapter</div></div><div class="g-confirm"><i class="fa-solid fa-triangle-exclamation"></i> Delete 3 tasks? This can't be undone.</div></div>`,
  },
  {
    icon: "fa-hourglass-half",
    title: "Focus room",
    text: "Choose any time, in hours, minutes or seconds, or use the recommended <strong>25 minutes</strong>. A bell rings when time is up, so you can look away from the clock.",
    demo: `<div class="g-col"><div class="g-clock">25:00</div><div class="g-units"><span>Hours</span><span>Min</span><span>Sec</span></div><i class="fa-solid fa-bell g-bell"></i></div>`,
  },
  {
    icon: "fa-palette",
    title: "Make it yours",
    text: "Pick a theme: <strong>Electric Bloom, Ocean Breeze, Sunset Glow</strong> or <strong>Midnight</strong>. Text too small? Use <strong>A−</strong>, <strong>Reset</strong> and <strong>A+</strong> to change the size.",
    demo: `<div class="g-col"><div class="g-themes"><span class="g-theme" style="--i:0"><i style="background:#7655F6"></i><i style="background:#FF718B"></i><i style="background:#64DDB5"></i>Electric Bloom</span><span class="g-theme" style="--i:1"><i style="background:#188E9B"></i><i style="background:#5CC6B1"></i><i style="background:#F3B969"></i>Ocean Breeze</span><span class="g-theme" style="--i:2"><i style="background:#E87967"></i><i style="background:#F3A34D"></i><i style="background:#A9C884"></i>Sunset Glow</span><span class="g-theme" style="--i:3"><i style="background:#9C99F5"></i><i style="background:#FF8FB3"></i><i style="background:#5FE3C8"></i>Midnight</span></div><div class="g-size"><span>A−</span><span>Reset</span><span class="g-up">A+</span></div></div>`,
  },
  {
    icon: "fa-compass",
    title: "Find your way around",
    text: "Use the menu to jump between <strong>My day</strong>, <strong>My tasks</strong>, <strong>Focus room</strong>, <strong>Insights</strong> and <strong>Preferences</strong>.",
    demo: `<div class="g-menu"><span style="--i:0"><i class="fa-solid fa-house"></i> My day</span><span style="--i:1"><i class="fa-regular fa-square-check"></i> My tasks</span><span style="--i:2"><i class="fa-regular fa-clock"></i> Focus room</span><span style="--i:3"><i class="fa-solid fa-chart-simple"></i> Insights</span><span style="--i:4"><i class="fa-solid fa-sliders"></i> Preferences</span></div>`,
  },
  {
    icon: "fa-circle-check",
    title: "You're all set!",
    text: "That's everything. Want to watch the guide again, or are you ready to start planning your day?",
    demo: `<i class="fa-solid fa-circle-check g-bigicon"></i>`,
  },
];

const SAY = [
  "Hi, I'm Flo, and I'll show you around FlowSpace in just a couple of minutes. Sit back, I'll do the clicking.",
  "First, tell FlowSpace your name. Type your full name, like Jennifer Richards, or a nickname, like Jenny. Then press enter, and your space is ready.",
  "Now let's add a task. Press Add a task, give it a name, pick a category and a priority, and you're done. If you misspell something, I'll suggest a fix.",
  "Need a deadline? Choose a date and a time, and turn on a reminder. Or just say due in three hours, and FlowSpace works out the time for you.",
  "As you get things done, move your tasks along: from to do, to in progress, to completed. One tap on the circle finishes a task fast.",
  "You can also drag a card to another column. On a phone or tablet, press and hold the card, then slide it where you want it.",
  "Cleaning up? Press Select, tick the tasks you don't need, and delete them together. I'll always ask if you're sure, because it can't be undone.",
  "Need to concentrate? The focus room lets you pick any time, from seconds to hours, or use the recommended twenty five minutes. A bell tells you when time is up.",
  "Make it yours. Switch between four themes, and use A minus, reset, and A plus to make the text smaller or bigger.",
  "And to get around, use the menu: My day, My tasks, the Focus room, Insights, and Preferences.",
  "That's the whole tour. Watch it again, or head in and start planning your day. Enjoy FlowSpace!",
];

/* To use your own recorded voice, list the files here in order, for example:
     const AUDIO = ["guide/step1.mp3", "guide/step2.mp3", ... "guide/step11.mp3"];
     Leave it empty to use the browser voice. */
const AUDIO = [];

const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
const reduceMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let root = null;
let index = 0;
let lastFocus = null;
let prevOverflow = "";
let playing = true;
let voiceOn = Boolean(synth);
let runId = 0;
let timer = null;
let typer = null;
let audioEl = null;

function pickVoice() {
  if (!synth) return null;
  const voices = synth.getVoices().filter((voice) => /^en/i.test(voice.lang));
  const prefer = [
    "Natural",
    "Online",
    "Aria",
    "Jenny",
    "Samantha",
    "Google US English",
    "Google UK English Female",
    "Zira",
    "Hazel",
    "Susan",
  ];
  for (const name of prefer) {
    const hit = voices.find((voice) => voice.name.includes(name));
    if (hit) return hit;
  }
  return voices[0] || null;
}

function estimate(text) {
  return Math.max(5000, (text.split(/\s+/).length / 2.6 + 1.2) * 1000);
}

let watchdog = null;

function stopMedia() {
  runId += 1;
  clearTimeout(timer);
  clearTimeout(watchdog);
  clearInterval(typer);
  let busy = false;
  if (synth) {
    busy = synth.speaking || synth.pending;
    if (busy) synth.cancel();
  }
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
  return busy;
}

function syncControls() {
  const pause = root.querySelector("[data-pause]");
  const voice = root.querySelector("[data-voice]");
  if (pause) {
    pause.innerHTML = `<i class="fa-solid ${playing ? "fa-pause" : "fa-play"}" aria-hidden="true"></i>`;
    pause.setAttribute(
      "aria-label",
      playing ? "Pause the guide" : "Play the guide",
    );
  }
  if (voice) {
    voice.innerHTML = `<i class="fa-solid ${voiceOn ? "fa-volume-high" : "fa-volume-xmark"}" aria-hidden="true"></i>`;
    voice.setAttribute(
      "aria-label",
      voiceOn ? "Turn the voice off" : "Turn the voice on",
    );
  }
}

function afterStep() {
  if (!root) return;
  clearTimeout(watchdog);
  const host = root.querySelector(".g-host");
  if (host) host.classList.remove("speaking");
  if (playing && index < STEPS.length - 1) {
    timer = setTimeout(() => {
      if (root) go(index + 1);
    }, 700);
  }
}

function startStep() {
  const busy = stopMedia();
  const id = runId;
  const say = SAY[index] || "";
  const bubble = root.querySelector(".g-typed");
  const host = root.querySelector(".g-host");
  syncControls();
  root.classList.toggle("is-paused", !playing);
  if (!playing) {
    bubble.textContent = say;
    host.classList.remove("speaking");
    return;
  }
  const total = estimate(say);
  root.style.setProperty("--dur", `${total}ms`);
  host.classList.add("speaking");
  if (reduceMotion) {
    bubble.textContent = say;
  } else {
    const words = say.split(" ");
    let shown = 0;
    bubble.textContent = "";
    typer = setInterval(
      () => {
        shown += 1;
        bubble.textContent = words.slice(0, shown).join(" ");
        if (shown >= words.length) clearInterval(typer);
      },
      Math.max(120, (total - 1000) / words.length),
    );
  }
  const done = () => {
    if (id === runId) afterStep();
  };
  const fallback = () => {
    if (id === runId) timer = setTimeout(done, total);
  };
  const src = AUDIO[index];
  if (src) {
    audioEl = new Audio(src);
    audioEl.onended = done;
    audioEl.onerror = fallback;
    audioEl.play().catch(fallback);
  } else if (voiceOn && synth) {
    const voice = pickVoice();
    const utterance = new SpeechSynthesisUtterance(say);
    if (voice) utterance.voice = voice;
    utterance.lang = voice ? voice.lang : "en-US";
    utterance.onend = done;
    utterance.onerror = fallback;
    const speakNow = () => {
      if (id !== runId) return;
      synth.speak(utterance);
      watchdog = setTimeout(done, total * 2 + 4000);
    };
    if (busy) setTimeout(speakNow, 150);
    else speakNow();
  } else {
    timer = setTimeout(done, total);
  }
}

function render() {
  const step = STEPS[index];
  const pal = PALETTE[index % PALETTE.length];
  const last = index === STEPS.length - 1;
  root.style.setProperty("--bg", pal.bg);
  root.style.setProperty("--a1", pal.a1);
  root.style.setProperty("--a2", pal.a2);
  const segs = STEPS.map(
    (_, i) =>
      `<button type="button" class="g-seg${i < index ? " done" : i === index ? " now" : ""}" data-go="${i}" aria-label="Go to step ${i + 1}"><b></b></button>`,
  ).join("");
  const back =
    index > 0
      ? `<button type="button" class="g-btn g-back" data-back><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back</button>`
      : "";
  const actions = last
    ? `<button type="button" class="g-btn g-back" data-restart><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Watch again</button><button type="button" class="g-btn g-next" data-close>Proceed to FlowSpace <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>`
    : `${back}<button type="button" class="g-btn g-next" data-next>Next <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>`;
  const voiceButton =
    synth || AUDIO.length
      ? `<button type="button" class="g-icon" data-voice></button>`
      : "";
  root.innerHTML = `<div class="g-card">
      <div class="g-segs">${segs}</div>
      <div class="g-head">
        <div class="g-hostbar"><span class="g-host"><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i></span><span class="g-hostname">Flo<small>Your FlowSpace guide</small></span></div>
        <div class="g-tools">${voiceButton}<button type="button" class="g-icon" data-pause></button><button type="button" class="g-skip" data-close>Skip <i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>
      </div>
      <div class="g-stage" aria-hidden="true">${step.demo}</div>
      <h2 class="g-title" id="guide-title"><i class="fa-solid ${step.icon}" aria-hidden="true"></i> ${step.title}</h2>
      <div class="g-bubble"><p class="g-say" aria-hidden="true"><span class="g-ghost">${SAY[index]}</span><span class="g-typed"></span></p><span class="sr-only">${SAY[index]}</span></div>
      <div class="g-actions${last ? " is-last" : ""}">${actions}</div>
    </div>`;
  root.querySelector(".g-next").focus({ preventScroll: true });
  startStep();
}

function go(i) {
  index = Math.max(0, Math.min(STEPS.length - 1, i));
  render();
}

function onClick(event) {
  const button = event.target.closest("button");
  if (!button || !root.contains(button)) return;
  if (button.hasAttribute("data-close")) close();
  else if (button.hasAttribute("data-next")) go(index + 1);
  else if (button.hasAttribute("data-back")) go(index - 1);
  else if (button.hasAttribute("data-restart")) {
    playing = true;
    go(0);
  } else if (button.hasAttribute("data-go")) go(Number(button.dataset.go));
  else if (button.hasAttribute("data-pause")) {
    playing = !playing;
    startStep();
  } else if (button.hasAttribute("data-voice")) {
    voiceOn = !voiceOn;
    startStep();
  }
}

function onKey(event) {
  if (!root) return;
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    close();
    return;
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    go(index + 1);
    return;
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    go(index - 1);
    return;
  }
  if (event.key === "Tab") {
    const items = [...root.querySelectorAll("button:not([disabled])")];
    if (!items.length) return;
    const first = items[0];
    const end = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      end.focus();
    } else if (!event.shiftKey && document.activeElement === end) {
      event.preventDefault();
      first.focus();
    }
  }
}

function open(trigger) {
  if (root) return;
  lastFocus = trigger;
  index = 0;
  playing = true;
  voiceOn = Boolean(synth);
  prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  root = document.createElement("div");
  root.className = "guide";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-labelledby", "guide-title");
  root.addEventListener("click", onClick);
  document.body.appendChild(root);
  document.addEventListener("keydown", onKey, true);
  render();
}

function close() {
  if (!root) return;
  stopMedia();
  document.removeEventListener("keydown", onKey, true);
  root.remove();
  root = null;
  document.body.style.overflow = prevOverflow;
  if (lastFocus && lastFocus.isConnected)
    lastFocus.focus({ preventScroll: true });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-open-guide]");
  if (!trigger) return;
  event.preventDefault();
  open(trigger);
});
