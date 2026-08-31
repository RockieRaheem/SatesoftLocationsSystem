import * as React from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  theme: Theme;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class FirebaseErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Firebase Error Boundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      let isFirebaseError = false;

      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
          isFirebaseError = true;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${this.props.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
          <div className={`max-w-md w-full p-8 rounded-xl shadow-2xl border ${this.props.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6 mx-auto">
              <Icon name="shield-alert" className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Application Error</h2>
            <p className={`text-center mb-6 ${this.props.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {isFirebaseError ? "There was a problem connecting to the database." : "An unexpected error occurred."}
            </p>
            <div className={`p-4 rounded-lg mb-6 text-sm font-mono break-all ${this.props.theme === 'dark' ? 'bg-slate-950 text-red-400' : 'bg-red-50 text-red-700'}`}>
              {errorMessage}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Icon name="refresh" className="w-5 h-5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FirebaseErrorBoundary;
