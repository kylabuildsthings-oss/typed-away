# TYPED AWAY

**Type. Learn. Conquer.**

A pixel-art Coding Dojo where you type Python katas, climb belt ranks, and protect your Spirit Energy. Warm pinks, wood, and scroll-style UI — built as a **browser game** (recommended) with an optional **terminal** version.

---

## Game walkthrough

### 1. Enter the dojo

Open the title screen. You’ll see the dojo splash and a welcome scroll:

- **TYPED AWAY**
- Tagline: *Type. Learn. Conquer.*
- Spirit Energy starts at **❤️ ❤️ ❤️**

Click **Begin training ✦** (or press **Enter**) to start.

### 2. Face a kata

Each challenge is a two-pane scroll:

| Left — Challenge | Right — Your Scroll |
| :--- | :--- |
| The problem description | A code box where you type your solution |
| Optional hint + topic chip | Placeholder: `# Type your solution here…` |

The scoreboard above shows your **score**, **progress** (e.g. 3 / 50), **Spirit Energy**, **session time**, and current **belt**.

### 3. Submit your answer

When you’re ready:

- **Ctrl+Enter** / **⌘+Enter**, or
- **Submit kata**, or
- the star **✦** button

Scoring is fuzzy (close matches still earn points). Answer under **30 seconds** for a small time bonus.

### 4. Hear the Sensei’s verdict

After each submit you get feedback:

- Correct → points (and maybe a time bonus)
- Wrong → you lose **1 Spirit Energy**

Continue to the next kata.

### 5. Climb the belts

Every **3 correct** answers promotes you:

| Belt | Level | Focus |
| :--- | :--- | :--- |
| **White** | 1 | Functions & basics |
| **Yellow** | 2 | Lists, strings, loops, conditionals |
| **Green** | 3 | Dicts, comprehensions, algorithms |

You’ll see a short promotion screen when you rank up.

### 6. Training complete

The run ends when:

- Spirit Energy hits **0**, or
- You finish all **50** katas

You’ll see final **score**, **time**, **accuracy**, and a **rank** title. Hit **Train again ✦** to return to the dojo.

**Fresh practice:** when a game ends (or you start a new run), katas reshuffle within each belt so you don’t memorize the order.

---

## Quick start (browser)

```bash
cd web
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173/**).

Production build:

```bash
cd web
npm run build
npm run preview
```

---

## Terminal version (optional)

Requires Python 3.10+ (macOS / Linux).

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Controls:** Enter = newline · Backspace = erase · Ctrl+D or Esc = submit

---

## Project layout

| Path | Role |
| :--- | :--- |
| `web/` | Browser app (Vite + React + TypeScript) |
| `web/public/questions.json` | Katas loaded by the web app |
| `web/public/assets/` | Splash art |
| `questions.json` | 50 katas across 3 belts (source of truth) |
| `main.py` / `game.py` / `ui.py` / `content.py` | Terminal game |
| `assets/` | Reference art |

> If you edit katas in the root `questions.json`, copy it to `web/public/questions.json` so the browser app stays in sync.

---

## Stack

- **Browser:** Vite, React, TypeScript — all logic client-side
- **Terminal:** Python + Rich
- **Content:** `questions.json` (50 Coding Dojo katas)
