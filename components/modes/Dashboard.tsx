"use client";

import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { skills } from "@/lib/data/skills";
import { THEME } from "@/lib/theme";

const SKY = THEME.cyan;
const ORANGE = THEME.violet;
const GREEN = THEME.live;

// Illustrative 24h traffic. Deterministic on purpose — Math.random() made the
// "live" numbers change on every mount, which reads as broken rather than
// illustrative.
const traffic = Array.from({ length: 24 }, (_, h) => {
  const base = 120 + Math.round(140 * Math.sin(((h - 6) / 24) * Math.PI * 2) + 140);
  const jitter = Math.round(15 * (1 + Math.sin(h * 2.3)));
  const calls = Math.max(20, base + jitter);
  const contained = Math.round(calls * (0.55 + 0.2 * Math.sin(h / 5)));
  return { h: `${String(h).padStart(2, "0")}:00`, calls, contained, agent: calls - contained };
});

const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 8);

const KPIS = [
  { label: "CALLS / DAY", value: "4,820", delta: "+12%", color: SKY },
  { label: "SELF-SERVICE CONTAINMENT", value: "63%", delta: "+8 pts", color: GREEN },
  { label: "AVG HANDLE TIME", value: "3m 41s", delta: "-14%", color: ORANGE },
  { label: "CSAT", value: "4.6 / 5", delta: "+0.3", color: SKY },
];

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-3xl p-5 ${className}`}>
      <div className="label-xs mb-3 text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

// ── Real site telemetry (from /api/stats) ──
type SiteStats = {
  visits: number; chats: number; tokens: number;
  mode_home: number; mode_dashboard: number; mode_playground: number;
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function RealStats() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s: SiteStats) => { if (alive) setStats(s); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  const val = (n?: number) =>
    stats ? fmt(n ?? 0) : failed ? "—" : <span className="animate-pulse">—</span>;

  return (
    <>
      <div className="mono mb-1 mt-8 text-[0.66rem] tracking-[0.2em] text-[var(--live)]">&gt; REAL · THIS SITE</div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Panel title="VISITORS">
          <span className="text-2xl font-bold tracking-tight">{val(stats?.visits)}</span>
        </Panel>
        <Panel title="TALKED TO MY PORTFOLIO">
          <span className="text-2xl font-bold tracking-tight">{val(stats?.chats)}</span>
        </Panel>
        <Panel title="TOKENS USED (EST.)">
          <span className="text-2xl font-bold tracking-tight">{val(stats?.tokens)}</span>
        </Panel>
        <Panel title="MODE VIEWS">
          <div className="flex items-end justify-between gap-2">
            {([["HOME", stats?.mode_home], ["DASH", stats?.mode_dashboard], ["PLAY", stats?.mode_playground]] as const).map(([l, n]) => (
              <div key={l} className="text-center">
                <div className="text-lg font-semibold leading-tight">{val(n)}</div>
                <div className="label-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="label-xs mb-1 text-[var(--cyan)]">&gt; COMMAND CENTER</div>
      <h2 className="mb-6 text-3xl font-bold tracking-tight">CX command center</h2>
      <p className="max-w-xl text-sm text-muted-foreground">
        Live telemetry from this portfolio up top — real visitors, agent conversations,
        and token spend. Below it, the kind of contact-center analytics I build on
        Genesys (illustrative numbers; the skill chart is real).
      </p>

      <RealStats />

      {/* Everything below this line is sample data, labelled unmistakably —
          invented metrics next to real telemetry is a credibility risk. */}
      <div className="mt-10 flex flex-wrap items-center gap-2">
        <span className="label-xs rounded-lg border border-[var(--amber)]/40 bg-[var(--amber)]/10 px-2.5 py-1 text-[var(--amber)]">
          Sample data
        </span>
        <span className="label-xs text-muted-foreground">
          Contact-center analytics I build on Genesys — figures below are illustrative
        </span>
      </div>
      <div className="mb-5 mt-4" />

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Panel key={k.label} title={k.label}>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold tracking-tight">{k.value}</span>
              <span className="label-xs" style={{ color: k.color }}>{k.delta}</span>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="CALL VOLUME · 24H (contained vs agent)">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={traffic} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SKY} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={SKY} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORANGE} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={THEME.grid} vertical={false} />
              <XAxis dataKey="h" tick={{ fill: THEME.axis, fontSize: 10 }} interval={3} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: THEME.axis, fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: THEME.surfaceDeep, border: `1px solid ${THEME.grid}`, borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="contained" stroke={SKY} fill="url(#gC)" strokeWidth={2} name="Contained" />
              <Area type="monotone" dataKey="agent" stroke={ORANGE} fill="url(#gA)" strokeWidth={2} name="To agent" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="SKILL PROFICIENCY (real)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topSkills} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" tick={{ fill: THEME.axis, fontSize: 10 }} width={120} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: THEME.surface }} contentStyle={{ background: THEME.surfaceDeep, border: `1px solid ${THEME.grid}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="level" radius={[0, 4, 4, 0]} barSize={12}>
                {topSkills.map((_, i) => (
                  <Cell key={i} fill={i % 2 ? ORANGE : SKY} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Routing health strip */}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {[
          { q: "Billing", wait: "0:18", sla: 96 },
          { q: "Tech Support", wait: "0:42", sla: 88 },
          { q: "Sales", wait: "0:09", sla: 99 },
        ].map((r) => (
          <Panel key={r.q} title={`QUEUE · ${r.q.toUpperCase()}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{r.wait}</div>
                <div className="label-xs text-muted-foreground">AVG WAIT</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold" style={{ color: r.sla > 90 ? GREEN : ORANGE }}>{r.sla}%</div>
                <div className="label-xs text-muted-foreground">SLA</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full" style={{ width: `${r.sla}%`, background: r.sla > 90 ? GREEN : ORANGE }} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
