import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-destructive/10 border border-destructive rounded">
          <div className="font-semibold text-destructive">Une erreur est survenue lors du rendu.</div>
          <div className="text-sm text-muted-foreground mt-2">Rechargez la page ou réessayez plus tard.</div>
          <div className="mt-3">
            <button className="px-3 py-1 bg-destructive text-white rounded" onClick={() => window.location.reload()}>Recharger</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
