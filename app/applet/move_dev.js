import fs from 'fs';

let reportsContent = fs.readFileSync('src/components/ReportsHub.tsx', 'utf8');

// 1. Extract the sandbox state variables from ReportsHub.
const stateVarsStart = reportsContent.indexOf('  const [copied, setCopied] = useState(false);');
const stateVarsEnd = reportsContent.indexOf('  const generatePythonWorkflow', stateVarsStart);
let extractedState = reportsContent.substring(stateVarsStart, stateVarsEnd);
reportsContent = reportsContent.substring(0, stateVarsStart) + reportsContent.substring(stateVarsEnd);

// 2. Extract generatePythonWorkflow function.
const pythonGenStart = reportsContent.indexOf('  const generatePythonWorkflow');
const handlersStart = reportsContent.indexOf('  const handleCopyCode = () => {', pythonGenStart);
let pythonGen = reportsContent.substring(pythonGenStart, handlersStart);
reportsContent = reportsContent.substring(0, pythonGenStart) + reportsContent.substring(handlersStart);

// 3. Extract the handlers.
const handlersEndBlock = reportsContent.indexOf('  const handleDownloadJupyter = () => {', handlersStart);
let extractedHandlers = reportsContent.substring(handlersStart, handlersEndBlock);
reportsContent = reportsContent.substring(0, handlersStart) + reportsContent.substring(handlersEndBlock);

// 4. Extract the Local dev JSX
const localDevStart = reportsContent.indexOf('      {/* ================= PYTHON LAB & EXPORTER WORKSPACE ================= */}');
const localDevEnd = reportsContent.indexOf('      {/* OPERATIONAL LOGS / TERMINAL */}', localDevStart);
let extractedLocalDevJSX = reportsContent.substring(localDevStart, localDevEnd);
reportsContent = reportsContent.substring(0, localDevStart) + reportsContent.substring(localDevEnd);

fs.writeFileSync('src/components/ReportsHub.tsx', reportsContent);

// ===================== STAKEHOLDER =====================
let dashContent = fs.readFileSync('src/components/StakeholderDashboard.tsx', 'utf8');

const insertStateLoc = dashContent.indexOf('  const [enrichedRows, setEnrichedRows] = useState');
const stateBlock = extractedState + '\n' + pythonGen + '\n' + extractedHandlers + '\n';
dashContent = dashContent.substring(0, insertStateLoc) + stateBlock + dashContent.substring(insertStateLoc);

dashContent = dashContent.replace('export default function StakeholderDashboard({ dataset, strategicSlicer }: StakeholderDashboardProps) {', 'export default function StakeholderDashboard({ dataset, strategicSlicer, mlResult, aiAnalysis }: StakeholderDashboardProps) {');
dashContent = dashContent.replace('export default function StakeholderDashboard({ dataset, strategicSlicer, mlResult, aiAnalysis }: StakeholderDashboardProps) {', 'export default function StakeholderDashboard({ dataset, strategicSlicer, mlResult, aiAnalysis }: StakeholderDashboardProps) {'); // ensure not duplicated if ran twice

const lucideImportsLoc = dashContent.indexOf("} from 'lucide-react';");
if (!dashContent.includes('Code,')) {
  const neededIcons = '  Code,\n  Download,\n  Play,\n  Copy,\n  BrainCircuit,\n';
  dashContent = dashContent.substring(0, lucideImportsLoc) + neededIcons + dashContent.substring(lucideImportsLoc);
}

const lastDivIdx = dashContent.lastIndexOf('    </div>\n  );\n}');
dashContent = dashContent.substring(0, lastDivIdx) + extractedLocalDevJSX + '\n' + dashContent.substring(lastDivIdx);

fs.writeFileSync('src/components/StakeholderDashboard.tsx', dashContent);

console.log("DONE");
