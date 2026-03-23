import React, { useState } from 'react';
import './index.css';
import { ShellLayout } from './components/layout/ShellLayout';
import { Sidebar } from './components/layout/Sidebar';
import { ChatWorkspace } from './components/chat/ChatWorkspace';
import { RightPanel } from './components/right-panel/RightPanel';

// Global app state types
export interface AppState {
  activeConversationId: number;
  setActiveConversationId: (id: number) => void;
}

const App: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState(1);

  return (
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
  );
};

export default App;
