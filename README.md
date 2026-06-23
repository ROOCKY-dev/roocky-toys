# 🎮 ROOCKY TOYS

A collection of mini games, tools, and creative experiments by [ROOCKY.DEV](https://roocky.dev).

**Live at:** [toys.roocky.dev](https://toys.roocky.dev)

## 🧩 Toys

| Toy | Category | Description |
|-----|----------|-------------|
| 🧠 **Quiz Master** | Game | Test your knowledge across Tech, Science, Pop Culture, Gaming & General Knowledge. Features difficulty modes, streak bonuses, timer, sound effects, and a leaderboard. |

## 🏗️ Architecture

Each toy is a **self-contained HTML file** — no build step, no framework, no dependencies. They run standalone and are embedded via iframe in the gallery hub.

```
├── index.html                    # Gallery hub (toys.roocky.dev)
└── toys/
    └── quiz-master/
        └── index.html            # Quiz Master game
```

## ➕ Adding a New Toy

1. Create a folder under `toys/your-toy-name/`
2. Add an `index.html` that works standalone
3. Register it in `index.html`'s `TOYS` array:

```javascript
{
  id: 'your-toy',
  name: 'Your Toy Name',
  description: 'What it does.',
  emoji: '🎲',
  category: 'game',        // game | tool | experiment
  tags: ['game', 'new'],
  date: '2026-06-23',
  path: 'toys/your-toy/index.html',
  color: '#a78bfa',
}
```

## 🎨 Design System

Matches [roocky.dev](https://roocky.dev):
- **Dark theme** — `#050508` base
- **Violet accent** — `#a78bfa` / `#818cf8`
- **Glass morphism** — `backdrop-filter: blur(20px)`
- **Typography** — Inter + JetBrains Mono
- **Grain overlay** + mouse-following glow

## 📋 License

© 2026 ROOCKY.DEV — All rights reserved.
