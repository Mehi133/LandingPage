
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  onClose?: () => void;
}

interface ModalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ModalErrorBoundary extends React.Component<ModalErrorBoundaryProps, ModalErrorBoundaryState> {
  constructor(props: ModalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("🚨 Modal Error Boundary caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 Modal Error Details:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Something went wrong
            </h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the property details. Please try again.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              {this.props.onClose && (
                <Button onClick={this.props.onClose} variant="default" size="sm">
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
