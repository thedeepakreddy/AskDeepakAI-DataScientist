#  AskDeepakAI - Data Scientist Agent
> Interactive, telemetry-free Data Science Workstation & Automated Machine Learning modeling engine powered by Google Gemini.

---

##  Overview

**AskDeepakAI Data Scientist** is an end-to-end full-stack data intelligence platform and analytics workstation. It empowers engineers, analysts, and business decision-makers to transform raw datasets into clean, analyzed, modeled, and stakeholder-ready resources.

Unlike locked-down SaaS BI tools or heavy Python-only environments, this project couples an incredibly responsive **React (TypeScript + Vite)** visual workspace with a secure **Node.js (Express) backend engine** that proxies Gemini model pipelines without exposing API keys.

---

##  System Architecture Flow

The workstation follows a modern client-server architecture. Here's how raw input gets processed into modeled statistics and executive reports:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                             REACT FRONTEND                               │
│  - File UI Parsing      - Slicer Slices & Filter Controls                │
│  - interactive Tables   - ML Hyperparameters & Chart Overplots (Recharts)│
└─────────────────────┬───────────────────────────────▲────────────────────┘
                      │                               │
                      │ CSV payload / Config          │ AI summaries, EDA profiles
                      │                               │ model specs, Risk logs
                      ▼                               │
┌─────────────────────┴───────────────────────────────┴────────────────────┐
│                             EXPRESS BACKEND                              │
│  - Static Asset web hosting (CJS Bundled Server)                         │
│  - Gemini Orchestrator (GoogleGenAI SDK Integration)                     │
└─────────────────────────────────────┬────────────────────────────────────┘
                                      │  Secure requests (Secret API Key)
                                      ▼
                   ┌──────────────────────────────────────┐
                   │        GOOGLE GEMINI MODELS          │
                   │   - Scheme Reasoning  - Outlier Intel│
                   │   - Risk Register     - Strategic HUD│
                   └──────────────────────────────────────┘
```

---

##  Core Functional Modules

### 1. Ingest, Profile & Sanitize
*   **Zero-Telemetry Parsing**: Fluid CSV processor handles raw matrices completely in-browser—preventing sensitive client files from hitting remote storage.
*   **Type Discovery**: Auto-detects column profiles: numerical sequences, categoricals, date segments, and null concentrations.
*   **Quality Audit Controls**: Single-click actions for outliers trimming (using the 1.5 IQR method) and imputation.

### 2. Exploratory Data Analysis & Strategic EDA
*   **Semantic Data Profiling**: Leverages Google Gemini to interpret column name contexts, synthesize underlying business vectors, and deliver descriptive data commentary.
*   **Automated Hypotheses**: Brainstorms regression patterns and key classification opportunities natively customized to your dataset structure.

### 3. Predictive AutoML Pipelines
*   **Feature Architect**: Easily tag high-importance variables, set targets, or selectively drop noise vectors.
*   **Interactive Simulation Tree**: Custom hyperparameters let you tune tree structural constraints, estimators, learning rates, or testing ratios.
*   **Algorithmic Benchmarking**: Visually track metrics like R-squared ($R^2$), Mean Squared Error (MSE), Accuracy, Precision, F1-Score, and interactive residual charts mapped live with **Recharts** and **D3**.

### 4. Strategic Stakeholder HUD
*   **Multi-Metric Senders**: Fast segment slicer panels let you slice complex numerical properties instantly.
*   **Business Translation Layers**: Auto-generated business indicators, Risk Registers, tactical recommendations, and print-ready executive exports.

---

## 🔘 Interactive AssistiveTouch Bot & 3D Live Logo

The application features an interactive **AssistiveTouch Bot** with a continuous, crazy **3D rotating custom-layered logo** and orbiting holographic ring effect. It remains completely visible and interactive on all devices.

###  Key Enhancements
*   **Continuous 3D Live Logo Rotation**: The central AskDeepakAI logo continuously rotates in a true 3D perspective with reflective sheen sweeps, specular corner flares, and multi-layered depth translation.
*   **Double Layer Holographic Rings**: Embedded orbit rings spin in opposed directions around the logo continuously, providing a live futuristic "Quantum Star" aura.
*   **100% Ubiquitous Visibility Engine**: Incorporates a progressive viewport-clamping and boundary-snapping algorithm that automatically positions and snaps the bot to the nearest screen edge across all screen forms (desktops, laptops, iPhones, Androids, iPads, and deep relative iframe previews).
*   **Dynamic Drag & Snap**: Users can drag the bot freely. On drop, it snaps gracefully to the nearest side edge, keeping it reachable but out of content layouts.

###  Files to Commit/Upload to GitHub for the AssistiveTouch Module
To sync these Assistive Touch updates perfectly to your GitHub repository, ensure you upload the following files:
*   `src/components/AssistiveTouchBot.tsx` - Core component with layout triggers, drag physics, and the 3D-translated logo structure.
*   `src/index.css` - Animation keyframes (`live-3d-spin`, `live-ring-1`, `live-ring-2`, `live-ring-3`, `neon-breath-glowing`, etc.) and 3D space utility helpers (`preserve-3d`).
*   `package.json` - Outlines the dependencies.

###  Render, Vercel, and Dependency Configuration
The interactive AssistiveTouch Bot requires `lucide-react` and `motion`.
*   **Do I run `npm install lucide-react motion` on Render/Vercel?**
    No need to run manual commands in the deployment terminals! Simply make sure these packages are added to the `"dependencies"` mapping in your `package.json` file.
    When you deploy or trigger a rebuild on **Render** (via "Manual Deploy" -> "Clear Cache & Deploy") or **Vercel**, the cloud runtime automatically executes `npm install` and retrieves them based on your `package.json`.
*   Ensure your `package.json` has these entries (or verify they are listed):
    ```json
    "dependencies": {
      "lucide-react": "^0.x.x",
      "motion": "^11.x.x",
      ...
    }
    ```

---

##  Technology Stack

| Component | Technology | Version / Focus |
| :--- | :--- | :--- |
| **Frontend UI** | **React** | v19.0.x — Modern functional hooks with concurrent rendering |
| **Bundler / Build** | **Vite** | v6.x — Sub-millisecond dev starts with ES Module hot reloading |
| **Styles** | **Tailwind CSS** | v4.x — High-fidelity utility classes & themes |
| **Graphs & Charts** | **Recharts & D3** | Interactive scatter plots, trend lines, and distribution curves |
| **Server Engine** | **Node.js / Express** | Compact REST API wrapper and static web asset middleware |
| **AI Processing** | **Google GenAI SDK** | `@google/genai` v2.4.x — Gemini model API integrations |
| **Server Compiler** | **esbuild** | Ultra-fast JS/TS server compiler bundling to standalone CommonJS |

---

##  Local Development Setup

To test, debug, or run the application on your computer:

### Prerequisites
*   **Node.js**: `v18.x` through `v22.x` (or later) recommended
*   **Google Gemini API Key**: Obtain a developer key from [Google AI Studio](https://aistudio.google.com/)

### Command Line Instruction

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/thedeepakreddy/AskDeepakAI-DataScientist.git
    cd AskDeepakAI-DataScientist
    ```

