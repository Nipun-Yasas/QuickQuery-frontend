"use client";

import { useId, useState, useEffect } from "react";
import { FileText, MessageCircle, Users, Languages } from "lucide-react";

import CountUp from "./CountUp";

interface PlatformStats {
  documents_processed: number;
  questions_answered: number;
  active_users: number;
}

// Gemini 2.5 Flash supports 100+ languages — hardcoded per model spec.
const LANGUAGES_SUPPORTED = 100;

export function Stat() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats`
        );
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setPlatformStats(data);
      } catch (err) {
        console.error("Could not load platform stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      value: platformStats?.documents_processed ?? 0,
      suffix: "+",
      description: "Documents processed",
      icon: <FileText className="w-8 h-8" />,
    },
    {
      value: platformStats?.questions_answered ?? 0,
      suffix: "+",
      description: "Questions answered",
      icon: <MessageCircle className="w-8 h-8" />,
    },
    {
      value: platformStats?.active_users ?? 0,
      suffix: "+",
      description: "Active users worldwide",
      icon: <Users className="w-8 h-8" />,
    },
    {
      value: LANGUAGES_SUPPORTED,
      suffix: "+",
      description: "Languages supported",
      icon: <Languages className="w-8 h-8" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-2 pb-12 pt-0 sm:pt-0 md:pt-4 lg:pt-12 px-4 sm:px-6 md:px-12 lg:px-12 w-full max-w-7xl mx-auto">
      {stats.map((feature, idx) => (
        <div
          key={idx}
          className="relative flex flex-col border border-borderPrimary items-center justify-center bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-3 sm:p-6 rounded-3xl overflow-hidden"
        >
          <Grid size={20} />
          <div className="relative z-20 mb-4 text-textPrimary">
            {feature.icon}
          </div>

          {loading && idx < 3 ? (
            /* Skeleton loader for the three live stats */
            <div className="relative z-20 h-9 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ) : (
            <div className="text-3xl font-bold text-textPrimary relative z-20 flex items-center">
              <CountUp
                from={0}
                to={feature.value}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text"
              />
              {feature.suffix}
            </div>
          )}

          <p className="text-textPrimary mt-2 text-base font-normal relative z-20 text-center">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const [p, setP] = useState<number[][] | null>(null);

  useEffect(() => {
    setP(
      pattern ?? [
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
        [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
      ]
    );
  }, [pattern]);

  if (!p) {
    return null;
  }
  return (
    <div className="pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r  [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full  mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<"svg"> & {
  width?: number;
  height?: number;
  x?: string | number;
  y?: string | number;
  squares?: number[][];
}) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: number[], idx: number) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}-${idx}`}
              width={Number(width) + 1}
              height={Number(height) + 1}
              x={x * Number(width)}
              y={y * Number(height)}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
