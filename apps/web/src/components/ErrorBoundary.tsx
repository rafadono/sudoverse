import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('SudoVerse crashed:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="app error-boundary">
        <section className="header">
          <h1>SudoVerse 🧩</h1>
        </section>
        <section className="status">
          <p>
            Something went wrong and the game crashed.
            <br />
            Algo salió mal y el juego se cayó.
          </p>
          <div className="buttons">
            <button type="button" onClick={this.handleReset}>
              Try again / Reintentar
            </button>
            <button type="button" onClick={() => window.location.reload()}>
              Reload / Recargar
            </button>
          </div>
          <details>
            <summary>Details / Detalles</summary>
            <pre>{this.state.error.message}</pre>
          </details>
        </section>
      </main>
    );
  }
}
