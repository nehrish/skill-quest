/**
 * Skill Quest - DOM-Based Interactive Skill Tracker
 * Web Dev II Final Project | Vanilla JavaScript, no frameworks
 * 
 * DOM: createElement, innerHTML, classList, style, append, remove
 * Events: click, submit, keydown, input | Event delegation on #app
 * State: level, xp, highScores, darkMode | LocalStorage persistence
 */

const app = document.getElementById("app");
const XP_PER_LEVEL = 100;

// ---------- QUIZ DATA (application data, separate from UI) ----------
const QUIZ_QUESTIONS = [
  { question: "What does DOM stand for?", options: ["Data Object Model", "Document Object Model", "Digital Output Method"], answer: 1 },
  { question: "Which method creates a new HTML element?", options: ["document.newElement()", "document.createElement()", "document.add()"], answer: 1 },
  { question: "What is event delegation?", options: ["Delegating to a framework", "Using a parent to handle children's events", "Async events only"], answer: 1 },
  { question: "localStorage data persists when:", options: ["Tab closes only", "Browser closes", "Until explicitly cleared"], answer: 2 },
  { question: "addEventListener allows:", options: ["One handler per element", "Multiple handlers per event", "Only click events"], answer: 1 },
];

// ---------- STATE ----------
let state = JSON.parse(localStorage.getItem("skillQuest")) || {
  level: 1,
  xp: 0,
  highScore: 0,
  darkMode: true,
  bestReactionMs: null,
  bestQuizScore: 0,
  bestTypingSec: null,
};

document.body.className = state.darkMode ? "" : "light";

// ---------- PERSISTENCE ----------
function save() {
  localStorage.setItem("skillQuest", JSON.stringify(state));
}

// ---------- FEEDBACK HELPERS (DOM: create, append, remove, style) ----------
function showToast(message, isError = false) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast " + (isError ? "toast-error" : "toast-ok");
  toast.textContent = message;
  document.body.appendChild(toast);

  toast.style.animation = "slideIn 0.3s ease";
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => toast.remove(), 280);
  }, 2200);
}

// ---------- HOME SCREEN ----------
function renderHome() {
  app.innerHTML = "";
  app.className = "home";

  const header = document.createElement("header");
  header.className = "home-header";
  header.innerHTML = `
    <h1 class="home-title">Skill Quest</h1>
    <span class="home-level">Level ${state.level}</span>
  `;
  app.appendChild(header);

  const stats = document.createElement("section");
  stats.className = "home-stats";
  const pct = Math.round((state.xp / XP_PER_LEVEL) * 100);
  stats.innerHTML = `
    <div class="home-xp">
      <span class="home-xp-current">${state.xp}</span>
      <span class="home-xp-sep">/</span>
      <span class="home-xp-max">${XP_PER_LEVEL}</span>
      <span class="home-xp-label">XP</span>
    </div>
    <div class="progress-bar">
      <div class="progress" style="width:${pct}%"></div>
    </div>
  `;
  app.appendChild(stats);

  const bests = document.createElement("section");
  bests.className = "home-bests";
  const hasAny = state.bestReactionMs != null || state.bestQuizScore > 0 || state.bestTypingSec != null;
  bests.innerHTML = `
    <h3 class="home-bests-title">Personal Bests</h3>
    <div class="home-bests-grid">
      <div class="best-pill">
        <span class="best-pill-icon">⚡</span>
        <span class="best-pill-value">${state.bestReactionMs != null ? state.bestReactionMs + " ms" : "—"}</span>
      </div>
      <div class="best-pill">
        <span class="best-pill-icon">🧠</span>
        <span class="best-pill-value">${state.bestQuizScore > 0 ? state.bestQuizScore + "/5" : "—"}</span>
      </div>
      <div class="best-pill">
        <span class="best-pill-icon">⌨</span>
        <span class="best-pill-value">${state.bestTypingSec != null ? state.bestTypingSec + " s" : "—"}</span>
      </div>
    </div>
    ${!hasAny ? '<p class="home-bests-empty">Play games to set your first records</p>' : ""}
  `;
  app.appendChild(bests);

  const games = document.createElement("section");
  games.className = "home-games";
  games.innerHTML = `
    <h3 class="home-games-title">Choose a challenge</h3>
    <div class="home-game-grid">
      <div class="home-game-card" data-action="reaction">
        <span class="home-game-icon">⚡</span>
        <span class="home-game-name">Reaction</span>
        <span class="home-game-desc">Click when the box turns green</span>
      </div>
      <div class="home-game-card" data-action="quiz" data-locked="${state.level < 2}">
        <span class="home-game-icon">🧠</span>
        <span class="home-game-name">Quiz</span>
        <span class="home-game-desc">${state.level >= 2 ? "5 DOM & JS questions" : "Unlocks at Level 2"}</span>
      </div>
      <div class="home-game-card" data-action="typing" data-locked="${state.level < 3}">
        <span class="home-game-icon">⌨</span>
        <span class="home-game-name">Typing</span>
        <span class="home-game-desc">${state.level >= 3 ? "Type the sentence fast" : "Unlocks at Level 3"}</span>
      </div>
    </div>
  `;
  app.appendChild(games);

  const footer = document.createElement("footer");
  footer.className = "home-footer";
  footer.innerHTML = `
    <button type="button" class="home-btn-ghost" data-action="theme">Theme</button>
    <button type="button" class="home-btn-ghost" data-action="reset">Reset progress</button>
  `;
  app.appendChild(footer);
}

