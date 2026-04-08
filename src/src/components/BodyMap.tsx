import { useState, useCallback, memo } from "react";

interface BodyMapProps {
  selectedAreas: string[];
  onAreaClick: (area: string) => void;
  multiSelect?: boolean;
}

const bodyAreas = [
  { id: "head",         label: "Bosh",           cx: 100, cy: 18,  r: 14 },
  { id: "neck",         label: "Bo'yin",          x: 93,  y: 31,  w: 14, h: 10, rx: 4 },
  { id: "chest",        label: "Ko'krak qafasi",  x: 70,  y: 40,  w: 60, h: 42, rx: 8 },
  { id: "leftShoulder", label: "Chap elka",       cx: 60, cy: 50, r: 12 },
  { id: "rightShoulder",label: "O'ng elka",       cx: 140,cy: 50, r: 12 },
  { id: "leftArm",      label: "Chap qo'l",       x: 42,  y: 62,  w: 16, h: 40, rx: 8 },
  { id: "rightArm",     label: "O'ng qo'l",       x: 142, y: 62,  w: 16, h: 40, rx: 8 },
  { id: "stomach",      label: "Qorin",            x: 72,  y: 82,  w: 56, h: 36, rx: 8 },
  { id: "upperBack",    label: "Orqa (kuraksohasi)",x: 70, y: 40,  w: 60, h: 42, rx: 8 },
  { id: "jaw",          label: "Jag'",             cx: 100,cy: 35, r: 8  },
] as const;

// Clickable areas for the SVG (simplified regions)
const clickRegions = [
  { id: "head",          x: 84,  y: 4,   w: 32, h: 30, label: "Bosh" },
  { id: "neck",          x: 90,  y: 31,  w: 20, h: 12, label: "Bo'yin" },
  { id: "jaw",           x: 86,  y: 26,  w: 28, h: 10, label: "Jag'" },
  { id: "leftShoulder",  x: 46,  y: 40,  w: 24, h: 22, label: "Chap elka" },
  { id: "rightShoulder", x: 130, y: 40,  w: 24, h: 22, label: "O'ng elka" },
  { id: "chest",         x: 70,  y: 42,  w: 60, h: 38, label: "Ko'krak qafasi" },
  { id: "leftArm",       x: 38,  y: 62,  w: 20, h: 44, label: "Chap qo'l" },
  { id: "rightArm",      x: 142, y: 62,  w: 20, h: 44, label: "O'ng qo'l" },
  { id: "stomach",       x: 70,  y: 80,  w: 60, h: 38, label: "Qorin" },
  { id: "upperBack",     x: 70,  y: 42,  w: 60, h: 38, label: "Orqa (kuraksohasi)" },
];

// Display areas used for label lookup
const areaLabelMap: Record<string, string> = Object.fromEntries(
  clickRegions.map((r) => [r.id, r.label])
);

