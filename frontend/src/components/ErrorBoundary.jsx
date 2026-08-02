import React from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught UI Exception:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 text-center shadow-lg font-sans">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/30 mb-4">
            <FiAlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Something went wrong rendering this view</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md font-medium">
            An unexpected error occurred. Click below to reload the page or return to safety.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition"
            >
              <FiRefreshCw /> Reload Console
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
