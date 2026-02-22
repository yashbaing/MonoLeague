import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0f172a',
          color: '#e2e8f0',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h1 style={{ color: '#f87171', marginBottom: '1rem' }}>Something went wrong</h1>
          <pre style={{
            background: '#1e293b',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '14px',
          }}>
            {this.state.error.message}
          </pre>
          <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
            Check the browser console for details. If using WalletConnect, add VITE_WALLETCONNECT_PROJECT_ID to .env (get one at cloud.walletconnect.com).
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