// ---------- REACTION GAME ----------
function startReaction() {
  app.className = "";
  app.innerHTML = "";

  const h3 = document.createElement("h3");
  h3.textContent = "Reaction Test";
  app.appendChild(h3);

  const hint = document.createElement("p");
  hint.textContent = "Wait for the box to turn green, then click. Do not click early.";
  hint.className = "hint";
  app.appendChild(hint);

  const box = document.createElement("div");
  box.id = "reaction-box";
  box.className = "game-box";
  box.textContent = "WAIT...";
  app.appendChild(box);

  const feedback = document.createElement("p");
  feedback.id = "reaction-feedback";
  feedback.className = "game-feedback";
  app.appendChild(feedback);

  let startTime = null;
  let hasStarted = false;

  // Early click: penalize and show error
  box.addEventListener("click", function onBoxClick() {
    if (!hasStarted) {
      feedback.textContent = "Too early! Wait for green.";
      feedback.classList.add("error");
      box.classList.add("shake");
      setTimeout(() => box.classList.remove("shake"), 400);
      return;
    }
    if (!startTime) return;

    const time = Date.now() - startTime;
    const xp = Math.max(10, Math.min(100, 120 - Math.floor(time / 20)));

    if (state.bestReactionMs == null || time < state.bestReactionMs) {
      state.bestReactionMs = time;
      save();
    }

    gainXP(xp);
    box.removeEventListener("click", onBoxClick);
    renderResult(`Reaction: ${time} ms`, xp, state.bestReactionMs === time ? " New best!" : "");
  });

  setTimeout(() => {
    hasStarted = true;
    box.classList.add("green");
    box.textContent = "CLICK!";
    startTime = Date.now();
  }, Math.random() * 2000 + 1500);
}

// Current quiz session (shuffled order) for event-delegation handler
let quizSession = { shuffled: [], total: 0 };

// ---------- QUIZ (multiple questions, shuffle, event delegation on options) ----------
function startQuiz() {
  app.className = "";
  quizSession.shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
  quizSession.total = quizSession.shuffled.length;

  const q = quizSession.shuffled[0];
  app.innerHTML = "";

  const h3 = document.createElement("h3");
  h3.textContent = `Quiz (1/${quizSession.total})`;
  app.appendChild(h3);

  const questionEl = document.createElement("p");
  questionEl.className = "quiz-question";
  questionEl.textContent = q.question;
  app.appendChild(questionEl);

  const opts = document.createElement("div");
  opts.className = "quiz-options";
  opts.dataset.quizCurrent = "0";
  opts.dataset.quizTotal = String(quizSession.total);
  opts.dataset.quizCorrect = "0";
  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "opt";
    btn.dataset.answer = String(i);
    btn.dataset.correct = String(q.answer);
    btn.textContent = text;
    opts.appendChild(btn);
  });
  app.appendChild(opts);
}

// ---------- TYPING (form submit + keyboard, validation) ----------
function startTyping() {
  app.className = "";
  const text = "javascript makes the web interactive";
  app.innerHTML = "";

  const h3 = document.createElement("h3");
  h3.textContent = "Typing Challenge";
  app.appendChild(h3);

  const target = document.createElement("p");
  target.className = "typing-target";
  target.textContent = text;
  app.appendChild(target);

  const form = document.createElement("form");
  form.id = "typing-form";
  form.innerHTML = `
    <input type="text" id="typing-input" placeholder="Type the sentence above" autocomplete="off" spellcheck="false" />
    <button type="submit">Submit</button>
  `;
  app.appendChild(form);

  const feedback = document.createElement("p");
  feedback.id = "typing-feedback";
  feedback.className = "game-feedback";
  app.appendChild(feedback);

  const start = Date.now();
  const input = document.getElementById("typing-input");
  input.focus();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const val = (input.value || "").trim();
    if (!val) {
      showToast("Please type something before submitting.", true);
      return;
    }
    if (val !== text) {
      showToast("Text does not match. Check spelling and spaces.", true);
      feedback.textContent = "Try again. Match the sentence exactly.";
      feedback.classList.add("error");
      return;
    }

    const sec = Math.floor((Date.now() - start) / 1000);
    const xp = Math.max(20, Math.min(100, 110 - sec * 5));

    if (state.bestTypingSec == null || sec < state.bestTypingSec) {
      state.bestTypingSec = sec;
      save();
    }

    gainXP(xp);
    renderResult(`Completed in ${sec}s`, xp, state.bestTypingSec === sec ? " New best!" : "");
  });
}

