import type { Project } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Typographic/diagrammatic covers derived from each project's real architecture.
 * No product screenshots exist for most of this work, so rather than stock imagery,
 * each cover draws the idea at the heart of the project.
 */

const TONE: Record<Project["tone"], string> = {
  lime: "var(--accent)",
  blue: "var(--tint-eng)",
  amber: "var(--tint-music)",
  magenta: "var(--tint-content)",
};

export function ProjectCover({ project, className }: { project: Project; className?: string }) {
  const tone = TONE[project.tone];
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 90% at 85% 10%, color-mix(in oklab, ${tone} 22%, transparent), transparent 60%), var(--bg-elev)`,
        ["--tone" as string]: tone,
      }}
    >
      {/* dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div className="absolute inset-0 grid place-items-center p-[6%]">{art(project.slug)}</div>
    </div>
  );
}

function art(slug: string) {
  switch (slug) {
    case "ai-trading-assistant":
      return <RiskEngine />;
    case "digital-banking-focus-mfb":
      return <Ledger />;
    case "lending-as-a-service":
      return <Score />;
    case "clean-api-foundation":
      return <Onion />;
    default:
      return <Route />;
  }
}

const RULES = [
  "account.tradeable",
  "market.open",
  "session.allowed",
  "symbol.allowed",
  "lot.size",
  "risk.percent",
  "loss.daily",
  "trades.max_open",
  "trade.duplicate",
  "exposure.total",
  "margin.free",
];

function RiskEngine() {
  return (
    <div className="flex w-full max-w-[34rem] flex-col gap-4 font-mono text-[clamp(0.55rem,1vw,0.8rem)]">
      <div className="flex items-center gap-3 text-fg-muted">
        <span className="rounded-md border border-line-strong px-2 py-1">&quot;buy 0.2 EURUSD, sl 20&quot;</span>
        <span className="h-px flex-1 bg-line-strong" />
        <span className="rounded-md border border-[var(--tone)] px-2 py-1 text-fg">TradingIntent ✓ zod</span>
      </div>
      <div className="rounded-xl border border-line bg-bg/60 p-4 backdrop-blur-sm">
        <div className="mb-3 flex justify-between text-fg-subtle">
          <span>RiskEngine.evaluate()</span>
          <span>pure · sync · no I/O</span>
        </div>
        <ol className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {RULES.map((r, i) => (
            <li key={r} className="flex items-center gap-2 text-fg-muted">
              <span className="text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 truncate">{r}</span>
              <span className="text-[var(--tone)]">✓</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex items-center justify-end gap-3 text-fg">
        <span className="h-px flex-1 bg-line-strong" />
        <span className="rounded-md bg-[var(--tone)] px-2 py-1 text-[#0a0a0a]">APPROVED → queue</span>
      </div>
    </div>
  );
}

function Ledger() {
  const rows = [
    ["ONBOARD", "KYC verified", "—"],
    ["ACCT", "Savings · opened", "—"],
    ["CREDIT", "Transfer in", "+₦250,000.00"],
    ["DEBIT", "Bill payment", "−₦18,450.00"],
    ["DEBIT", "Card · POS", "−₦6,200.00"],
    ["CREDIT", "Loan disbursed", "+₦500,000.00"],
  ];
  return (
    <div className="w-full max-w-[32rem] rounded-2xl border border-line bg-bg/70 p-5 font-mono text-[clamp(0.55rem,1vw,0.8rem)] backdrop-blur-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-fg-subtle">LEDGER · ACID</span>
        <span className="font-display text-[clamp(1.1rem,2.4vw,2rem)] font-semibold tracking-tight text-fg">₦725,350.00</span>
      </div>
      <ul className="divide-y divide-line">
        {rows.map(([k, label, amt], i) => (
          <li key={i} className="flex items-center gap-3 py-2 text-fg-muted">
            <span className={cn("w-16", k === "CREDIT" ? "text-[var(--tone)]" : "text-fg-subtle")}>{k}</span>
            <span className="flex-1">{label}</span>
            <span className="text-fg">{amt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Score() {
  const segments = 36;
  return (
    <div className="relative grid aspect-square w-[min(70%,22rem)] place-items-center">
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full -rotate-90">
        {Array.from({ length: segments }).map((_, i) => {
          const a = (i / segments) * Math.PI * 2;
          const on = i < segments * 0.72;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 78}
              y1={100 + Math.sin(a) * 78}
              x2={100 + Math.cos(a) * 94}
              y2={100 + Math.sin(a) * 94}
              stroke={on ? "var(--tone)" : "var(--line-strong)"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="text-center">
        <div className="font-mono text-[0.65rem] tracking-[0.1em] text-fg-subtle">CREDIT SCORE</div>
        <div className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-semibold tracking-tight">720</div>
        <div className="mt-2 font-mono text-[0.65rem] text-[var(--tone)]">event: loan.approved</div>
      </div>
    </div>
  );
}

function Onion() {
  const layers = ["Infrastructure", "Adapters", "Use cases", "Domain"];
  return (
    <div className="relative aspect-[4/3] w-[min(86%,30rem)]">
      {layers.map((l, i) => (
        <div
          key={l}
          className="absolute flex items-start justify-center rounded-[28px] border pt-2 font-mono text-[clamp(0.55rem,1vw,0.75rem)] tracking-[0.08em] uppercase"
          style={{
            inset: `${i * 11}% ${i * 11}%`,
            borderColor: i === 3 ? "var(--tone)" : "var(--line-strong)",
            background: i === 3 ? "color-mix(in oklab, var(--tone) 22%, transparent)" : "transparent",
            color: i === 3 ? "var(--fg)" : "var(--fg-muted)",
          }}
        >
          {l}
        </div>
      ))}
      <div className="absolute inset-0 grid place-items-center pt-6 font-mono text-[clamp(0.55rem,1vw,0.75rem)] text-fg-subtle">
        deps → inward
      </div>
    </div>
  );
}

function Route() {
  return (
    <svg viewBox="0 0 400 260" className="w-[min(90%,32rem)]">
      <path
        d="M30 210 C 90 200, 80 120, 150 120 S 230 60, 270 90 S 340 170, 370 50"
        fill="none"
        stroke="var(--tone)"
        strokeWidth="2.5"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />
      {[
        [30, 210, "WAREHOUSE"],
        [150, 120, "HUB"],
        [270, 90, "EN ROUTE"],
        [370, 50, "DELIVERED"],
      ].map(([x, y, t], i) => (
        <g key={i}>
          <circle cx={x as number} cy={y as number} r="7" fill="var(--bg)" stroke="var(--tone)" strokeWidth="2" />
          <circle cx={x as number} cy={y as number} r="2.5" fill="var(--tone)" />
          <text
            x={(x as number) + (i === 3 ? -12 : 12)}
            y={(y as number) + (i === 0 ? -14 : 22)}
            textAnchor={i === 3 ? "end" : "start"}
            className="fill-[var(--fg-muted)] font-mono text-[10px] tracking-[0.1em]"
          >
            {t}
          </text>
        </g>
      ))}
    </svg>
  );
}
