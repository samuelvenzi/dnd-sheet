# D&D Character Sheet

> **Disclaimer:** This is an unofficial fan tool, not affiliated with, endorsed by, or connected to Wizards of the Coast. Dungeons & Dragons is a trademark of Wizards of the Coast LLC. This project is provided free of charge under Wizards of the Coast's [Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy).

A digital D&D 5e character sheet built with React, TypeScript, and Vite.

## Features

- **Core** — ability scores, saving throws, skills (with proficiency & expertise), inspiration, passive perception
- **Combat** — AC, initiative, speed, HP tracking (heal/damage modal), temp HP, hit dice, death saves, conditions, attacks & spellcasting, features & traits
- **Spells** — spell slots with pip tracker, spells organized by level (cantrips through 9th), school, components, concentration, ritual, prepared state
- **Equipment** — currency (CP/SP/EP/GP/PP), inventory with weight tracking and encumbrance
- **Notes** — appearance, backstory, allies, treasure, additional notes, personality traits, ideals, bonds, flaws, proficiencies & languages
- Light/dark theme toggle
- Export/import character as JSON

## Requirements

- Node.js 18+

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Tech Stack

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Lucide React](https://lucide.dev/) — icons
