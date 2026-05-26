# AskDeepakAI - Data Analysis Workstation

An end-to-end telemetry-free, intelligence-driven data analysis and predictive machine learning workstation. Built with a modern full-stack architecture combining a robust React (TypeScript) frontend powered by Vite with an Express.js backend. The workstation supports exploratory data analysis (EDA), automated dataset profile parsing, custom interactive dashboards with multi-metric slicers, and algorithmic model evaluation pipelines.

---

## 🚀 Key Architectural Modules

1. **Ingestion & Parsing**: Fast CSV parser and data ingest validation.
2. **Quality Audit & Verification**: Robust outlier checks, missing row concentration profiles, and inline data cleaning capabilities.
3. **Exploratory Analysis (EDA)**: Dynamic overview profiles compiled via Google Gemini, providing targeted fields, strategical insights, and model recommendations.
4. **Predictive Analytics (ML Pipeline)**: Selectable target columns with custom feature checklists, model trees, regression indicators, hyperparameter controls, interactive feature importances, and scatter evaluation plots.
5. **Interactive Stakeholder HUD**: Multi-metric segmentation cards and responsive trend charts to slice and slide numerical coordinates.
6. **Governance Reports**: Comprehensive Risk Registers, actionable strategic boards, and print-ready executive exports.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (V4), Lucide React (Icons)
- **Data Visualizations**: Recharts, D3
- **Backend Service**: Node.js, Express, ESBuild compiler
- **AI Integration**: `@google/genai` (SDK) powered by Google Gemini

---

## ⚙️ Local Development Setup

To run this full-stack application locally on your computer, follow these simple terminal instructions:

### Prerequisites
- Install **Node.js** (Version 18 or above recommended)
- Acquire a **Google Gemini API Key** (from AI Studio)

### Steps
1. **Clone or Extract the Workspace**:
   ```bash
   git clone <your-github-repo-url>
   cd AskDeepakAI-DataScientist
   ```

2. **Install Code Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and append your Gemini key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Boot Up the Server (Development Mode)**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 📥 Git Directory Guideline (What to Commit)

To keep your repository lightweight and secure, commit only source-code configurations. Here is a guided checklist on what to keep and what to ignore in your repository:

### ✅ Files to COMMIT and Upload
- **`src/`** (All the visual code files, pages, and analytical hooks)
- **`server.ts`** (The Express Node server endpoint)
- **`package.json` & `package-lock.json`** (Package registry definitions)
- **`tsconfig.json` & `vite.config.ts`** (TypeScript and Bundler controls)
- **`index.html`** (The root HTML document)
- **`metadata.json`** (App platform settings)
- **`.env.example`** (Documented sample variables - *never* commit your actual secrets)
- **`.gitignore`** (Exclude compiler caches and dependencies)

### ❌ Folders or Secrets to NEVER Commit (Ignored automatically)
- `node_modules/` (Re-built on deployment; too heavy to commit)
- `dist/` (Compiled production files)
- `.env` (Your genuine private keys)

---

## 🌐 Production Host Deployment (How to Deploy)

> [!NOTE]
> **Why Streamlit isn't the correct choice:** 
> Streamlit is specifically designed to run native **Python** scripts (`app.py`). Because **AskDeepakAI** is engineered using a modern full-stack web structure (**TypeScript, Node.js, and React**), it cannot be hosted directly inside Streamlit. Instead, it must be hosted on high-performance general-purpose servers.

To deploy your full-stack workstation to the web, we highly recommend **Render** or **Railway**.

### Setup on Render (Step-by-Step)

1. **Upload your Code to GitHub**:
   - Create a new public or private repository on GitHub named `AskDeepakAI-DataScientist`.
   - Push your committed code to the `main` branch.

2. **Initialize Web Service on Render**:
   - Go to [Render.com](https://render.com) and sign in.
   - Click **New +** on your dashboard and select **Web Service**.
   - Connect your GitHub account and choose the `AskDeepakAI-DataScientist` repository.

3. **Configure Service Details**:
   - **Name**: `ask-deepak-ai-workstation` (or your preferred name)
   - **Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or higher depending on your traffic limits)

4. **Inject Environment Secrets**:
   - Scroll down to the **Environment Variables** panel in the wizard.
   - Add the following property:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: `[Your Actual Google Gemini Key]`
   - Render will store this safely inside their encryption vaults and keep it hidden from public files.

5. **Deploy**:
   - Click **Create Web Service**. Render will pull your repository, build your React artifacts into `dist/`, bundle your server into `dist/server.cjs`, and launch it on your public endpoint.

---

## 🩺 Resolving Casing/Import Errors (e.g., ReportsHub)

If your build on Render fails saying `Could not resolve "./components/ReportsHub" from "src/App.tsx"` but builds perfectly locally:

This is a **Git File Tracking Casing Bug**. 
- Windows and macOS filesystems are case-insensitive, while Linux (used on Render servers) is strictly **case-sensitive**.
- If a file's casing has been changed locally (e.g., from `reportshub.tsx` to `ReportsHub.tsx`), Git occasionally keeps tracking the old lowercase variant in the remote repository.
- To force Git to reset its index and align with your correct local casing, run these commands in your local computer's terminal:

```bash
# Clear Git's internal file cache
git rm -r --cached .

# Re-stage all files with current correct casings
git add .

# Commit and push back to GitHub
git commit -m "Fix case sensitivity discrepancy in component imports"
git push
```
*(Your Render build will automatically catch the push, rebuild with correct file trees, and go green!)*
