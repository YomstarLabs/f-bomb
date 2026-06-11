# F-Bomb: Formula Bomb

A browser-based maths platform game built with Vite, React, TypeScript and Phaser.

## What is included

- Main menu, level map, parent settings and reward screen
- A 100-level block-themed platform progression with longer generated routes
- Dropping bombs, snake patrols, moving platforms, switches and timed blocks
- Keyboard movement with Phaser Arcade Physics
- Formula Bomb maths gates driven by React modals
- Supportive hints for wrong answers
- Parent maths skill presets with manual difficulty controls
- Local progress and settings saved with `localStorage`
- Static production build for online hosting

## Run locally

```bash
npm install
npm run dev
```

## Build for hosting

```bash
npm run build
```

The deployable files are generated in `dist/`. They can be hosted by static web hosts such as Vercel, Netlify, GitHub Pages or any server that can serve static files.
