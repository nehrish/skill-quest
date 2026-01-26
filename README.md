# Skill Quest

**Web Dev II (Batch 2029) – Final Project**  
A fully functional, interactive DOM-based web application built with **Vanilla JavaScript** (no frameworks).

---

## Project Title & Description

**Skill Quest** is a browser-based skill tracker where users earn XP and level up by completing three mini-games: **Reaction Test**, **Quiz**, and **Typing Challenge**. Progress and best scores persist in `localStorage`. The app uses extensive DOM manipulation, event handling, and client-side state management.

---

## Problem Statement

Users lack an engaging, lightweight way to track skill progress (reaction time, knowledge, typing) in the browser without installing apps or creating accounts. Skill Quest solves this by providing a single-page, offline-capable experience that feels like a real application with clear feedback and persistent data.

---

## Features Implemented

| Feature | Description |
|--------|-------------|
| **Reaction Game** | Wait for green, then click. Early clicks show error feedback. Best reaction time (ms) is stored. |
| **Quiz** | 5 multiple-choice questions (shuffled each run). Correct/incorrect highlighting. Best quiz score stored. |
| **Typing Challenge** | Type a given sentence; form submit with validation. Exact-match check. Best completion time (s) stored. |
| **XP & Levels** | Gain XP from games; level up every 100 XP. Level gates: Quiz at 2, Typing at 3. |
| **Best Scores** | `bestReactionMs`, `bestQuizScore`, `bestTypingSec` in state and shown on home. |
| **Theme Toggle** | Dark/Light mode; preference saved in `localStorage`. |
| **Reset** | Clear all progress and best scores (with confirm). |
| **Toast Notifications** | Success/error feedback (e.g. empty submit, wrong text, reset). |
| **Keyboard** | `Escape` returns to home from Reaction, Quiz, or Typing. |
| **Responsive UI** | Works on small viewports; touch-friendly. |

---

## DOM Concepts Used

| Concept | Where used |
|---------|------------|
| **Creating elements dynamically** | `document.createElement` for title, progress bar, toasts, quiz/result screens; `innerHTML` for structured blocks. |
| **Updating DOM from state** | Progress bar `style.width`, level/XP text, disabled state of Quiz/Typing buttons based on `state.level`. |
| **Removing / toggling elements** | `toast.remove()`, `innerHTML = ""` to clear screens; `classList.add/remove` for `green`, `shake`, `error`, `opt-correct`, `opt-wrong`. |
| **Changing styles via JavaScript** | `element.style.width`, `element.style.animation`; `document.body.className` for theme. |
| **Event delegation** | Single `click` listener on `#app` for `[data-action]` buttons; separate delegation for `.opt` in Quiz. |
| **Form submission** | `form.addEventListener("submit", …)` with `preventDefault()`; validation before processing. |
| **Keyboard events** | `document.addEventListener("keydown", …)` for `Escape`. |
| **Timers** | `setTimeout` for reaction green delay, quiz “next question” delay, toast auto-remove. |
| **LocalStorage** | `getItem` / `setItem` for state; `removeItem` on reset. |

---

## Steps to Run the Project

1. **Clone or download** the project (ensure `index.html`, `style.css`, `script.js` are in the same folder).
2. **Open `index.html`** in a modern browser (Chrome, Firefox, Edge, Safari) – e.g. double-click the file or use “Open with” and select the browser.
3. **Optional (local server):**  
   - `npx serve .`  
   - or `python -m http.server 8000`  
   then visit `http://localhost:8000` (or the port shown).
4. No build step, frameworks, or backend required.

---

## Known Limitations

- **No backend:** All data is in `localStorage`; clearing site data removes progress.
- **Single-player only:** No multi-user or sync.
- **Quiz set is fixed:** 5 questions; no API or external question source.
- **Typing sentence is fixed:** One sentence; no difficulty levels.
- **Reaction game:** No median/outlier handling; best time can be a lucky click.

---

## Tech Stack (Allowed per Guidelines)

- **HTML5**
- **CSS3** (Flexbox, variables, transitions, basic media queries)
- **Vanilla JavaScript (ES6+)** – `const`/`let`, arrow functions, template literals, `dataset`, `classList`, `closest`, etc.
- **Browser APIs:** `localStorage`, `setTimeout`, `Date`

**Not used:** React, Angular, Vue, jQuery, or any UI library that abstracts DOM logic.

---

## File Structure

```
├── index.html   # Entry; loads style.css and script.js
├── style.css    # Layout, theming, responsive, animations
├── script.js    # State, DOM, events, game logic
└── README.md    # This file
```

---

## Evaluation Checklist (Self-Check)

- [x] DOM manipulation: create, update, remove, style
- [x] Events: click, submit, keydown, input; event delegation
- [x] Logic vs UI: state object, `save()`, `render*` functions
- [x] Data: objects/arrays, `localStorage`
- [x] Edge cases: early click, empty submit, wrong typing, confirm on reset
- [x] Clear feedback: toasts, correct/wrong classes, “New best”
- [x] Basic responsiveness
- [x] No frameworks or jQuery
- [x] README with title, problem, features, DOM concepts, run steps, limitations
