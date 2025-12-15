import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center justify-center font-mono">
                    <div className="max-w-2xl w-full bg-red-900/20 border border-red-500 rounded-lg p-6">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">⚠️ 應用程式發生錯誤</h1>
                        <p className="mb-4 text-gray-300">請截圖此畫面傳給工程師：</p>

                        <div className="bg-black/50 p-4 rounded overflow-auto mb-4">
                            <p className="text-red-400 font-bold mb-2">{this.state.error?.toString()}</p>
                            <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded transition-colors"
                        >
                            重新整理頁面
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
