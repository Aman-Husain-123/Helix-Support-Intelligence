import React, { useState } from 'react';
import './index.css';
import { AuthProvider, useUser, type Role } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CustomerView } from './pages/CustomerView';
import { AdminView } from './pages/AdminView';
import { ShellLayout } from './components/layout/ShellLayout';
import { Sidebar } from './components/layout/Sidebar';
import { ChatWorkspace } from './components/chat/ChatWorkspace';
import { RightPanel } from './components/right-panel/RightPanel';

export interface AppState {
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
}

const ProtectedRoute: React.FC<{ allowedRoles: Role[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { user, requireRole, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <svg className="h-6 w-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
        </svg>
      </div>
    );
  }

  if (!user) return <AuthRouter />;

  // User logged in but wrong role
  if (!requireRole(allowedRoles)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-slate-100 font-sans">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-400">You do not have permission to view this area.</p>
      </div>
    );
  }

  return <>{children}</>;
};

const AuthRouter: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  if (view === 'signup') return <SignupPage onNavigateLogin={() => setView('login')} />;
  return <LoginPage onNavigateSignup={() => setView('signup')} />;
};

const MainRouter: React.FC = () => {
  const { user, isLoading } = useUser();
  const [activeConversationId, setActiveConversationId] = useState<string>('TCK-4821');

  if (isLoading) {
    return <div className="h-screen bg-background" />;
  }

  if (!user) return <AuthRouter />;

  if (user.role === 'customer') {
    return <ProtectedRoute allowedRoles={['customer']}><CustomerView /></ProtectedRoute>;
  }

  if (user.role === 'admin') {
    return <ProtectedRoute allowedRoles={['admin']}><AdminView /></ProtectedRoute>;
  }

  // Agent (default fallback for agents)
  return (
    <ProtectedRoute allowedRoles={['agent', 'admin']}>
      <ShellLayout
        sidebar={
          <Sidebar
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
          />
        }
        main={<ChatWorkspace conversationId={activeConversationId} />}
        rightPanel={<RightPanel conversationId={activeConversationId} />}
      />
    </ProtectedRoute>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TicketProvider>
        <MainRouter />
      </TicketProvider>
    </AuthProvider>
  );
};

export default App;
