const fs = require('fs');

let reportsContent = fs.readFileSync('src/components/ReportsHub.tsx', 'utf8');

// 1. Extract the sandbox state variables from ReportsHub.
const stateVarsStart = reportsContent.indexOf('const [copied, setCopied] = useState(false);');
const stateVarsEnd = reportsContent.indexOf('const generatePythonWorkflow = (): string => {', stateVarsStart);
let extractedState = reportsContent.substring(stateVarsStart, stateVarsEnd);
reportsContent = reportsContent.substring(0, stateVarsStart) + reportsContent.substring(stateVarsEnd);

// 2. Extract generatePythonWorkflow function.
const pythonGenStart = reportsContent.indexOf('const generatePythonWorkflow = (): string => {');
const handlersStart = reportsContent.indexOf('const handleCopyCode = () => {', pythonGenStart);
let pythonGen = reportsContent.substring(pythonGenStart, handlersStart);
reportsContent = reportsContent.substring(0, pythonGenStart) + reportsContent.substring(handlersStart);

// 3. Extract the handlers.
const handlersEndBlock = reportsContent.indexOf('const handleDownloadJupyter = () => {', handlersStart);
// just take handleCopyCode and handleDownloadPython
let extractedHandlers = reportsContent.substring(handlersStart, handlersEndBlock);
reportsContent = reportsContent.substring(0, handlersStart) + reportsContent.substring(handlersEndBlock);

// 4. Extract the Local dev JSX
const localDevStart = reportsContent.indexOf('      {/* ================= PYTHON LAB & EXPORTER WORKSPACE ================= */}');
const localDevEnd = reportsContent.indexOf('      {/* OPERATIONAL LOGS / TERMINAL */}', localDevStart);
let extractedLocalDevJSX = reportsContent.substring(localDevStart, localDevEnd);
reportsContent = reportsContent.substring(0, localDevStart) + reportsContent.substring(localDevEnd);

// Also remove `Code` and `Download` from ReportsHub imports if they are unused, but for safety we'll just add them to StakeholderDashboard.

// Write back ReportsHub
fs.writeFileSync('src/components/ReportsHub.tsx', reportsContent);


// // ===================== STAKEHOLDER =====================
let dashContent = fs.readFileSync('src/components/StakeholderDashboard.tsx', 'utf8');

// 1. Add state vars and functions to StakeholderDashboard
// finding where to insert: Right before `const [enrichedRows, setEnrichedRows]`
const insertStateLoc = dashContent.indexOf('  const [enrichedRows, setEnrichedRows] = useState');
const stateBlock = extractedState + '\n' + pythonGen + '\n' + extractedHandlers + '\n';
dashContent = dashContent.substring(0, insertStateLoc) + stateBlock + dashContent.substring(insertStateLoc);

// 2. Provide props default if needed. Wait, we changed props to include mlResult and aiAnalysis. They are currently not destructured. 
// need to add `mlResult`, `aiAnalysis` into destruction.
dashContent = dashContent.replace('export default function StakeholderDashboard({ dataset, strategicSlicer }: StakeholderDashboardProps) {', 'export default function StakeholderDashboard({ dataset, strategicSlicer, mlResult, aiAnalysis }: StakeholderDashboardProps) {');

// 3. Add necessary lucide imports: Code, Download, Play, Check, Copy, BrainCircuit 
const lucideImportsLoc = dashContent.indexOf("} from 'lucide-react';");
const neededIcons = '  Code,\n  Download,\n  Play,\n  Copy,\n  Check,';
dashContent = dashContent.substring(0, lucideImportsLoc) + neededIcons + '\n' + dashContent.substring(lucideImportsLoc);

// 4. Insert JSX at the end, right before the last closing `</div>`
const lastDivIdx = dashContent.lastIndexOf('    </div>\n  );\n}');
dashContent = dashContent.substring(0, lastDivIdx) + extractedLocalDevJSX + '\n' + dashContent.substring(lastDivIdx);

fs.writeFileSync('src/components/StakeholderDashboard.tsx', dashContent);

console.log("DONE script");
