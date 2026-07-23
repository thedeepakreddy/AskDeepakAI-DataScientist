const fs = require('fs');

let content = fs.readFileSync('src/components/StakeholderDashboard.tsx', 'utf8');

const extractSection = (content, startTag, endTag) => {
    let startIdx = content.indexOf(startTag);
    let endIdx = content.indexOf(endTag, startIdx);
    if(startIdx === -1 || endIdx === -1) {
        console.log("NOT FOUND:", startTag, "or", endTag);
        return { extracted: '', remaining: content };
    }
    const extracted = content.substring(startIdx, endIdx);
    content = content.substring(0, startIdx) + content.substring(endIdx);
    return { extracted, remaining: content };
};

let mapSection, filterSection, kpiSection, chartA, chartB, chartC;

// Map section (1)
let mapRes = extractSection(content, '      {/* 1. TOP DOCK: HEADER & INTERACTIVE MAP VIEWPORT */}', '      {/* 2. ADVANCED CONTROL DECK: MULTI-SLICERS & METRICS SLIDES */}');
mapSection = mapRes.extracted;
content = mapRes.remaining;

// Filter section (2)
let filterRes = extractSection(content, '      {/* 2. ADVANCED CONTROL DECK: MULTI-SLICERS & METRICS SLIDES */}', '      {/* 3. PERFORMANCE & VALUE COHORT KPI CARDS */}');
filterSection = filterRes.extracted;
content = filterRes.remaining;

// KPI section (3)
let kpiRes = extractSection(content, '      {/* 3. PERFORMANCE & VALUE COHORT KPI CARDS */}', '      {/* 4. VISUALS BENTO WORKSPACE */}');
kpiSection = kpiRes.extracted;
content = kpiRes.remaining;

// Inside Visuals
let chartARes = extractSection(content, '        {/* CHART A: DEMOGRAPHICS SEGMENTATION ANALYSIS */}', '        {/* CHART B: CROSS-METRICS COVARIATE SCATTER MODEL RELATIONSHIP */}');
chartA = chartARes.extracted;
content = chartARes.remaining;

let chartBRes = extractSection(content, '        {/* CHART B: CROSS-METRICS COVARIATE SCATTER MODEL RELATIONSHIP */}', '        {/* CHART C: LONGITUDINAL TREND PROGRESSION WITH BRUSH */}');
chartB = chartBRes.extracted;
content = chartBRes.remaining;

let chartCRes = extractSection(content, '        {/* CHART C: LONGITUDINAL TREND PROGRESSION WITH BRUSH */}', '      </div>\n\n    </div>');
chartC = chartCRes.extracted;
content = chartCRes.remaining;

// Now rebuild content
let visualTitleStart = content.indexOf('      {/* 4. VISUALS BENTO WORKSPACE */}');
let visualDivEnd = content.indexOf('      </div>\n\n    </div>', visualTitleStart);
let finalBeforeVisuals = content.substring(0, visualTitleStart);
let finalAfterVisuals = content.substring(visualDivEnd);

let newSections = kpiSection + filterSection + mapSection;

let newVisuals = `      {/* 4. VISUALS BENTO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 relative z-10" id="dashboard_visuals_grid">\n        \n` + chartB + chartC + chartA;

let finalContent = finalBeforeVisuals + newSections + newVisuals + finalAfterVisuals;

fs.writeFileSync('src/components/StakeholderDashboard.tsx', finalContent);

console.log("DONE");
