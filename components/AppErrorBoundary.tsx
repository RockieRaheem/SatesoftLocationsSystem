import React from 'react';
import type { Theme } from '../types.ts';
import Icon from './Icon.tsx';

interface Props { children: React.ReactNode; theme: Theme }
interface State { hasError: boolean; error: Error | null }

class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error boundary caught an error', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const dark = this.props.theme === 'dark';
    const detail = import.meta.env.DEV ? this.state.error?.message : null;
    return <div className={`flex min-h-screen items-center justify-center p-4 ${dark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}><div className={`w-full max-w-md rounded-xl border p-8 shadow-2xl ${dark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}><div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"><Icon name="shield-alert" className="h-8 w-8 text-red-600" /></div><h2 className="mb-4 text-center text-2xl font-bold">Application error</h2><p className={`mb-6 text-center ${dark ? 'text-slate-400' : 'text-slate-600'}`}>The registry could not complete this request. Reload the workspace and try again.</p>{detail && <div className={`mb-6 break-all rounded-lg p-4 font-mono text-sm ${dark ? 'bg-slate-950 text-red-400' : 'bg-red-50 text-red-700'}`}>{detail}</div>}<button onClick={() => window.location.reload()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 font-bold text-emerald-950 transition-colors hover:bg-emerald-400"><Icon name="refresh" className="h-5 w-5" /><span>Reload application</span></button></div></div>;
  }
}

export default AppErrorBoundary;
