"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background, BackgroundVariant, Controls, Handle, MarkerType, Position,
  ReactFlow, useEdgesState, useNodesState,
  type Edge, type Node, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  PhoneCall, MessageSquare, Volume2, MessageCircle, ListTree, Brain,
  Briefcase, User, Layers, Mail, ClipboardCheck, CheckCircle2, type LucideIcon,
} from "lucide-react";
import { PROFILE, HIGHLIGHTS } from "@/lib/data/kb";
import { projects } from "@/lib/data/projects";
import { skills } from "@/lib/data/skills";
import { THEME } from "@/lib/theme";

// Real portfolio data, spoken-style.
const TOP_PROJECTS = projects.slice(0, 3).map((p) => p.title).join(", ");
const TOP_SKILLS = [...skills].sort((a, b) => b.level - a.level).slice(0, 5).map((s) => s.name).join(", ");

type Kind = "start" | "prompt" | "menu" | "bot" | "queue" | "end";
type NodeData = { label: string; sub?: string; kind: Kind; icon: LucideIcon; active?: boolean };

const COLOR: Record<Kind, { from: string; to: string; ring: string }> = {
  start: { from: "#4ade80", to: "#15803d", ring: "var(--live)" },
  prompt: { from: "#22d3ee", to: "#0e7490", ring: "var(--cyan)" },
  menu: { from: "#22d3ee", to: "#0e7490", ring: "var(--cyan)" },
  bot: { from: "#a78bfa", to: "#6d28d9", ring: "var(--violet)" },
  queue: { from: "#fbbf24", to: "#b45309", ring: "var(--amber)" },
  end: { from: "#fbbf24", to: "#b45309", ring: "var(--amber)" },
};

