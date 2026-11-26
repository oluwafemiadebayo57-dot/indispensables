import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log this to an error tracking service later if you want
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-brand-orange">
            <div className="text-6xl mb-4">😅</div>
            <h1 className="text-2xl font-bold text-brand-purple mb-2">Oops! Something went wrong.</h1>
            <p className="text-gray-600 mb-6">We hit a small snag. Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-brand-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;