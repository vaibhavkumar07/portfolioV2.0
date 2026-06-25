"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { skills } from "@/lib/data/skills";

const SKY = "#0ea5e9";
const ORANGE = "#ff4f1f";
const GREEN = "#22c55e";

// Illustrative 24h traffic for a contact-center command-center view.
const traffic = Array.from({ length: 24 }, (_, h) => {
  const base = 120 + Math.round(140 * Math.sin((h - 6) / 24 * Math.PI * 2) + 140);
  const calls = Math.max(20, base + Math.round(Math.random() * 30));
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
    <div className={`rounded-xl border border-border bg-card/40 p-4 ${className}`}>
      <div className="mono mb-3 text-[0.64rem] tracking-[0.18em] text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mono mb-1 text-[0.66rem] tracking-[0.2em] text-[var(--brand-sky)]">&gt; LIVE · ILLUSTRATIVE</div>
      <h2 className="mb-6 text-3xl font-bold tracking-tight">CX command center</h2>
      <p className="mb-8 max-w-xl text-sm text-muted-foreground">
        The kind of contact-center analytics I build on Genesys — traffic, containment,
        and routing health at a glance. Numbers here are illustrative; the skill chart is real.
      </p>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Panel key={k.label} title={k.label}>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold tracking-tight">{k.value}</span>
              <span className="mono text-[0.7rem]" style={{ color: k.color }}>{k.delta}</span>
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
              <CartesianGrid stroke="#1b3050" vertical={false} />
              <XAxis dataKey="h" tick={{ fill: "#6b8ba4", fontSize: 10 }} interval={3} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b8ba4", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0b1426", border: "1px solid #1b3050", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="contained" stroke={SKY} fill="url(#gC)" strokeWidth={2} name="Contained" />
              <Area type="monotone" dataKey="agent" stroke={ORANGE} fill="url(#gA)" strokeWidth={2} name="To agent" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="SKILL PROFICIENCY (real)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topSkills} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9fb3c8", fontSize: 10 }} width={120} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "#13233e" }} contentStyle={{ background: "#0b1426", border: "1px solid #1b3050", borderRadius: 8, fontSize: 12 }} />
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
                <div className="mono text-[0.62rem] text-muted-foreground">AVG WAIT</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold" style={{ color: r.sla > 90 ? GREEN : ORANGE }}>{r.sla}%</div>
                <div className="mono text-[0.62rem] text-muted-foreground">SLA</div>
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