function BodyMapComponent({ selectedAreas, onAreaClick }: BodyMapProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  const handleClick = useCallback(
    (id: string) => {
      onAreaClick(id);
    },
    [onAreaClick]
  );

  const isSelected = useCallback(
    (id: string) => selectedAreas.includes(id),
    [selectedAreas]
  );

  return (
    <div className="space-y-5">
      {/* Body Diagram */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-3xl p-6 border-2 border-emerald-200 shadow-xl">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm text-emerald-700 border border-emerald-200 shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
            Og'riq sezilgan joylarni tanlang
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedAreas.length === 0
              ? "Diagrammada yoki pastdagi tugmachalardan tanlang"
              : `${selectedAreas.length} ta soha tanlandi`}
          </p>
        </div>

        <svg
          viewBox="0 0 200 200"
          className="w-full max-w-xs mx-auto cursor-pointer select-none"
          style={{ filter: "drop-shadow(0 4px 12px rgba(16,185,129,0.15))" }}
        >
          {/* ── Body outline shapes ── */}
          <g fill="#f0fdf4" stroke="#10b981" strokeWidth="1.5">
            {/* Head */}
            <ellipse cx="100" cy="18" rx="14" ry="14" />
            {/* Neck */}
            <rect x="93" y="30" width="14" height="12" rx="3" />
            {/* Torso */}
            <path d="M68 42 Q62 44 56 60 L56 118 Q56 122 60 122 L140 122 Q144 122 144 118 L144 60 Q138 44 132 42 Z" />
            {/* Left upper arm */}
            <ellipse cx="52" cy="72" rx="9" ry="22" transform="rotate(-8 52 72)" />
            {/* Right upper arm */}
            <ellipse cx="148" cy="72" rx="9" ry="22" transform="rotate(8 148 72)" />
            {/* Left forearm */}
            <ellipse cx="46" cy="112" rx="7" ry="18" transform="rotate(-12 46 112)" />
            {/* Right forearm */}
            <ellipse cx="154" cy="112" rx="7" ry="18" transform="rotate(12 154 112)" />
            {/* Left thigh */}
            <ellipse cx="85" cy="148" rx="13" ry="26" />
            {/* Right thigh */}
            <ellipse cx="115" cy="148" rx="13" ry="26" />
            {/* Left shin */}
            <ellipse cx="83" cy="184" rx="10" ry="18" />
            {/* Right shin */}
            <ellipse cx="117" cy="184" rx="10" ry="18" />
          </g>

          {/* ── Clickable regions (invisible, layered above) ── */}
          {clickRegions.map((region) => {
            const selected = isSelected(region.id);
            const hovered = hoveredArea === region.id;
            return (
              <rect
                key={region.id}
                x={region.x}
                y={region.y}
                width={region.w}
                height={region.h}
                rx="6"
                fill={selected ? "#ef4444" : hovered ? "#fca5a5" : "transparent"}
                fillOpacity={selected ? 0.65 : hovered ? 0.45 : 0}
                stroke={selected ? "#dc2626" : hovered ? "#f87171" : "transparent"}
                strokeWidth={selected ? 2 : 1.5}
                className="cursor-pointer transition-all duration-150"
                onClick={() => handleClick(region.id)}
                onMouseEnter={() => setHoveredArea(region.id)}
                onMouseLeave={() => setHoveredArea(null)}
              />
            );
          })}

          {/* Pain pulse indicators */}
          {selectedAreas.map((areaId) => {
            const region = clickRegions.find((r) => r.id === areaId);
            if (!region) return null;
            const cx = region.x + region.w / 2;
            const cy = region.y + region.h / 2;
            return (
              <g key={areaId}>
                <circle cx={cx} cy={cy} r="7" fill="#dc2626" className="animate-pulse" />
                <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                  !
                </text>
              </g>
            );
          })}

          {/* Hover label */}
          {hoveredArea && (
            <text x="100" y="202" textAnchor="middle" fill="#374151" fontSize="10" fontWeight="600">
              {areaLabelMap[hoveredArea]}
            </text>
          )}
        </svg>
      </div>

      {/* Selected areas chips */}
      {selectedAreas.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border-2 border-red-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-3">Tanlangan sohalar:</div>
          <div className="flex flex-wrap gap-2">
            {selectedAreas.map((areaId) => (
              <span
                key={areaId}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm border border-red-300"
              >
                {areaLabelMap[areaId] ?? areaId}
                <button
                  type="button"
                  onClick={() => handleClick(areaId)}
                  className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                  aria-label={`${areaLabelMap[areaId] ?? areaId} ni olib tashlash`}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick select buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {clickRegions.map((region) => (
          <button
            key={region.id}
            type="button"
            onClick={() => handleClick(region.id)}
            className={`p-3 rounded-xl border-2 text-sm transition-all ${
              isSelected(region.id)
                ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                : "border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            {region.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const BodyMap = memo(BodyMapComponent);
