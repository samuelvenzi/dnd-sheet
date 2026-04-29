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

## Live App

A deployed version is available at **[samuelvenzi.github.io/dnd-sheet](https://samuelvenzi.github.io/dnd-sheet)** — no installation required. It runs entirely in the browser and stores nothing on any server.

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

## Creating Your Character JSON

Character data lives in a `.json` file that you import into the app via the **Import** button. You can build one manually using [`example_character.json`](example_character.json) as a reference, or use an AI assistant to generate it for you (recommended).

### Schema notes

- **Do not include** computed values: spell save DC, spell attack bonus, ability modifiers, proficiency bonus, or passive perception — the app derives these automatically from your raw stats.
- The one intentional override is `combat.initOverride`: set it to a number to override the DEX-based initiative, or leave it `null` to use the default.
- Every skill must be present with `{ "proficient": false, "expertise": false }` even if unused.
- Spell entries should include all fields: `name`, `school`, `castingTime`, `range`, `duration`, `components` (`{ "V": bool, "S": bool, "M": bool }`), `concentration`, `ritual`, `prepared`, `description`.
- `race` and `background` must exactly match the dropdown values in the app (see the lists in `dnd_sheet.tsx` or copy from the example).

### Generating with AI

The fastest way to create a complete, accurate character sheet is to send the following prompt to an AI assistant (Claude, ChatGPT, etc.) along with the contents of [`example_character.json`](example_character.json).

---

**Prompt template** — copy, fill in the `[PLACEHOLDERS]`, and send together with the full text of `example_character.json`:

```
I need you to generate a D&D 5e character sheet as a JSON file, following exactly the same schema as the example I'm providing below.

My character:
- Name: [CHARACTER NAME]
- Race: [RACE — e.g. "Elf (Wood)", "Dwarf (Hill)", "Human (Variant)"]
- Class: [CLASS — e.g. Bard, Ranger, Wizard]
- Subclass: [SUBCLASS — e.g. College of Valor, Hunter, School of Evocation]
- Level: [LEVEL]
- Background: [BACKGROUND — e.g. Outlander, Sage, Criminal]
- Alignment: [ALIGNMENT — e.g. Chaotic Good, Lawful Neutral]

Ability scores (or describe the character and let the AI assign them):
STR [N], DEX [N], CON [N], INT [N], WIS [N], CHA [N]

Additional notes about the character (backstory, personality, equipment, spells known, campaign context, etc.):
[FREE TEXT — the more detail you provide, the richer the output]

Instructions for the AI:
1. Use the example JSON schema exactly. Do not add or rename any keys.
2. Do NOT include saveDC, attackBonus, ability modifiers, proficiency bonus, or passive perception — these are computed by the app.
3. Fill in ALL spells known for this class and level with accurate 5e data from the Player's Handbook: school, casting time, range, duration, components (V/S/M), concentration, ritual flag, and a concise description of what the spell does.
4. Fill in ALL class features, racial traits, background features, and feats for this level with accurate descriptions from the 5e rules.
5. Fill in saving throw proficiencies and skill proficiencies correctly for the class and background.
6. Set spell slots according to the official 5e progression table for this class and level.
7. Populate equipment with reasonable starting or campaign-appropriate gear including weight and value where known.
8. Write a compelling backstory, personality traits, ideals, bonds, and flaws consistent with the background and any notes provided.
9. Use exact race and background strings from this list for the "race" field:
   Dragonborn, Dwarf (Hill), Dwarf (Mountain), Elf (High), Elf (Wood), Elf (Dark/Drow),
   Gnome (Forest), Gnome (Rock), Half-Elf, Half-Orc, Halfling (Lightfoot), Halfling (Stout),
   Human (Standard), Human (Variant), Tiefling
   And for "background": Acolyte, Charlatan, Criminal, Entertainer, Folk Hero, Guild Artisan,
   Hermit, Noble, Outlander, Sage, Sailor, Soldier, Urchin
10. Output only the raw JSON — no explanation, no markdown fences.

Example schema (follow this exactly):
[PASTE THE FULL CONTENTS OF example_character.json HERE]
```

---

The AI will return a ready-to-import JSON. Save it as `my_character.json` and use the **Import** button in the app.

## Tech Stack

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Lucide React](https://lucide.dev/) — icons
