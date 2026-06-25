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
  Sparkles, Headset, Users, ClipboardCheck, CheckCircle2, type LucideIcon,
} from "lucide-react";

type Kind = "start" | "prompt" | "menu" | "bot" | "queue" | "end";
type NodeData = { label: string; sub?: string; kind: Kind; icon: LucideIcon; active?: boolean };

const COLOR: Record<Kind, { from: string; to: string; ring: string }> = {
  start: { from: "#34d399", to: "#059669", ring: "var(--brand-green)" },
  prompt: { from: "#38bdf8", to: "#0369a1", ring: "var(--brand-sky)" },
  menu: { from: "#38bdf8", to: "#0369a1", ring: "var(--brand-sky)" },
  bot: { from: "#a78bfa", to: "#6d28d9", ring: "#a78bfa" },
  queue: { from: "#fb923c", to: "#c2410c", ring: "var(--brand-orange)" },
  end: { from: "#fb923c", to: "#c2410c", ring: "var(--brand-orange)" },
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
        minWidth: 168,
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
type Branch = { key: string; id: string; label: string; sub: string; icon: LucideIcon; kind: Kind; choice: string; reply: string };
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
    welcome: { label: "Welcome Prompt", sub: "Azure TTS", icon: Volume2, line: "Thanks for calling. For billing press 1, support press 2, sales press 3." },
    menu: { label: "Main Menu", sub: "DTMF capture", icon: ListTree, prompt: "Waiting for the caller to press a key…" },
    branches: [
      { key: "1", id: "billing", label: "Billing", sub: "Skill queue", icon: Headset, kind: "queue", choice: "Pressed 1", reply: "Connecting you to billing — your wait is under a minute." },
      { key: "2", id: "bot", label: "AI Voice Bot", sub: "Self-service", icon: Sparkles, kind: "bot", choice: "Pressed 2", reply: "Hi, I'm the support assistant. I can reset your PIN or track an order — what do you need?" },
      { key: "3", id: "sales", label: "Sales", sub: "Priority route", icon: Users, kind: "queue", choice: "Pressed 3", reply: "Routing you to a sales specialist now." },
    ],
    end: { label: "Post-call Survey", sub: "AI scoring", icon: ClipboardCheck, line: "Before you go — please rate your experience from 1 to 5." },
  },
  chat: {
    callerName: "VISITOR",
    start: { label: "New Chat", sub: "Web / WhatsApp", icon: MessageSquare },
    welcome: { label: "Greeting", sub: "Bot opener", icon: MessageCircle, line: "Hi! 👋 How can I help — billing, support, or sales?" },
    menu: { label: "Intent Router", sub: "NLU classify", icon: Brain, prompt: "Classifying the visitor's intent…" },
    branches: [
      { key: "1", id: "billing", label: "Billing", sub: "Live agent", icon: Headset, kind: "queue", choice: "Billing", reply: "I'll connect you with a billing specialist — one moment." },
      { key: "2", id: "bot", label: "AI Assistant", sub: "RAG + tools", icon: Sparkles, kind: "bot", choice: "Support", reply: "On it! I can reset your password or check an order status. Which one?" },
      { key: "3", id: "sales", label: "Sales", sub: "Qualify lead", icon: Users, kind: "queue", choice: "Sales", reply: "Great — let me grab a few details and bring in our sales team." },
    ],
    end: { label: "CSAT", sub: "Post-chat", icon: CheckCircle2, line: "Thanks for chatting! How would you rate this conversation?" },
  },
};

function buildGraph(def: FlowDef): { nodes: Node[]; edges: Edge[] } {
  const n = (id: string, x: number, y: number, data: NodeData): Node => ({ id, type: "flow", position: { x, y }, data });
  const nodes: Node[] = [
    n("start", 0, 150, { ...def.start, kind: "start" }),
    n("welcome", 230, 150, { ...def.welcome, kind: "prompt" }),
    n("menu", 460, 150, { ...def.menu, kind: "menu" }),
    n("billing", 720, 20, { ...def.branches[0], kind: def.branches[0].kind }),
    n("bot", 720, 150, { ...def.branches[1], kind: def.branches[1].kind }),
    n("sales", 720, 280, { ...def.branches[2], kind: def.branches[2].kind }),
    n("end", 980, 150, { ...def.end, kind: "end" }),
  ];
  const e = (id: string, s: string, t: string, label?: string): Edge => ({
    id, source: s, target: t, label,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#3a5a82" },
    style: { stroke: "#3a5a82", strokeWidth: 1.5 },
    labelStyle: { fill: "#9fb3c8", fontSize: 11, fontFamily: "var(--font-mono)" },
    labelBgStyle: { fill: "#0b1426" },
  });
  const edges: Edge[] = [
    e("e1", "start", "welcome"),
    e("e2", "welcome", "menu"),
    e("e3", "menu", "billing", def.branches[0].key),
    e("e4", "menu", "bot", def.branches[1].key),
    e("e5", "menu", "sales", def.branches[2].key),
    e("e6", "billing", "end"),
    e("e7", "bot", "end"),
    e("e8", "sales", "end"),
  ];
  return { nodes, edges };
}

