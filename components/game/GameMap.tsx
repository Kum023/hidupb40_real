"use client";

import { useState, useMemo } from "react";
import { LocationId, MapConfig, PERSONA_MAPS, KL_MAP, Location } from "@/lib/constants";
import { WeeklyObjectives } from "@/lib/types";

interface GameMapProps {
  currentLocation: LocationId;
  onLocationClick: (locationId: LocationId) => void;
  disabled?: boolean;
  personaId?: string;
  isWeekend?: boolean;
  energyRemaining?: number;
  currentDay?: number;
  weeklyObjectives?: WeeklyObjectives;
}

// Location sprite colors (real-world branding)
const locationSprites: Record<string, { bg: string; border: string; shadow: string }> = {
  home: { bg: "#5a7a9a", border: "#3d5a7a", shadow: "#2a4060" },      // Apartment blue-gray
  shop: { bg: "#ff6b00", border: "#cc5500", shadow: "#993f00" },      // 7-Eleven orange
  petrol: { bg: "#00a19c", border: "#007a76", shadow: "#005550" },    // Petronas teal/green
  tnb: { bg: "#e31837", border: "#b3122a", shadow: "#800d1e" },       // TNB red
  office: { bg: "#4a5568", border: "#2d3748", shadow: "#1a202c" },    // Corporate gray
  bank: { bg: "#ffc220", border: "#d4a017", shadow: "#a67c00" },      // Maybank yellow
  bus: { bg: "#1e40af", border: "#1e3a8a", shadow: "#172554" },       // RapidKL blue
  // New locations
  post_office: { bg: "#dc2626", border: "#991b1b", shadow: "#7f1d1d" }, // Post office red
  fancy_restaurant: { bg: "#7c3aed", border: "#5b21b6", shadow: "#4c1d95" }, // Restaurant purple
  fancy_cafe: { bg: "#a16207", border: "#854d0e", shadow: "#713f12" }, // Cafe brown
  shopping_mall: { bg: "#0ea5e9", border: "#0284c7", shadow: "#0369a1" }, // Mall blue
  sunway_lagoon: { bg: "#f97316", border: "#ea580c", shadow: "#c2410c" }, // Theme park orange
  penang_hill: { bg: "#22c55e", border: "#16a34a", shadow: "#15803d" }, // Nature green
  restaurant: { bg: "#ec4899", border: "#db2777", shadow: "#be185d" }, // Restaurant pink
};

