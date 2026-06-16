'use client';

interface MatchScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function MatchScoreRing({
  score,
  size = 64,
  strokeWidth = 5,
  showLabel = true,
}: MatchScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillRatio = Math.min(score, 100) / 100;
  const strokeDashoffset = circumference * (1 - fillRatio);

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#34D399', text: '#34D399' };
    if (s >= 60) return { stroke: '#60A5FA', text: '#60A5FA' };
    if (s >= 40) return { stroke: '#FBBF24', text: '#FBBF24' };
    return { stroke: '#F87171', text: '#F87171' };
  };

  const { stroke, text } = getColor(score);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 4px ${stroke}80)` }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none"
            style={{ color: text, fontSize: Math.max(14, size * 0.22) }}
          >
            {score}%
          </span>
          {size >= 60 && (
            <span className="text-[var(--text-muted)] leading-none mt-0.5" style={{ fontSize: size * 0.13 }}>
              match
            </span>
          )}
        </div>
      )}
    </div>
  );
}