// ---------- RESULT SCREEN ----------
function renderResult(msg, xp, extra = "") {
  app.className = "";
  app.innerHTML = "";
  const div = document.createElement("div");
  div.className = "result";
  div.innerHTML = `
    <h3>Completed</h3>
    <p>${msg}${extra}</p>
    <p>XP Earned: ${xp}</p>
    <button type="button" data-action="home">Home</button>
  `;
  app.appendChild(div);
}

// ---------- GAME HELPERS ----------
function gainXP(amount) {
  state.xp += amount;
  if (state.xp >= XP_PER_LEVEL) {
    state.level++;
    state.xp = state.xp - XP_PER_LEVEL;
  }
  if (state.highScore < state.level) state.highScore = state.level;
  save();
}

// ---------- THEME & RESET ----------
function toggleTheme() {
  state.darkMode = !state.darkMode;
  document.body.className = state.darkMode ? "" : "light";
  save();
  renderHome();
}

function resetGame() {
  if (!confirm("Reset all progress and highscores?")) return;
  localStorage.removeItem("skillQuest");
  state = {
    level: 1,
    xp: 0,
    highScore: 0,
    darkMode: state.darkMode,
    bestReactionMs: null,
    bestQuizScore: 0,
    bestTypingSec: null,
  };
  save();
  renderHome();
  showToast("Progress reset.");
}

// ---------- EVENT DELEGATION (single listener on #app for dynamic buttons and cards) ----------
app.addEventListener("click", function (e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  if (btn.disabled || btn.dataset.locked === "true") return;

  const action = btn.getAttribute("data-action");
  if (action === "home") renderHome();
  else if (action === "reaction") startReaction();
  else if (action === "quiz") startQuiz();
  else if (action === "typing") startTyping();
  else if (action === "theme") toggleTheme();
  else if (action === "reset") resetGame();
});

// Quiz options: delegation for dynamically created .opt buttons
app.addEventListener("click", function (e) {
  const opt = e.target.closest("button.opt");
  if (!opt) return;

  const container = opt.closest(".quiz-options");
  if (!container) return;

  let current = parseInt(container.dataset.quizCurrent, 10);
  const total = parseInt(container.dataset.quizTotal, 10);
  let correctCount = parseInt(container.dataset.quizCorrect, 10);

  const chosen = parseInt(opt.dataset.answer, 10);
  const correct = parseInt(opt.dataset.correct, 10);
  const isCorrect = chosen === correct;
  if (isCorrect) correctCount++;

  // Visual feedback: disable all, highlight chosen and correct
  container.querySelectorAll("button.opt").forEach((b) => (b.disabled = true));
  opt.classList.add(isCorrect ? "opt-correct" : "opt-wrong");
  const correctBtn = container.querySelector(`[data-answer="${correct}"]`);
  if (!isCorrect && correctBtn) correctBtn.classList.add("opt-correct");

  current++;
  container.dataset.quizCurrent = current;
  container.dataset.quizCorrect = correctCount;

  setTimeout(() => {
    if (current >= total) {
      const xp = 10 + correctCount * 15;
      gainXP(xp);
      if (correctCount > state.bestQuizScore) {
        state.bestQuizScore = correctCount;
        save();
      }
      renderResult(`Quiz: ${correctCount}/${total} correct`, xp, correctCount === state.bestQuizScore && correctCount > 0 ? " New best!" : "");
    } else {
      const qNext = quizSession.shuffled[current];
      if (!qNext) return;
      app.innerHTML = "";
      const h3 = document.createElement("h3");
      h3.textContent = `Quiz (${current + 1}/${total})`;
      app.appendChild(h3);
      const questionEl = document.createElement("p");
      questionEl.className = "quiz-question";
      questionEl.textContent = qNext.question;
      app.appendChild(questionEl);
      const opts = document.createElement("div");
      opts.className = "quiz-options";
      opts.dataset.quizCurrent = String(current);
      opts.dataset.quizTotal = String(total);
      opts.dataset.quizCorrect = String(correctCount);
      qNext.options.forEach((text, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "opt";
        b.dataset.answer = String(i);
        b.dataset.correct = String(qNext.answer);
        b.textContent = text;
        opts.appendChild(b);
      });
      app.appendChild(opts);
    }
  }, 800);
});

// ---------- KEYBOARD EVENTS ----------
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (document.getElementById("typing-form") || document.querySelector(".quiz-options") || document.getElementById("reaction-box")) {
      renderHome();
      showToast("Returned to home.");
    }
  }
});

// ---------- INIT ----------
renderHome();
