
import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Generic error boundary component for catching rendering/runtime errors in child components.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optionally log error to server or external service
    console.error("[ERROR BOUNDARY CAUGHT]:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-300 rounded-xl text-red-800">
          <h2 className="font-bold text-lg mb-2">Something went wrong!</h2>
          <p className="mb-1">{this.state.error?.toString()}</p>
          <details className="text-xs whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</details>
        </div>
      );
    }

    return this.props.children;
  }
}
