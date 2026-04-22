import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div style={{
          position: "fixed", inset: 0, background: "#080c14", color: "#ff4f1f",
          fontFamily: "monospace", padding: "2rem", zIndex: 99999,
          display: "flex", flexDirection: "column", gap: "1rem"
        }}>
          <strong style={{ fontSize: "1.2rem" }}>Runtime Error — check console</strong>
          <pre style={{ fontSize: "0.75rem", color: "#8892a4", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack?.slice(0, 600)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
