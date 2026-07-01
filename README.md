# 🏆 FIFA World Cup 2026 - Interactive Knockout Bracket

A breathtaking, fully interactive, and radial knockout phase bracket built specifically for the **FIFA World Cup 2026**. This project revolutionizes the traditional tournament tree by arranging the 32-team knockout stage in a stunning circular UI, complete with smooth animations, real-time data fetching, and an intelligent simulation engine.

## ✨ Features

- **🔄 Radial Bracket UI:** A unique, space-efficient circular layout built with Vanilla JS mathematics and SVG path rendering.
- **📡 Real-Time Data:** Automatically fetches live scores and match statuses through a custom Vercel serverless function (`/api/matches.js`) to bypass CORS restrictions safely without exposing API keys.
- **🎲 Smart Simulation Engine:** A built-in simulator that predicts match outcomes based on realistic team strengths (ratings). Not only does it pick winners, but it also generates realistic football scores (e.g., 2-1, 3-0, or even penalty shootouts like 1-1 p(5-4)).
- **🚀 Stunning Animations:** Click any team or run the simulation to watch the flags literally "fly" across the screen, advancing to the next round with smooth CSS transitions.
- **📱 Fully Responsive:** Carefully crafted to look gorgeous on both ultra-wide desktops and mobile screens.
- **📊 Live Match Panel:** Hover over or click on any node to reveal a dynamic side panel showing real-time match details and scores.

## 🛠️ Technology Stack

- **Frontend:** Vanilla HTML5, CSS3, and JavaScript (ES6+). Zero heavy frameworks, ensuring blazing-fast performance.
- **Backend / Proxy:** Vercel Serverless Functions (`Node.js`) to securely proxy external sports API requests.
- **Assets:** SVG flags and dynamically generated node components.

## 🚀 Getting Started

### Prerequisites
Since this project uses a Vercel serverless function for API calls, running it requires a local server environment (do not open the `index.html` file directly via `file:///`).

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/v-vabyo/WorldCup2026Bracket.git
   cd WorldCup2026Bracket
   ```

2. To run locally, you can use any simple HTTP server (like VS Code Live Server, or Python's HTTP module):
   ```bash
   npx serve .
   ```
   *Note: If you want to test the real-time API locally, you will need to set up Vercel CLI (`vercel dev`) and provide your API key in the `.env` file.*

## 📂 Project Structure

- `index.html`: The main entry point containing the UI skeleton.
- `styles.css`: All the styling, variables, custom responsive breakpoints, and animation definitions.
- `app2.js`: The core engine driving the application. It handles the math for the radial UI, state management, UI rendering, animations, and the simulation logic.
- `data.js`: Contains static team data, custom power ratings for the simulation engine, and the initial tournament bracket structures.
- `/api/matches.js`: Vercel serverless function acting as a secure proxy to fetch live match data.

## 💡 How the Simulation Works

When you click the **"🎲 Simulate"** button, the app unleashes a built-in algorithmic engine:
1. It compares the custom `rating` (0-100) of two opposing teams.
2. It calculates a win probability (capped at 15%-85% to ensure upsets are always possible, reflecting real football unpredictability).
3. It generates a realistic football scoreline. If the RNG decides it's a tight match, it forces a draw and simulates a penalty shootout.
4. The system then sequentially clicks through the bracket automatically, letting you enjoy the visual spectacle of flags flying to the Final.

## 🎨 Design

The aesthetic is inspired by premium sports broadcasts. It utilizes a dark mode color palette (`#0f172a`, `#1e293b`) with gold accents (`#fbbf24`) to give a modern, authoritative, and cinematic feel fitting for the World Cup.

---
*Created with passion by [@v.vabyo](https://instagram.com/v.vabyo).*
