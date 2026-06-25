"use client";

import { useCallback, useState } from "react";
import {
  addEdge, Background, BackgroundVariant, Controls, Handle, MarkerType,
  Position, ReactFlow, useEdgesState, useNodesState,
  type Connection, type Edge, type Node, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type IvrData = { label: string; sub?: string; kind?: "start" | "menu" | "bot" | "queue" | "end"; active?: boolean };

function IvrNode({ data }: NodeProps) {
  const d = data as IvrData;
  const color =
    d.kind === "start" ? "var(--brand-green)"
    : d.kind === "bot" ? "var(--brand-sky)"
    : d.kind === "end" ? "var(--brand-orange)"
    : "var(--brand-sky)";
  return (
    <div
      className="rounded-lg border bg-card px-3 py-2 text-left shadow-lg transition"
      style={{
        borderColor: d.active ? "var(--brand-orange)" : "var(--border)",
        boxShadow: d.active ? "0 0 0 1px var(--brand-orange), 0 0 24px rgba(255,79,31,0.35)" : undefined,
        minWidth: 150,
      }}
    >
      {d.kind !== "start" && <Handle type="target" position={Position.Left} style={{ background: color }} />}
      <div className="mono text-[0.6rem] tracking-[0.16em]" style={{ color }}>
        {(d.kind ?? "step").toUpperCase()}
      </div>
      <div className="text-sm font-semibold text-foreground">{d.label}</div>
      {d.sub && <div className="text-[0.7rem] text-muted-foreground">{d.sub}</div>}
      {d.kind !== "end" && <Handle type="source" position={Position.Right} style={{ background: color }} />}
    </div>
  );
}

const nodeTypes = { ivr: IvrNode };

const initialNodes: Node[] = [
  { id: "start", type: "ivr", position: { x: 0, y: 160 }, data: { label: "Inbound Call", sub: "DNIS · 1-800", kind: "start" } },
  { id: "welcome", type: "ivr", position: { x: 210, y: 160 }, data: { label: "Welcome Prompt", sub: "TTS greeting" } },
  { id: "menu", type: "ivr", position: { x: 420, y: 160 }, data: { label: "Main Menu", sub: "Press 1–3", kind: "menu" } },
  { id: "billing", type: "ivr", position: { x: 660, y: 40 }, data: { label: "Billing", sub: "Queue · skill route", kind: "queue" } },
  { id: "bot", type: "ivr", position: { x: 660, y: 160 }, data: { label: "AI Bot — Support", sub: "Dialogflow · self-serve", kind: "bot" } },
  { id: "sales", type: "ivr", position: { x: 660, y: 280 }, data: { label: "Sales", sub: "Queue · priority", kind: "queue" } },
  { id: "survey", type: "ivr", position: { x: 900, y: 160 }, data: { label: "Post-call Survey", sub: "AI scoring", kind: "end" } },
];

const E = (id: string, source: string, target: string, label?: string): Edge => ({
  id, source, target, label,
  markerEnd: { type: MarkerType.ArrowClosed, color: "#3a5a82" },
  style: { stroke: "#3a5a82", strokeWidth: 1.5 },
  labelStyle: { fill: "#9fb3c8", fontSize: 10, fontFamily: "var(--font-mono)" },
});

const initialEdges: Edge[] = [
  E("e1", "start", "welcome"),
  E("e2", "welcome", "menu"),
  E("e3", "menu", "billing", "1"),
  E("e4", "menu", "bot", "2"),
  E("e5", "menu", "sales", "3"),
  E("e6", "billing", "survey"),
  E("e7", "bot", "survey"),
  E("e8", "sales", "survey"),
];

const ROUTES: Record<string, { nodes: string[]; edges: string[] }> = {
  billing: { nodes: ["start", "welcome", "menu", "billing", "survey"], edges: ["e1", "e2", "e3", "e6"] },
  bot: { nodes: ["start", "welcome", "menu", "bot", "survey"], edges: ["e1", "e2", "e4", "e7"] },
  sales: { nodes: ["start", "welcome", "menu", "sales", "survey"], edges: ["e1", "e2", "e5", "e8"] },
};

export default function Playground() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [running, setRunning] = useState(false);

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge({ ...E("e" + Date.now(), c.source!, c.target!) }, eds)),
    [setEdges],
  );

  const runCall = useCallback(() => {
    if (running) return;
    setRunning(true);
    const keys = Object.keys(ROUTES);
    const route = ROUTES[keys[Math.floor(Math.random() * keys.length)]];
    // light up nodes/edges step by step
    route.nodes.forEach((nid, i) => {
      setTimeout(() => {
        setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: n.id === nid } })));
        setEdges((eds) => eds.map((e) => ({
          ...e,
          animated: route.edges.includes(e.id) && route.edges.indexOf(e.id) < i,
          style: { ...e.style, stroke: route.edges.includes(e.id) && route.edges.indexOf(e.id) < i ? "#ff4f1f" : "#3a5a82" },
        })));
      }, i * 700);
    });
    setTimeout(() => {
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: false } })));
      setEdges((eds) => eds.map((e) => ({ ...e, animated: false, style: { ...e.style, stroke: "#3a5a82" } })));
      setRunning(false);
    }, route.nodes.length * 700 + 900);
  }, [running, setNodes, setEdges]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mono mb-1 text-[0.66rem] tracking-[0.2em] text-[var(--brand-sky)]">&gt; INTERACTIVE</div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Build a call flow</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            A Genesys-Architect-style IVR. Drag nodes, connect handles, then run a call to watch it route — the kind of flow I design for enterprise contact centers.
          </p>
        </div>
        <button
          onClick={runCall}
          disabled={running}
          className="mono rounded-lg border border-[var(--brand-orange)]/40 bg-[var(--brand-orange)]/10 px-4 py-2 text-sm tracking-[0.12em] text-[var(--brand-orange)] transition enabled:hover:bg-[var(--brand-orange)]/20 disabled:opacity-50"
        >
          {running ? "ROUTING…" : "▶ RUN CALL"}
        </button>
      </div>

      <div className="h-[520px] overflow-hidden rounded-xl border border-border bg-card/30">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          colorMode="dark"
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#1b3050" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
