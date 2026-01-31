import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", backgroundColor: "#1e293b", color: "#f8fafc", fontFamily: "sans-serif", height: "100vh" }}>
          <h1 style={{ color: "#ef4444" }}>Ops! Qualcosa si è rotto.</h1>
          <p>Ecco l'errore (fai uno screenshot e mandalo allo sviluppatore):</p>
          <pre style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "8px", overflow: "auto", border: "1px solid #334155" }}>
            {this.state.error?.toString()}
            <br />
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: "20px", padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Ricarica Pagina
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
