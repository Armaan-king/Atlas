import { useCallback, useMemo, useState, useEffect } from "react";
import { LayoutDashboard, Network, CalendarDays, User, Briefcase, Layers, Zap } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "HUB", icon: LayoutDashboard },
  { path: "/lattice", label: "ATLAS", icon: Network },
  { path: "/calendar", label: "CALENDAR", icon: CalendarDays },
  { path: "/modules", label: "MODULES", icon: Layers },
  { path: "/digest", label: "FEEDS", icon: Zap },
  { path: "/profile", label: "PROFILE", icon: User },
  { path: "/career", label: "CAREER", icon: Briefcase },
] as const;

const getArcConfig = (height: number) => ({
  width: 220,
  height,
  arcX: 70,
  startY: height * 0.35, // Restrict to middle third of screen
  endY: height * 0.65,   // Restrict to middle third of screen
  curveOffset: 12,
  tickCount: 15,
  tickLength: 4,
});

function getArcPoint(t: number, config: ReturnType<typeof getArcConfig>): { x: number; y: number } {
  const { arcX, startY, endY, curveOffset } = config;
  const y = startY + t * (endY - startY);
  const x = arcX + curveOffset * Math.sin(t * Math.PI);
  return { x, y };
}

interface WheelNavProps {
  onNavigate?: (path: string) => void;
  activeIndex?: number;
}

export function WheelNav({ onNavigate, activeIndex: controlledIndex }: WheelNavProps = {}) {
  const [arcHeight, setArcHeight] = useState(() => 
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [internalIndex, setInternalIndex] = useState(1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setArcHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ARC_CONFIG = useMemo(() => getArcConfig(arcHeight), [arcHeight]);
  const activeIndex = controlledIndex ?? internalIndex;

  const handleNav = useCallback(
    (path: string) => {
      const idx = NAV_ITEMS.findIndex((item) => item.path === path);
      if (idx >= 0) setInternalIndex(idx);
      onNavigate?.(path);
    },
    [onNavigate],
  );

  const nodePositions = useMemo(
    () =>
      NAV_ITEMS.map((_, idx) => {
        const t = idx / (NAV_ITEMS.length - 1);
        return getArcPoint(t, ARC_CONFIG);
      }),
    [ARC_CONFIG]
  );

  const indicatorPos = useMemo(() => {
    const t = activeIndex / (NAV_ITEMS.length - 1);
    return getArcPoint(t, ARC_CONFIG);
  }, [activeIndex, ARC_CONFIG]);

  return (
    <aside 
      className="fixed left-0 top-0 z-[100] h-screen w-[220px] select-none pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] translate-x-0"
      style={{
        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.98), transparent)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Brand Mark - Absolute Top */}
      <div className="absolute top-12 left-10 flex flex-col items-start pointer-events-auto z-50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] shadow-[0_0_40px_rgba(255,107,107,0.3)] border border-white/30">
          <span className="text-base font-black text-white">A</span>
        </div>
      </div>

      {/* SVG Container - Full Screen exactly centered */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto">
        <svg
          viewBox={`0 0 ${ARC_CONFIG.width} ${ARC_CONFIG.height}`}
          className="w-full h-full"
        >
          <defs>
            <filter id="glow-indicator">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Vertical Arc Line */}
          <path
            d={`M ${ARC_CONFIG.arcX} ${ARC_CONFIG.startY} Q ${ARC_CONFIG.arcX + ARC_CONFIG.curveOffset * 2} ${ARC_CONFIG.height/2} ${ARC_CONFIG.arcX} ${ARC_CONFIG.endY}`}
            fill="none"
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="1.5"
          />

          {/* Active indicator mark - The Red Dot */}
          <circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r="12"
            fill="#FF6B6B"
            fillOpacity="0.2"
            className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          />
          <circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r="4"
            fill="#FF6B6B"
            filter="url(#glow-indicator)"
            className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          />

          {NAV_ITEMS.map((item, idx) => {
            const pos = nodePositions[idx];
            const isActive = idx === activeIndex;
            const isHovered = idx === hoveredIndex;
            const Icon = item.icon;

            return (
              <g
                key={item.path}
                onClick={() => handleNav(item.path)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer group"
              >
                {/* Hit area - larger for better UX */}
                <rect
                  x={0}
                  y={pos.y - 50}
                  width={ARC_CONFIG.width}
                  height={100}
                  fill="transparent"
                />

                <g className="transition-all duration-300">
                  {/* ICON on the LEFT - Removed foreignObject for reliable SVG rendering */}
                  <g 
                    transform={`translate(${pos.x - 45}, ${pos.y - 9})`}
                    style={{
                      opacity: isActive || isHovered ? 1 : 0.4,
                      color: 'white',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <Icon size={18} strokeWidth={isActive || isHovered ? 2.5 : 2} color="currentColor" />
                  </g>


                  {/* LINE/TICK on the WHEEL */}
                  <line
                    x1={pos.x - 10}
                    y1={pos.y}
                    x2={pos.x + 10}
                    y2={pos.y}
                    stroke="white"
                    strokeOpacity={isActive ? 1 : (isHovered ? 0.6 : 0.2)}
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />

                  {/* LABEL on the RIGHT - Always Visible */}
                  <text
                    x={pos.x + 25}
                    y={pos.y}
                    dominantBaseline="middle"
                    fill="white"
                    fillOpacity={isActive ? 1 : (isHovered ? 0.8 : 0.4)}
                    fontSize="11"
                    fontWeight={isActive ? "800" : "600"}
                    letterSpacing="0.25em"
                    fontFamily="inherit"
                    className="transition-all duration-500 uppercase pointer-events-none"
                  >
                    {item.label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* System Status Integration Footer - Absolute Bottom */}
      <div className="absolute bottom-10 left-10 pointer-events-auto space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
          <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase">OpenAI Core</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
          <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase">OpenAI Ready</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
          <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase">Data Sync</span>
        </div>
      </div>
    </aside>
  );
}
