# Make Cuts Game

A professional, interactive two-player strategy game based on paper-cutting logic. Built with **React**, **Node.js**, and **Socket.io**, featuring a premium dark-themed UI with smooth animations.

---

## Live Demo

**Hosted Link:** [https://make-cuts-game.vercel.app](https://make-cuts-game.vercel.app)

**Repository:** [https://github.com/A-P-S-Bhaidav/Make-Cuts-Game](https://github.com/A-P-S-Bhaidav/Make-Cuts-Game)

---

## About the Game

Make Cuts is a combinatorial strategy game for two players. You and your opponent take turns cutting a rectangular sheet of paper (represented as a grid) along internal grid lines. Each cut must divide at least one connected region into two separate parts. The player who makes the final valid cut wins.

### Game Rules

1. **Grid Setup**: The game is played on an M x N grid of unit squares
2. **Turn-Based Play**: Players alternate turns, starting with Player 1
3. **Making Cuts**: On each turn, click an internal grid edge to make a cut. The cut extends across the full width/height of the region
4. **Valid Cuts Only**: Every cut must divide at least one region into two separate parts
5. **Winning**: The game ends when all regions are 1x1 blocks. The last player to make a valid cut wins (Normal Play Convention)
6. **Pre-Cuts**: Games can begin with pre-existing cuts for varied starting positions

### Strategy

The total number of moves in a game is always fixed at **(total cells - 1)**. The winner is determined by parity: if the number of remaining moves is odd, the current player wins. Understanding this principle is key to mastering the game.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 (Vite) | Component-based UI with hooks |
| Styling | Vanilla CSS | Custom properties, animations, glassmorphism |
| Routing | React Router v7 | Client-side SPA navigation |
| Backend | Node.js + Express | Game room API and server |
| Real-Time | Socket.io | Online multiplayer synchronization |
| Deployment | Vercel | Frontend hosting with SPA rewrites |

---

## Project Structure

```
Make-Cuts-Game/
  client/                           # React frontend (Vite)
    public/
      favicon.svg                   # SVG favicon
    src/
      components/
        Board/
          Board.jsx                 # Interactive game board with edges
          Board.css                 # Board, cell, edge, animation styles
        Game/
          Game.jsx                  # Game page layout (board + info)
          Game.css                  # Game page and empty-state styles
        GameInfo/
          GameInfo.jsx              # Side panel with stats and history
          GameInfo.css              # Player cards, move log styles
        GameOver/
          GameOver.jsx              # Win modal with confetti
          GameOver.css              # Modal overlay and celebration styles
        GameSetup/
          GameSetup.jsx             # Configuration page
          GameSetup.css             # Setup card and control styles
        Landing/
          Hero.jsx                  # Landing page hero section
          Hero.css                  # Hero animations and features
        Layout/
          Header.jsx                # Navigation header
          Header.css                # Sticky glassmorphism header
        Rules/
          Rules.jsx                 # Interactive rules page
          Rules.css                 # Rules sections and examples
      hooks/
        useGame.js                  # Game state management hook
        useSocket.js                # Socket.io client hook
      utils/
        gameLogic.js                # Core game engine (pure functions)
        regionColors.js             # Region color assignment
      App.jsx                       # Root component with routing
      main.jsx                      # React entry point
      index.css                     # Design system and global styles
    index.html                      # HTML entry with SEO meta tags
    vite.config.js                  # Vite build configuration
    package.json
  server/                           # Express + Socket.io backend
    index.js                        # Server entry point
    gameManager.js                  # Game room event handling
    roomStore.js                    # In-memory room storage
    package.json
  .gitignore
  vercel.json                       # Vercel build + SPA rewrite config
  README.md
```

---

## Architecture

### Frontend Architecture

The React frontend follows a component-driven architecture with clear separation of concerns:

- **Pure Game Logic** (`utils/gameLogic.js`): Stateless functions for state creation, region detection (BFS), cut validation, cut extension, and win detection
- **State Management** (`hooks/useGame.js`): Custom hook wrapping game logic with React state and animation control
- **Presentational Components**: Board, GameInfo, GameOver, etc. receive data via props
- **CSS Design System** (`index.css`): 60+ CSS custom properties defining colors, typography, spacing, and animations

### Game Engine

The game engine (`gameLogic.js`) implements:

1. **Region Detection**: BFS/flood-fill algorithm finds connected components of cells through uncut edges
2. **Cut Extension**: When a player clicks an edge, the cut automatically extends across the full region width/height
3. **Validation**: Checks that a cut would actually divide a region before applying it
4. **Win Detection**: Game ends when all regions are 1x1 (every cell is isolated)

### Backend Architecture

The Express server provides:

- **Room Management**: Create/join rooms with 6-character codes
- **Move Validation**: Server-side verification of game moves
- **Real-Time Sync**: Socket.io broadcasts game state changes to both players
- **Auto-Cleanup**: Stale rooms are automatically removed after inactivity


## Design Decisions

- **Vanilla CSS over frameworks**: Full control over animations and design tokens without framework overhead. CSS custom properties enable a cohesive design system
- **Pure function game engine**: All game logic is stateless and testable. The engine computes state transitions without side effects
- **BFS for region detection**: Efficient connected-component analysis on the grid graph to determine valid cuts
- **Cut extension mechanic**: Clicking a single edge extends the cut across the entire region for intuitive paper-cutting behavior
- **CSS-only animations**: All visual effects (cut slash, confetti, glow pulses) are pure CSS for optimal performance
- **Glassmorphism UI**: Backdrop-filter blur with semi-transparent surfaces creates depth and visual hierarchy