export function GameMap({
  currentLocation,
  onLocationClick,
  disabled,
  personaId,
  isWeekend = false,
  energyRemaining = 11,
  currentDay = 1,
  weeklyObjectives
}: GameMapProps) {
  // Determine if location is on weekday (days 1-5) or weekend
  const isWeekday = currentDay <= 5;
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const mapConfig: MapConfig = useMemo(() => {
    if (personaId && PERSONA_MAPS[personaId]) {
      return PERSONA_MAPS[personaId];
    }
    return KL_MAP;
  }, [personaId]);

  const { locations, theme, landmarks } = mapConfig;
  const isCity = theme.roadStyle === "city";

  return (
    <div
      className="relative w-full h-[450px] overflow-hidden border-4 select-none"
      style={{
        borderColor: isCity ? "#1a1a2e" : "#2d5a4a",
        imageRendering: "pixelated",
      }}
    >
      {/* Background - City or Island */}
      {isCity ? (
        // CITY BACKGROUND - Concrete jungle
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-600">
          {/* City grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(100,100,120,0.3) 2px, transparent 2px),
                linear-gradient(to bottom, rgba(100,100,120,0.3) 2px, transparent 2px)
              `,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
      ) : (
        // ISLAND BACKGROUND - Tropical paradise
        <div className="absolute inset-0">
          {/* Ocean gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 via-cyan-500 to-blue-600" />

          {/* Waves pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 20px,
                  rgba(255,255,255,0.3) 20px,
                  rgba(255,255,255,0.3) 22px
                )
              `,
            }}
          />

          {/* Island land mass - left side */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[75%]"
            style={{
              background: "linear-gradient(135deg, #4a7c59 0%, #3d6b4f 50%, #2d5a3f 100%)",
              clipPath: "polygon(0 0, 85% 0, 100% 30%, 95% 50%, 100% 70%, 80% 100%, 0 100%)",
              boxShadow: "inset -10px 0 30px rgba(0,0,0,0.2)",
            }}
          >
            {/* Grass texture */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 2px 2px, #2d5a3f 1px, transparent 1px)
                `,
                backgroundSize: "8px 8px",
              }}
            />
          </div>

        </div>
      )}

      {/* Roads - 2 horizontal + 2 vertical centered grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {isCity ? (
          // CITY ROADS - Clean centered grid
          <>
            {/* Horizontal road - upper */}
            <rect x="0" y="30%" width="100%" height="24" fill="#3a3a4a" />
            <line x1="0" y1="calc(30% + 12px)" x2="100%" y2="calc(30% + 12px)" stroke="#fff" strokeWidth="2" strokeDasharray="18 10" opacity="0.6" />

            {/* Horizontal road - lower */}
            <rect x="0" y="60%" width="100%" height="24" fill="#3a3a4a" />
            <line x1="0" y1="calc(60% + 12px)" x2="100%" y2="calc(60% + 12px)" stroke="#fff" strokeWidth="2" strokeDasharray="18 10" opacity="0.6" />

            {/* Vertical road - left */}
            <rect x="25%" y="0" width="24" height="100%" fill="#3a3a4a" />
            <line x1="calc(25% + 12px)" y1="0" x2="calc(25% + 12px)" y2="100%" stroke="#fff" strokeWidth="2" strokeDasharray="18 10" opacity="0.6" />

            {/* Vertical road - right */}
            <rect x="55%" y="0" width="24" height="100%" fill="#3a3a4a" />
            <line x1="calc(55% + 12px)" y1="0" x2="calc(55% + 12px)" y2="100%" stroke="#fff" strokeWidth="2" strokeDasharray="18 10" opacity="0.6" />

            {/* Vertical road - far right */}
            <rect x="82%" y="0" width="24" height="100%" fill="#3a3a4a" />
            <line x1="calc(82% + 12px)" y1="0" x2="calc(82% + 12px)" y2="100%" stroke="#fff" strokeWidth="2" strokeDasharray="18 10" opacity="0.6" />
          </>
        ) : (
          // ISLAND ROADS - 2 horizontal + 2 vertical sandy paths
          <>
            {/* Horizontal path - upper */}
            <rect x="5%" y="32%" width="65%" height="14" fill="#c4a76c" rx="4" opacity="0.9" />

            {/* Horizontal path - lower */}
            <rect x="10%" y="62%" width="60%" height="14" fill="#c4a76c" rx="4" opacity="0.9" />

            {/* Vertical path - left */}
            <rect x="25%" y="10%" width="14" height="80%" fill="#c4a76c" rx="4" opacity="0.9" />

            {/* Vertical path - middle */}
            <rect x="55%" y="10%" width="14" height="80%" fill="#c4a76c" rx="4" opacity="0.9" />
          </>
        )}
      </svg>

      {/* Decorative elements */}
      {isCity ? (
        // City decorations - cars on roads
        <>
          {/* Cars on upper horizontal road (y:30%) */}
          {[15, 45, 75].map((x, i) => (
            <div
              key={`car-h1-${i}`}
              className="absolute text-base"
              style={{
                left: `${x}%`,
                top: "29%",
                filter: "drop-shadow(1px 2px 1px rgba(0,0,0,0.5))",
              }}
            >
              🚗
            </div>
          ))}
          {/* Cars on lower horizontal road (y:60%) */}
          {[20, 50, 70].map((x, i) => (
            <div
              key={`car-h2-${i}`}
              className="absolute text-base"
              style={{
                left: `${x}%`,
                top: "59%",
                filter: "drop-shadow(1px 2px 1px rgba(0,0,0,0.5))",
              }}
            >
              🚙
            </div>
          ))}
        </>
      ) : (
        // Island decorations - palm trees, boats
        <>
          {[{ x: 5, y: 25 }, { x: 8, y: 70 }, { x: 48, y: 15 }, { x: 45, y: 75 }].map((pos, i) => (
            <div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                filter: "drop-shadow(2px 2px 1px rgba(0,0,0,0.3))",
              }}
            >
              🌴
            </div>
          ))}
          {[{ x: 85, y: 35 }, { x: 88, y: 60 }].map((pos, i) => (
            <div
              key={i}
              className="absolute text-xl"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              ⛵
            </div>
          ))}
        </>
      )}

      {/* Landmarks */}
      {landmarks.map((landmark, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center pointer-events-none"
          style={{
            left: `${landmark.x}%`,
            top: `${landmark.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: landmark.size === "lg" ? 0.9 : landmark.size === "md" ? 0.7 : 0.5,
          }}
        >
          <span
            className={landmark.size === "lg" ? "text-3xl" : landmark.size === "md" ? "text-2xl" : "text-xl"}
            style={{
              filter: "drop-shadow(2px 2px 1px rgba(0,0,0,0.5))",
            }}
          >
            {landmark.icon}
          </span>
          <span
            className="text-[7px] font-bold mt-0.5 px-1 py-0.5 rounded"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              backgroundColor: isCity ? "rgba(0,0,0,0.7)" : "rgba(0,50,30,0.7)",
              color: isCity ? "#00d4ff" : "#90EE90",
              textShadow: "1px 1px 0 #000",
            }}
          >
            {landmark.name}
          </span>
        </div>
      ))}

      {/* Location markers - Pokemon building style */}
      {(Object.entries(locations) as [string, Location][]).map(([id, location]) => {
        const isCurrentLocation = currentLocation === id;
        const isHovered = hoveredLocation === id;
        const sprite = locationSprites[id] || { bg: "#666", border: "#444", shadow: "#333" };
        const isWeekendOnly = location.isWeekendOnly;
        const isDisabledByWeekend = isWeekendOnly && isWeekday;
        const isLocationDisabled = disabled || isDisabledByWeekend;

        // Check if this location has an incomplete objective
        const objectiveType = location.objectiveType;
        let needsObjective = false;
        if (weeklyObjectives && objectiveType) {
          if (objectiveType === "work" && weeklyObjectives.workDaysCompleted < 5) needsObjective = true;
          if (objectiveType === "groceries" && !weeklyObjectives.boughtGroceries) needsObjective = true;
          if (objectiveType === "petrol" && !weeklyObjectives.filledPetrol) needsObjective = true;
          if (objectiveType === "debt" && !weeklyObjectives.paidDebt) needsObjective = true;
        }

        return (
          <div
            key={id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-transform duration-150 ${
              isLocationDisabled ? "cursor-not-allowed" : "cursor-pointer"
            } ${isDisabledByWeekend ? "opacity-40 grayscale" : ""} ${
              isHovered && !isLocationDisabled ? "scale-110 -translate-y-[52%]" : ""
            } ${isHovered && isDisabledByWeekend ? "scale-105" : ""}`}
            style={{ left: `${location.x}%`, top: `${location.y}%`, zIndex: isHovered ? 30 : (isCurrentLocation ? 20 : 10) }}
            onClick={() => !isLocationDisabled && onLocationClick(id as LocationId)}
            onMouseEnter={() => setHoveredLocation(id)}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            {/* Building shadow */}
            <div
              className="absolute -bottom-1 w-12 h-2 rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.4)", filter: "blur(2px)" }}
            />

            {/* Pokemon-style building */}
            <div
              className="relative px-1 pt-1 pb-1.5 border-[3px] flex flex-col items-center"
              style={{
                backgroundColor: sprite.bg,
                borderColor: sprite.border,
                boxShadow: `
                  inset -3px -3px 0 ${sprite.shadow},
                  inset 3px 3px 0 rgba(255,255,255,0.25),
                  3px 3px 0 rgba(0,0,0,0.4)
                `,
              }}
            >
              {/* Roof */}
              <div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-2.5"
                style={{
                  backgroundColor: sprite.border,
                  clipPath: "polygon(15% 100%, 50% 0%, 85% 100%)",
                  boxShadow: "inset 0 -2px 0 " + sprite.shadow,
                }}
              />
              <span className="text-xl" style={{ filter: "drop-shadow(1px 1px 0 rgba(0,0,0,0.4))" }}>
                {location.icon}
              </span>

              {/* Weekend-only badge */}
              {isWeekendOnly && (
                <div className="absolute -top-6 -right-2 text-xs">
                  {isWeekend ? "🌟" : "🔒"}
                </div>
              )}

              {/* Objective indicator */}
              {location.objectiveType && (
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] px-1 rounded font-bold"
                  style={{
                    backgroundColor: "#000",
                    color: location.objectiveType === "work" ? "#fbbf24" : "#22c55e",
                  }}
                >
                  {location.objectiveType === "work" && "WORK"}
                  {location.objectiveType === "groceries" && "FOOD"}
                  {location.objectiveType === "petrol" && "GAS"}
                  {location.objectiveType === "debt" && "DEBT"}
                </div>
              )}
            </div>

            {/* Name plate */}
            <div
              className="relative mt-1.5 px-1.5 py-0.5 border-2 text-center whitespace-nowrap"
              style={{
                backgroundColor: isCurrentLocation ? "#fff" : "#1a1a2e",
                borderColor: isCurrentLocation ? "#ffd700" : "#3d3d5c",
                boxShadow: isCurrentLocation
                  ? "0 0 0 1px #1a1a2e, inset 0 0 0 1px #ffd700"
                  : "2px 2px 0 rgba(0,0,0,0.4)",
              }}
            >
              <span
                className="text-[6px] font-bold uppercase"
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  color: isCurrentLocation ? "#1a1a2e" : "#fff",
                  textShadow: isCurrentLocation ? "none" : "1px 1px 0 #000",
                }}
              >
                {location.name}
              </span>
              {/* Objective indicator */}
              {needsObjective && !isLocationDisabled && (
                <span
                  className="absolute -right-1 -top-1 flex h-3 w-3"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 border border-yellow-600 text-[6px] font-bold text-yellow-900 items-center justify-center">!</span>
                </span>
              )}
            </div>

            {/* Weekend-only tooltip on hover */}
            {isHovered && isDisabledByWeekend && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap">
                <div
                  className="px-2 py-1 bg-purple-900 border-2 border-purple-500 rounded text-[8px] text-purple-200 font-bold"
                  style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.4)" }}
                >
                  🌙 Weekend Only
                </div>
              </div>
            )}

            {/* Player indicator */}
            {isCurrentLocation && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce">
                <div
                  className="px-1.5 py-0.5 border-2 bg-red-500 border-red-700"
                  style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.4), inset -2px -2px 0 #a00" }}
                >
                  <span className="text-[5px] text-white font-bold" style={{ fontFamily: "var(--font-pixel), monospace" }}>
                    YOU
                  </span>
                </div>
                <div
                  className="w-0 h-0 mx-auto"
                  style={{
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "5px solid #991b1b",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Region name sign */}
      <div className="absolute top-2 left-2 z-30">
        <div
          className="px-3 py-1.5 border-[3px]"
          style={{
            backgroundColor: isCity ? "#1a1a2e" : "#2d5a3f",
            borderColor: isCity ? "#4a4a6a" : "#4a7c59",
            boxShadow: "3px 3px 0 rgba(0,0,0,0.3), inset -2px -2px 0 rgba(0,0,0,0.2), inset 2px 2px 0 rgba(255,255,255,0.1)",
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: isCity ? "#00d4ff" : "#90EE90",
              textShadow: "1px 1px 0 #000",
            }}
          >
            {theme.name}
          </span>
        </div>
      </div>

      {/* Instructions box */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-30">
        <div
          className="px-2 py-1 border-2 bg-slate-900/90"
          style={{
            borderColor: "#3d3d5c",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.3)",
          }}
        >
          <p
            className="text-[8px] text-center text-slate-300"
            style={{ fontFamily: "var(--font-pixel), monospace" }}
          >
            {disabled && energyRemaining <= 0 ? (
              <span className="text-red-400">! NO ENERGY !</span>
            ) : disabled ? (
              <span className="text-orange-400">! PROCESSING !</span>
            ) : (
              <span className="text-cyan-400">TAP LOCATION (1 ENERGY)</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