2.  **Install Node packages**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in your project's root folder:
    ```bash
    touch .env
    ```
    Populate it with your Gemini API key:
    ```env
    GEMINI_API_KEY=your_actual_google_gemini_api_key_here
    NODE_ENV=development
    ```

4.  **Boot Development Servers**:
    ```bash
    npm run dev
    ```
    *   This boots up the integrated Node-Vite development runtime.
    *   Open your favorite browser and head to `http://localhost:3000`.

---

##  Deploying to Render.com (Production)

> **Architectural Note**: Python apps use Streamlit; full-stack TypeScript apps require standard virtual runtimes. Because **AskDeepakAI** is designed using TypeScript, Node, and React, **Render Web Services** is the perfect hosting environment.

### 1. Push your latest code modifications to GitHub
```bash
git add .
git commit -m "Deploy production update for AskDeepakAI"
git push origin main
```

### 2. Set up your Web Service on Render
1.  Log into your **[Render.com Dashboard](https://dashboard.render.com/)**.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository: `AskDeepakAI-DataScientist`.
4.  Configure the environment setup settings exactly like this:
    *   **Name**: `ask-deepak-ai-datascientist`
    *   **Runtime**: `Node`
    *   **Branch**: `main`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
    *   **Instance Type**: `Free` (or premium depending on requirements)

### 3. Inject Production Environmental Secret
Scroll down to **Environment Variables** inside the Render wizard and add this pair:
*   **Key**: `GEMINI_API_KEY`
*   **Value**: `[Paste your actual secret Google Gemini token here]`

Render will automatically pull the branch, compile your React application bundle, transpile the TypeScript server, and make it available at your public URL!

---

##  The Troubleshooting Vault

If you encounter errors during CI/CD builds or deployment, apply these standard resolutions:

###  Case-Sensitivity Import Failures
*   **Symptom**: Build logs show `Could not resolve "./components/ReportsHub" from "src/App.tsx"`, but compiling locally completes without throwing errors.
*   **The Cause**: Windows & macOS filesystems are case-insensitive. Linux servers (used on Render) are strictly case-sensitive. If you renamed a component (e.g., from lowercase `reportshub.tsx` to Pascal `ReportsHub.tsx`), Git may keep tracking the older casing inside Remote Indexes.
*   **The Fix**: Force Git to rebuild the project tracking maps. Run these three commands locally:
    ```bash
    git rm -r --cached .
    git add .
    git commit -m "Resolve lowercase casing tracking issues"
    git push origin main
    ```

###  Rollup: "failed to resolve import 'recharts' from '...' "
*   **Symptom**: Render build logs show `Rollup failed to resolve import "recharts"` and aborts.
*   **The Cause**: The lockfile configuration is out-of-sync or `package-lock.json` contains stale cached entry definitions from a previous install attempt during development.
*   **The Fix**: Clean reinstall and push. Run this locally inside your directory:
    ```bash
    # Remove files and cached lock files
    rm -rf node_modules package-lock.json
    
    # Generate fresh clean installation locking parameters
    npm install
    
    # Add, commit and sync
    git add package.json package-lock.json
    git commit -m "Synchronize dependencies and clean lockfile cache"
    git push origin main
    ```

###  Server Listening & Port Binding Failures
*   **Symptom**: Render logs say `Port 3000 is occupied` or shows deployment timeouts.
*   **The Cause**: Web host dynamically provisions active ports using `process.env.PORT`. Hardcoding port `3000` causes binds to fail.
*   **The Fix**: Our custom Express code utilizes the environment port variable automatically falls back to `3000` locally:
    ```typescript
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    ```

---

##  Git Directory Tracking Policy

To keep your code changes clean and ensure security, do not commit compiled modules or configuration secrets.

```text
AskDeepakAI-DataScientist/
├── .env                  <--  SECRETS (Never commit to Git!)
├── .env.example          <--  Example Template
├── .gitignore            <--  Ignores dist/ and node_modules/
├── package.json          <--  Packages & Exec scripts
├── server.ts             <--  Express NodeJS entrypoint
└── src/                  <--  UI Pages, Styles and Charts
```

---

*Engineered with precision. Powered by Google Gemini.*
