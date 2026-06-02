import React, { useEffect, useRef, useState } from 'react';

interface Signal {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
  size: number;
}

interface CircuitTrace {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

// Universal robust rounded rect drawing helper that runs on 100% of browsers
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Smooth ease-in-out cubic progression mapping helper
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function NeuralBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWindowSize({
          width: containerRef.current.clientWidth || window.innerWidth,
          height: containerRef.current.clientHeight || window.innerHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set precise high-DPI scaling relative to exact viewport dimensions
    const dpr = window.devicePixelRatio || 1;
    canvas.width = windowSize.width * dpr;
    canvas.height = windowSize.height * dpr;
    ctx.scale(dpr, dpr);

    // Position of the background logo chip:
    // It should sit always centered in the viewport
    const cx = windowSize.width / 2;
    const cy = windowSize.height / 2;

    // Perfect adaptive dimensions depending on screen width/height for all screen sizes
    let scaleFactor = 1.0;
    if (windowSize.width < 480) {
      scaleFactor = 0.65; // perfect mini logo for small mobile screens
    } else if (windowSize.width < 768) {
      scaleFactor = 0.80; // perfect compact logo for standard mobile
    } else if (windowSize.width < 1200) {
      scaleFactor = 0.95; // tablet or laptop
    } else {
      scaleFactor = 1.15; // wide desktop screens
    }

    // Apply the responsive scale factor to coordinates
    const chipWidth = 64 * scaleFactor;
    const chipHeight = 90 * scaleFactor;

    // Generate beautiful clean radial circuit traces coming from all sides of the screen to the center-left chip (0 traceCount to remove background incoming flows as requested)
    const traces: CircuitTrace[] = [];
    const colors = ['#3bc8c8', '#1b5bd2', '#ef7222', '#dfa435', '#b22038'];
    const traceCount = 0;

    const maxScreenRadius = Math.max(windowSize.width, windowSize.height) * 0.85;

    for (let i = 0; i < traceCount; i++) {
      const angle = (i / traceCount) * Math.PI * 2;
      
      // Start near screen edge boundaries
      const startRadius = maxScreenRadius * (0.5 + Math.random() * 0.5);
      const startX = cx + Math.cos(angle) * startRadius;
      const startY = cy + Math.sin(angle) * startRadius;

      // Joint break mid-point for Manhattan style modern circuitry (creates a clean modern tech feel)
      const jointRadius = (120 + Math.random() * 180) * scaleFactor;
      const jointAngle = angle + (Math.random() > 0.5 ? 0.3 : -0.3);
      const jointX = cx + Math.cos(jointAngle) * jointRadius;
      const jointY = cy + Math.sin(jointAngle) * jointRadius;

      // Snaps straight onto the connector pins of the central horizontal capsule chip
      const endRadius = chipHeight * 0.45;
      const endX = cx + Math.cos(angle) * endRadius;
      const endY = cy + Math.sin(angle) * endRadius;

      traces.push({
        points: [
          { x: startX, y: startY },
          { x: jointX, y: jointY },
          { x: endX, y: endY }
        ],
        color: colors[i % colors.length],
        width: 0.55 + Math.random() * 0.5
      });
    }

    // Active bioluminescent electrical pulses flowing down into the center
    let signals: Signal[] = [];

    const spawnSignal = () => {
      if (traces.length === 0) return;
      const trace = traces[Math.floor(Math.random() * traces.length)];
      signals.push({
        startX: trace.points[0].x,
        startY: trace.points[0].y,
        currentX: trace.points[0].x,
        currentY: trace.points[0].y,
        progress: 0,
        speed: 0.003 + Math.random() * 0.007,
        color: trace.color,
        size: 1.4 + Math.random() * 1.5
      });
    };

    // Populate initial signal coordinates instantly
    for (let s = 0; s < 25; s++) {
      spawnSignal();
      if (signals.length > 0) {
        signals[signals.length - 1].progress = Math.random();
      }
    }

    let animationFrameId: number;
    let frameCount = 0;
    let chipEnergy = 0.5; // Pulsing scale representing total aggregated data life charge

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, windowSize.width, windowSize.height);

      // Periodically trigger incoming data pulses to flow into center chip
      if (frameCount % 7 === 0) {
        spawnSignal();
      }

      // 1. Draw Organic Soft Atmospheric Glowing Fog in the center background
      const breathMultiplier = Math.sin(frameCount * 0.02) * 15 * scaleFactor;
      const maxGlowRadius = (160 + (chipEnergy * 35)) * scaleFactor;

      const radialGrad = ctx.createRadialGradient(cx, cy, 8 * scaleFactor, cx, cy, maxGlowRadius);
      radialGrad.addColorStop(0, 'rgba(59, 200, 200, 0.09)');
      radialGrad.addColorStop(0.35, 'rgba(27, 91, 210, 0.05)');
      radialGrad.addColorStop(0.7, 'rgba(239, 114, 34, 0.015)');
      radialGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw static circuit system trails
      traces.forEach((trace) => {
        ctx.beginPath();
        ctx.strokeStyle = `${trace.color}15`; // Soft low-contrast background look
        ctx.lineWidth = trace.width;
        ctx.moveTo(trace.points[0].x, trace.points[0].y);
        ctx.lineTo(trace.points[1].x, trace.points[1].y);
        ctx.lineTo(trace.points[2].x, trace.points[2].y);
        ctx.stroke();

        // Little junction endpoints circles at edge boundaries
        ctx.fillStyle = `${trace.color}14`;
        ctx.beginPath();
        ctx.arc(trace.points[0].x, trace.points[0].y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Update & render converging electrical data flows
      signals.forEach((sig, index) => {
        sig.progress += sig.speed;

        // Retrieve matched trace for joint navigation calculation
        const trace = traces.find(t => t.points[0].x === sig.startX && t.points[0].y === sig.startY);
        if (!trace || sig.progress >= 1.0) {
          // Reached center coprocessor! Spark core level life flashing index
          chipEnergy = Math.min(1.3, chipEnergy + 0.025);
          signals.splice(index, 1);
          return;
        }

        let px = 0;
        let py = 0;

        // Calculate Manhattan piecewise joint segment coordinates
        if (sig.progress < 0.5) {
          const ratio = sig.progress / 0.5;
          px = trace.points[0].x + (trace.points[1].x - trace.points[0].x) * ratio;
          py = trace.points[0].y + (trace.points[1].y - trace.points[0].y) * ratio;
        } else {
          const ratio = (sig.progress - 0.5) / 0.5;
          px = trace.points[1].x + (trace.points[2].x - trace.points[1].x) * ratio;
          py = trace.points[1].y + (trace.points[2].y - trace.points[1].y) * ratio;
        }

        sig.currentX = px;
        sig.currentY = py;

        // Drawing beautiful flowing particle neon point
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = sig.color;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, sig.size, 0, Math.PI * 2);
        ctx.fill();

        // High gloss halo path surrounding particle
        ctx.strokeStyle = `${sig.color}30`;
        ctx.lineWidth = sig.size * 0.8;
        ctx.beginPath();
        ctx.arc(px, py, sig.size + 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Slowly bleed off accumulated charging life electricity over time to keep a perpetual state of dynamic charging
      if (chipEnergy > 0.4) {
        chipEnergy -= 0.005;
      }

      // 4. DRAW GORGEOUS ANIMATED CAPSULES INSIDE MEMORY (reproducing the video reference)
      const pillW = 120 * scaleFactor;
      const pillH = 30 * scaleFactor;
      const pillGap = 10 * scaleFactor;

      const loopDuration = 600; // 10 seconds at 60fps
      const progress = (frameCount % loopDuration) / loopDuration;

      // Split into 4 clean sequence states mimicking the video
      let stage = 0; 
      let stageProgress = 0;

      if (progress < 0.2) {
        // Stage 0: Gentle breathing/hover in rest position (0% - 20%)
        stage = 0;
        stageProgress = progress / 0.2;
      } else if (progress < 0.5) {
        // Stage 1: Dynamic sliding / split & morph (20% - 50%)
        stage = 1;
        stageProgress = (progress - 0.2) / 0.3;
      } else if (progress < 0.75) {
        // Stage 2: Wave side transition (50% - 75%)
        stage = 2;
        stageProgress = (progress - 0.5) / 0.25;
      } else {
        // Stage 3: Return to rest position (75% - 100%)
        stage = 3;
        stageProgress = (progress - 0.75) / 0.25;
      }

      const eased = easeInOutCubic(stageProgress);
      const hoverOffset = Math.sin(frameCount * 0.03) * 3 * scaleFactor;

      // Define default pill values (centered rest positions)
      const topY = cy - pillH - pillGap + hoverOffset;
      const midY = cy + hoverOffset;
      const botY = cy + pillH + pillGap + hoverOffset;

      let topX = cx - pillW / 2;
      let topW = pillW;
      let topMaskX = pillW * 0.58; // original resting right position of dark blue slice
      let topMaskW = pillW * 0.38;

      let midX = cx - pillW / 2;
      let midW = pillW;
      let midKnobX = pillW * 0.28; // original custom switch offset

      let botX = cx - pillW / 2;
      let botW = pillW;
      let botDotX = cx - pillW / 2;
      let botDotActive = false;
      let botDotRadius = pillH / 2;

      // Apply coordinates changes for the active stage
      if (stage === 0) {
        // Rest state
        topMaskX = pillW - topMaskW - 5 * scaleFactor;
        midKnobX = pillW * 0.25;
        botDotActive = false;
      } 
      else if (stage === 1) {
        // Sliders shift
        const startTopMaskX = pillW - topMaskW - 5 * scaleFactor;
        const endTopMaskX = 5 * scaleFactor;
        topMaskX = startTopMaskX + (endTopMaskX - startTopMaskX) * eased;

        const startMidKnobX = pillW * 0.25;
        const endMidKnobX = pillW - pillH + 2 * scaleFactor;
        midKnobX = startMidKnobX + (endMidKnobX - startMidKnobX) * eased;

        // Middle pill body shifts left
        midX = cx - pillW / 2 - (18 * scaleFactor) * eased;

        // Bottom pill splits into a dot and body shifts opposite
        botDotActive = true;
        botDotX = cx - pillW / 2 - (24 * scaleFactor) * eased;
        botX = (cx - pillW / 2) + (14 * scaleFactor) * eased;
        botW = pillW - (14 * scaleFactor) * eased;
      } 
      else if (stage === 2) {
        // Organic custom wave slide
        topMaskX = 5 * scaleFactor + (Math.sin(frameCount * 0.04) * 0.5 + 0.5) * (pillW - topMaskW - 10 * scaleFactor);

        midX = cx - pillW / 2 - 18 * scaleFactor + Math.sin(frameCount * 0.03) * 20 * scaleFactor;
        midKnobX = 3 * scaleFactor + (Math.cos(frameCount * 0.04) * 0.5 + 0.5) * (pillW - pillH - 6 * scaleFactor);

        botDotActive = true;
        botDotX = cx - pillW / 2 - 24 * scaleFactor + Math.sin(frameCount * 0.045) * 12 * scaleFactor;
        botX = (cx - pillW / 2) + 14 * scaleFactor + Math.cos(frameCount * 0.03) * 15 * scaleFactor;
        botW = pillW - 10 * scaleFactor;
      } 
      else if (stage === 3) {
        // Merging and returning safely home
        const startTopMaskX = 5 * scaleFactor + (Math.sin(frameCount * 0.04) * 0.5 + 0.5) * (pillW - topMaskW - 10 * scaleFactor);
        const endTopMaskX = pillW - topMaskW - 5 * scaleFactor;
        topMaskX = startTopMaskX + (endTopMaskX - startTopMaskX) * eased;

        const startMidKnobX = 3 * scaleFactor + (Math.cos(frameCount * 0.04) * 0.5 + 0.5) * (pillW - pillH - 6 * scaleFactor);
        const endMidKnobX = pillW * 0.25;
        midKnobX = startMidKnobX + (endMidKnobX - startMidKnobX) * eased;

        const startMidX = cx - pillW / 2 - 18 * scaleFactor + Math.sin(frameCount * 0.03) * 20 * scaleFactor;
        const endMidX = cx - pillW / 2;
        midX = startMidX + (endMidX - startMidX) * eased;

        botDotActive = true;
        const startDotX = cx - pillW / 2 - 24 * scaleFactor;
        const endDotX = cx - pillW / 2;
        botDotX = startDotX + (endDotX - startDotX) * eased;

        // Slowly shrink separation
        if (stageProgress > 0.95) {
          botDotActive = false;
        }

        const startBotX = (cx - pillW / 2) + 14 * scaleFactor;
        const endBotX = cx - pillW / 2;
        botX = startBotX + (endBotX - startBotX) * eased;

        const startBotW = pillW - 10 * scaleFactor;
        botW = startBotW + (pillW - startBotW) * eased;
      }

      // 1. Draw TOP PILL (Cyan base, animated Dark Blue slider capsule segment on top)
      ctx.save();
      ctx.shadowBlur = 18 * scaleFactor;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.45)';
      
      const topGrad = ctx.createLinearGradient(topX, topY, topX + topW, topY);
      topGrad.addColorStop(0, '#06b6d4');
      topGrad.addColorStop(1, '#22d3ee');
      drawRoundedRect(ctx, topX, topY, topW, pillH, pillH / 2);
      ctx.fillStyle = topGrad;
      ctx.fill();
      ctx.restore();

      ctx.save();
      const topMaskGrad = ctx.createLinearGradient(topX + topMaskX, topY, topX + topMaskX + topMaskW, topY);
      topMaskGrad.addColorStop(0, '#1e3a8a');
      topMaskGrad.addColorStop(1, '#1d4ed8');
      
      ctx.shadowBlur = 8 * scaleFactor;
      ctx.shadowColor = 'rgba(29, 78, 216, 0.2)';
      drawRoundedRect(ctx, topX + topMaskX, topY + 2 * scaleFactor, topMaskW, pillH - 4 * scaleFactor, (pillH - 4 * scaleFactor) / 2);
      ctx.fillStyle = topMaskGrad;
      ctx.fill();

      const topHighlight = ctx.createLinearGradient(topX, topY, topX, topY + pillH);
      topHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      topHighlight.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
      topHighlight.addColorStop(0.7, 'transparent');
      drawRoundedRect(ctx, topX, topY, topW, pillH, pillH / 2);
      ctx.fillStyle = topHighlight;
      ctx.fill();
      ctx.restore();

      // 2. Draw MIDDLE PILL (Orange base, with a white/peach rotating slider knob)
      ctx.save();
      ctx.shadowBlur = 18 * scaleFactor;
      ctx.shadowColor = 'rgba(249, 115, 22, 0.45)';
      
      const midGrad = ctx.createLinearGradient(midX, midY, midX + midW, midY);
      midGrad.addColorStop(0, '#ea580c');
      midGrad.addColorStop(1, '#ff7a00');
      drawRoundedRect(ctx, midX, midY, midW, pillH, pillH / 2);
      ctx.fillStyle = midGrad;
      ctx.fill();
      ctx.restore();

      ctx.save();
      const knobSize = pillH - 6 * scaleFactor;
      const kx = midX + midKnobX + 3 * scaleFactor;
      const ky = midY + 3 * scaleFactor;

      ctx.shadowBlur = 12 * scaleFactor;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      const knobGrad = ctx.createRadialGradient(kx + knobSize / 2, ky + knobSize / 2, 1, kx + knobSize / 2, ky + knobSize / 2, knobSize / 2);
      knobGrad.addColorStop(0, '#ffffff');
      knobGrad.addColorStop(0.4, '#ffedd5');
      knobGrad.addColorStop(1, '#fed7aa');
      
      ctx.fillStyle = knobGrad;
      ctx.beginPath();
      ctx.arc(kx + knobSize / 2, ky + knobSize / 2, knobSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Draw BOTTOM PILL (Crimson/Red/Pink base, which splits)
      if (botDotActive) {
        ctx.save();
        ctx.shadowBlur = 18 * scaleFactor;
        ctx.shadowColor = 'rgba(225, 29, 72, 0.45)';
        
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(botDotX + botDotRadius, botY + botDotRadius, botDotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        const dotHighlight = ctx.createLinearGradient(botDotX, botY, botDotX, botY + botDotRadius * 2);
        dotHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        dotHighlight.addColorStop(0.5, 'transparent');
        ctx.fillStyle = dotHighlight;
        ctx.beginPath();
        ctx.arc(botDotX + botDotRadius, botY + botDotRadius, botDotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.shadowBlur = 18 * scaleFactor;
      ctx.shadowColor = 'rgba(225, 29, 72, 0.45)';
      
      const botGrad = ctx.createLinearGradient(botX, botY, botX + botW, botY);
      botGrad.addColorStop(0, '#be123c');
      botGrad.addColorStop(1, '#fb7185');
      drawRoundedRect(ctx, botX, botY, botW, pillH, pillH / 2);
      ctx.fillStyle = botGrad;
      ctx.fill();

      const botHighlight = ctx.createLinearGradient(botX, botY, botX, botY + pillH);
      botHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      botHighlight.addColorStop(0.5, 'transparent');
      drawRoundedRect(ctx, botX, botY, botW, pillH, pillH / 2);
      ctx.fillStyle = botHighlight;
      ctx.fill();
      ctx.restore();

      // 5. Background diagnostic overlays removed as requested

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [windowSize]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0"
      id="neural_ai_chip_background"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full opacity-[0.45]"
      />
    </div>
  );
}

