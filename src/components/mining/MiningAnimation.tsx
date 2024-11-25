import React from 'react';

export default function MiningAnimation() {
  return (
    <div className="mining-animation">
      <svg
        width="200"
        height="300"
        viewBox="0 0 200 300"
        className="mx-auto"
      >
        {/* Main Animation Group */}
        <g transform="translate(0, 50)">
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#f472b6"
            strokeWidth="2"
            className="animate-pulse"
          />

          {/* Main Heart */}
          <path
            d="M100 130 C100 130, 85 115, 70 100 C55 85, 55 65, 70 55 C85 45, 100 55, 100 70 C100 55, 115 45, 130 55 C145 65, 145 85, 130 100 C115 115, 100 130, 100 130"
            fill="#ec4899"
            className="heart-pulse"
          />

          {/* Pulse Rings */}
          <path
            d="M100 140 C100 140, 80 120, 60 100 C40 80, 40 50, 60 35 C80 20, 100 35, 100 55 C100 35, 120 20, 140 35 C160 50, 160 80, 140 100 C120 120, 100 140, 100 140"
            fill="none"
            stroke="#f472b6"
            strokeWidth="2"
            className="pulse-ring-1"
          />
          <path
            d="M100 150 C100 150, 75 125, 50 100 C25 75, 25 35, 50 15 C75 -5, 100 15, 100 40 C100 15, 125 -5, 150 15 C175 35, 175 75, 150 100 C125 125, 100 150, 100 150"
            fill="none"
            stroke="#f472b6"
            strokeWidth="2"
            className="pulse-ring-2"
          />

          {/* Particles */}
          {[...Array(8)].map((_, i) => (
            <circle
              key={i}
              className={`particle-${i + 1}`}
              cx={100 + Math.cos((i * Math.PI) / 4) * 40}
              cy={100 + Math.sin((i * Math.PI) / 4) * 40}
              r="3"
              fill="#ec4899"
            />
          ))}

          {/* Love Sparkles */}
          <g className="sparkles">
            {[...Array(4)].map((_, i) => (
              <path
                key={i}
                d="M0 0L3 10L0 7L-3 10L0 0"
                fill="#f472b6"
                transform={`translate(${100 + Math.cos((i * Math.PI) / 2) * 50}, ${100 + Math.sin((i * Math.PI) / 2) * 50}) rotate(${i * 90})`}
                className={`sparkle-${i + 1}`}
              />
            ))}
          </g>
        </g>

        {/* Heart Monitor Line - Moved to bottom */}
        <g transform="translate(0, 220)">
          <path
            d="M0,25 L40,25 L50,25 L60,0 L70,50 L80,25 L90,25 L200,25"
            fill="none"
            stroke="#ec4899"
            strokeWidth="2"
            className="heart-monitor-line"
          />
          <circle
            cx="0"
            cy="25"
            r="2"
            fill="#ec4899"
            className="monitor-dot"
          />
        </g>
      </svg>
    </div>
  );
}