type Line = { who: "sys" | "caller" | "bot"; text: string };
const EDGE_OF: Record<string, string> = { billing: "e3", bot: "e4", sales: "e5" };
const ENDEDGE_OF: Record<string, string> = { billing: "e6", bot: "e7", sales: "e8" };

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

  // Rebuild graph when channel changes; reset sim.
  useEffect(() => {
    clearTimers();
    setNodes(initial.nodes);
    setEdges(initial.edges);
    setTranscript([]);
    setAwaiting(false);
    setRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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
      style: { ...e.style, stroke: ids.includes(e.id) ? "#ff4f1f" : "#3a5a82" },
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
    lightEdge(["e1", "e2", EDGE_OF[b.id]]);
    lightNode(b.id);
    after(700, () => setTranscript((t) => [...t, { who: "bot", text: b.reply }]));
    after(1600, () => { lightEdge(["e1", "e2", EDGE_OF[b.id], ENDEDGE_OF[b.id]]); lightNode("end"); });
    after(2300, () => {
      setTranscript((t) => [...t, { who: "bot", text: def.end.line }, { who: "sys", text: mode === "voice" ? "✅ Call complete · CSAT logged" : "✅ Chat resolved · CSAT logged" }]);
      lightNode(null);
      setRunning(false);
    });
  }, [awaiting, def, mode, lightEdge, lightNode]);

  useEffect(() => () => clearTimers(), []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mono mb-1 text-[0.66rem] tracking-[0.2em] text-[var(--brand-sky)]">&gt; INTERACTIVE</div>
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
              onClick={() => setMode(m)}
              className={`mono flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.66rem] tracking-[0.12em] transition ${
                mode === m ? "bg-[var(--brand-sky)]/15 text-[var(--brand-sky)]" : "text-muted-foreground hover:text-foreground"
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
        <div className="h-[440px] overflow-hidden rounded-xl border border-border bg-card/30 lg:h-[520px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            colorMode="dark"
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#1b3050" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        {/* Live simulator */}
        <div className="flex h-[440px] flex-col overflow-hidden rounded-xl border border-border bg-card/40 lg:h-[520px]">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="mono text-[0.64rem] tracking-[0.18em] text-muted-foreground">
              {mode === "voice" ? "LIVE CALL" : "LIVE CHAT"}
            </span>
            <button
              onClick={start}
              disabled={running}
              className="mono rounded-md border border-[var(--brand-orange)]/40 bg-[var(--brand-orange)]/10 px-3 py-1 text-[0.64rem] tracking-[0.12em] text-[var(--brand-orange)] transition enabled:hover:bg-[var(--brand-orange)]/20 disabled:opacity-50"
            >
              {running ? "RUNNING…" : "▶ RUN"}
            </button>
          </div>

          <div ref={scriptRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
            {transcript.length === 0 && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Press <span className="text-[var(--brand-orange)]">▶ RUN</span> to start a{" "}
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
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-left transition hover:border-[var(--brand-sky)]/60 hover:bg-white/[0.06]"
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
                      style={{ background: `linear-gradient(145deg, ${COLOR[b.kind].from}, ${COLOR[b.kind].to})` }}
                    >
                      <b.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {mode === "voice" ? <span className="mono mr-1 text-[var(--brand-sky)]">{b.key}</span> : null}
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
          isBot ? "bg-secondary/60 text-foreground" : "bg-[var(--brand-sky)]/12 text-foreground"
        }`}
      >
        {line.text}
      </p>
    </div>
  );
}