// ── 3D-iconed flow node ──
function FlowNode({ data }: NodeProps) {
  const d = data as NodeData;
  const c = COLOR[d.kind];
  const Icon = d.icon;
  return (
    <div
      className="relative flex items-center gap-3 rounded-2xl border bg-card/90 px-3.5 py-3 backdrop-blur transition-all"
      style={{
        minWidth: "min(168px, 44vw)",
        borderColor: d.active ? c.ring : "var(--border)",
        boxShadow: d.active
          ? `0 0 0 1px ${c.ring}, 0 0 28px -4px ${c.ring}, 0 12px 24px -10px rgba(0,0,0,0.7)`
          : "0 10px 24px -14px rgba(0,0,0,0.7)",
        transform: d.active ? "translateY(-2px)" : "none",
      }}
    >
      {d.kind !== "start" && <Handle type="target" position={Position.Left} style={{ background: c.ring }} />}
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
        style={{
          background: `linear-gradient(145deg, ${c.from}, ${c.to})`,
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -3px 6px rgba(0,0,0,0.35), 0 6px 12px -3px ${c.to}aa`,
        }}
      >
        <Icon className="h-5 w-5 drop-shadow" />
      </span>
      <div className="leading-tight">
        <div className="mono text-[0.55rem] tracking-[0.16em]" style={{ color: c.ring }}>{d.kind.toUpperCase()}</div>
        <div className="text-sm font-semibold text-foreground">{d.label}</div>
        {d.sub && <div className="text-[0.68rem] text-muted-foreground">{d.sub}</div>}
      </div>
      {d.kind !== "end" && <Handle type="source" position={Position.Right} style={{ background: c.ring }} />}
    </div>
  );
}

const nodeTypes = { flow: FlowNode };

// ── Flow content per channel (voice IVR vs chat) ──
type Branch = { key: string; id: string; label: string; sub: string; icon: LucideIcon; kind: Kind; choice: string; reply: string; reply2?: string };
type FlowDef = {
  start: { label: string; sub: string; icon: LucideIcon };
  welcome: { label: string; sub: string; icon: LucideIcon; line: string };
  menu: { label: string; sub: string; icon: LucideIcon; prompt: string };
  branches: Branch[];
  end: { label: string; sub: string; icon: LucideIcon; line: string };
  callerName: string;
};

const FLOWS: Record<"voice" | "chat", FlowDef> = {
  voice: {
    callerName: "CALLER",
    start: { label: "Inbound Call", sub: "DNIS · 1-800", icon: PhoneCall },
    welcome: { label: "Welcome Prompt", sub: "Azure TTS", icon: Volume2, line: "Thanks for calling Vaibhav's portfolio. For selected work press 1, about Vaibhav press 2, tech stack press 3, contact press 4." },
    menu: { label: "Main Menu", sub: "DTMF capture", icon: ListTree, prompt: "Waiting for the caller to press a key…" },
    branches: [
      { key: "1", id: "work", label: "Work", sub: "Case studies", icon: Briefcase, kind: "queue", choice: "Pressed 1", reply: `I've shipped ${projects.length} flagship builds — ${TOP_PROJECTS}, and more.`, reply2: "Full case studies are in the Work section of this site." },
      { key: "2", id: "about", label: "About", sub: "Bio & experience", icon: User, kind: "bot", choice: "Pressed 2", reply: `I'm ${PROFILE.name} — ${PROFILE.experienceYears} years on Genesys Cloud, currently ${PROFILE.role}, based in ${PROFILE.location}.`, reply2: HIGHLIGHTS[1] },
      { key: "3", id: "stack", label: "Stack", sub: `${skills.length} skills`, icon: Layers, kind: "prompt", choice: "Pressed 3", reply: `Core stack: ${TOP_SKILLS}.`, reply2: "The full skill matrix is in the Stack section." },
      { key: "4", id: "contact", label: "Contact", sub: "Email & LinkedIn", icon: Mail, kind: "queue", choice: "Pressed 4", reply: `Reach me at ${PROFILE.email}, or connect on LinkedIn.`, reply2: PROFILE.availability },
    ],
    end: { label: "Wrap-up", sub: "CSAT · AI scoring", icon: ClipboardCheck, line: "Anything else? Run the flow again — and rate this portfolio 5 stars on your way out." },
  },
  chat: {
    callerName: "VISITOR",
    start: { label: "New Chat", sub: "Web / WhatsApp", icon: MessageSquare },
    welcome: { label: "Greeting", sub: "Bot opener", icon: MessageCircle, line: "Hi! 👋 I'm Vaibhav's portfolio bot — want to see his work, learn about him, browse his tech stack, or get in touch?" },
    menu: { label: "Intent Router", sub: "NLU classify", icon: Brain, prompt: "Classifying the visitor's intent…" },
    branches: [
      { key: "1", id: "work", label: "Work", sub: "Case studies", icon: Briefcase, kind: "queue", choice: "Show me the work", reply: `He's shipped ${projects.length} flagship builds — ${TOP_PROJECTS}, and more.`, reply2: "Full case studies live in the Work section of this site." },
      { key: "2", id: "about", label: "About", sub: "Bio & experience", icon: User, kind: "bot", choice: "About Vaibhav", reply: `${PROFILE.name} — ${PROFILE.experienceYears} years on Genesys Cloud, currently ${PROFILE.role}, based in ${PROFILE.location}.`, reply2: HIGHLIGHTS[1] },
      { key: "3", id: "stack", label: "Stack", sub: `${skills.length} skills`, icon: Layers, kind: "prompt", choice: "Tech stack", reply: `Core stack: ${TOP_SKILLS}.`, reply2: "The full skill matrix is in the Stack section." },
      { key: "4", id: "contact", label: "Contact", sub: "Email & LinkedIn", icon: Mail, kind: "queue", choice: "Get in touch", reply: `Email ${PROFILE.email}, or connect on LinkedIn.`, reply2: PROFILE.availability },
    ],
    end: { label: "CSAT", sub: "Post-chat", icon: CheckCircle2, line: "Thanks for stopping by! How would you rate this portfolio?" },
  },
};

function buildGraph(def: FlowDef): { nodes: Node[]; edges: Edge[] } {
  const n = (id: string, x: number, y: number, data: NodeData): Node => ({ id, type: "flow", position: { x, y }, data });
  // Branches stack at x=720; the spine (start → welcome → menu → end) sits
  // vertically centered against them.
  const midY = ((def.branches.length - 1) * 105) / 2;
  const nodes: Node[] = [
    n("start", 0, midY, { ...def.start, kind: "start" }),
    n("welcome", 230, midY, { ...def.welcome, kind: "prompt" }),
    n("menu", 460, midY, { ...def.menu, kind: "menu" }),
    ...def.branches.map((b, i) => n(b.id, 720, i * 105, { ...b, kind: b.kind })),
    n("end", 980, midY, { ...def.end, kind: "end" }),
  ];
  const e = (id: string, s: string, t: string, label?: string): Edge => ({
    id, source: s, target: t, label,
    markerEnd: { type: MarkerType.ArrowClosed, color: THEME.grid },
    style: { stroke: THEME.grid, strokeWidth: 1.5 },
    labelStyle: { fill: THEME.axis, fontSize: 11, fontFamily: "var(--font-mono)" },
    labelBgStyle: { fill: THEME.surfaceDeep },
  });
  const edges: Edge[] = [
    e("e1", "start", "welcome"),
    e("e2", "welcome", "menu"),
    ...def.branches.flatMap((b) => [
      e(`m-${b.id}`, "menu", b.id, b.key),
      e(`${b.id}-end`, b.id, "end"),
    ]),
  ];
  return { nodes, edges };
}

type Line = { who: "sys" | "caller" | "bot"; text: string };

export default function Playground() {
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const def = FLOWS[mode];
  const initial = useMemo(() => buildGraph(def), [def]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [transcript, setTranscript] = useState<Line[]>([]);
  const [awaiting, setAwaiting] = useState(false);
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scriptRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); };

  // Rebuild graph and reset the sim when the channel changes (event handler,
  // not an effect — avoids cascading setState-in-effect renders).
  const switchMode = useCallback((m: "voice" | "chat") => {
    clearTimers();
    setMode(m);
    const g = buildGraph(FLOWS[m]);
    setNodes(g.nodes);
    setEdges(g.edges);
    setTranscript([]);
    setAwaiting(false);
    setRunning(false);
  }, [setNodes, setEdges]);

  useEffect(() => {
    scriptRef.current?.scrollTo({ top: scriptRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  const lightNode = useCallback((id: string | null) => {
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: n.id === id } })));
  }, [setNodes]);

  const lightEdge = useCallback((ids: string[]) => {
    setEdges((eds) => eds.map((e) => ({
      ...e,
      animated: ids.includes(e.id),
      style: { ...e.style, stroke: ids.includes(e.id) ? THEME.amber : THEME.grid },
    })));
  }, [setEdges]);

  const start = useCallback(() => {
    clearTimers();
    setRunning(true);
    setAwaiting(false);
    setTranscript([{ who: "sys", text: mode === "voice" ? "📞 Call connected" : "💬 Chat started" }]);
    lightNode("start");
    lightEdge([]);
    after(700, () => { lightNode("welcome"); lightEdge(["e1"]); });
    after(1500, () => {
      lightEdge(["e1", "e2"]);
      lightNode("menu");
      setTranscript((t) => [...t, { who: "bot", text: def.welcome.line }]);
    });
    after(2300, () => {
      setTranscript((t) => [...t, { who: "sys", text: def.menu.prompt }]);
      setAwaiting(true); // wait for the user to choose
    });
  }, [mode, def, lightNode, lightEdge]);

  const choose = useCallback((b: Branch) => {
    if (!awaiting) return;
    setAwaiting(false);
    setTranscript((t) => [...t, { who: "caller", text: `${def.callerName}: ${b.choice}` }]);
    lightEdge(["e1", "e2", `m-${b.id}`]);
    lightNode(b.id);
    after(700, () => setTranscript((t) => [...t, { who: "bot", text: b.reply }]));
    if (b.reply2) {
      const extra = b.reply2;
      after(1600, () => setTranscript((t) => [...t, { who: "bot", text: extra }]));
    }
    after(2400, () => { lightEdge(["e1", "e2", `m-${b.id}`, `${b.id}-end`]); lightNode("end"); });
    after(3100, () => {
      setTranscript((t) => [...t, { who: "bot", text: def.end.line }, { who: "sys", text: mode === "voice" ? "✅ Call complete · CSAT logged" : "✅ Chat resolved · CSAT logged" }]);
      lightNode(null);
      setRunning(false);
    });
  }, [awaiting, def, mode, lightEdge, lightNode]);

  useEffect(() => () => clearTimers(), []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="label-xs mb-1 text-[var(--cyan)]">&gt; INTERACTIVE</div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Build &amp; run a flow</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            A Genesys-Architect-style flow for voice and chat. Drag the nodes, then run it
            and pick a route — watch the call/chat play out live, just like the contact-center
            journeys I design.
          </p>
        </div>
        {/* Channel toggle */}
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {(["voice", "chat"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              aria-pressed={mode === m}
              aria-label={`Switch to ${m} flow`}
              className={`focus-ring mono flex min-h-9 items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.66rem] tracking-[0.12em] transition ${
                mode === m ? "bg-[var(--cyan)]/15 text-[var(--cyan)]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "voice" ? <PhoneCall className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        {/* Canvas */}
        <div className="h-[clamp(340px,55vh,440px)] overflow-hidden glass rounded-3xl lg:h-[520px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            colorMode="dark"
            preventScrolling={false}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color={THEME.grid} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        {/* Live simulator */}
        <div className="flex h-[clamp(340px,55vh,440px)] flex-col overflow-hidden glass rounded-3xl lg:h-[520px]">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="label-xs text-muted-foreground">
              {mode === "voice" ? "LIVE CALL" : "LIVE CHAT"}
            </span>
            <button
              onClick={start}
              disabled={running}
              className="focus-ring mono min-h-9 rounded-md border border-[var(--amber)]/40 bg-[var(--amber)]/10 px-3 py-1 text-[0.64rem] tracking-[0.12em] text-[var(--amber)] transition enabled:hover:bg-[var(--amber)]/20 disabled:opacity-50"
            >
              {running ? "RUNNING…" : "▶ RUN"}
            </button>
          </div>

          <div ref={scriptRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
            {transcript.length === 0 && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Press <span className="text-[var(--amber)]">▶ RUN</span> to start a{" "}
                {mode === "voice" ? "call" : "chat"} and route it yourself.
              </p>
            )}
            {transcript.map((l, i) => (
              <Bubble key={i} line={l} />
            ))}

            {/* Interactive menu choices */}
            {awaiting && (
              <div className="space-y-2 pt-1">
                {def.branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => choose(b)}
                    className="focus-ring flex min-h-11 w-full items-center gap-3 rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-left transition hover:border-[var(--cyan)]/60 hover:bg-white/[0.06]"
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
                      style={{ background: `linear-gradient(145deg, ${COLOR[b.kind].from}, ${COLOR[b.kind].to})` }}
                    >
                      <b.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {mode === "voice" ? <span className="mono mr-1 text-[var(--cyan)]">{b.key}</span> : null}
                      {b.label}
                    </span>
                    <span className="mono ml-auto text-[0.6rem] text-muted-foreground">{b.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ line }: { line: Line }) {
  if (line.who === "sys")
    return <p className="mono text-center text-[0.64rem] tracking-wide text-muted-foreground">{line.text}</p>;
  const isBot = line.who === "bot";
  return (
    <div className={isBot ? "" : "text-right"}>
      <span className="mono mb-0.5 block text-[0.56rem] tracking-[0.16em] text-muted-foreground">
        {isBot ? "SYSTEM" : "YOU"}
      </span>
      <p
        className={`inline-block max-w-[88%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isBot ? "bg-secondary/60 text-foreground" : "bg-[var(--cyan)]/12 text-foreground"
        }`}
      >
        {line.text}
      </p>
    </div>
  );
}
