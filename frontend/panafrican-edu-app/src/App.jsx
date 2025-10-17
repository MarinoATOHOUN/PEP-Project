import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import QuestionsPage from './components/QuestionsPage';
import MentorsPage from './components/MentorsPage';
import BadgesPage from './components/BadgesPage';
import MessagesPage from './components/MessagesPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  // track which conversation/user should be opened when navigating to Messages
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'auth':
        return <AuthPage onLogin={() => setCurrentPage('home')} />;
      case 'register':
        return <AuthPage initialMode="register" onLogin={() => setCurrentPage('home')} />;
      case 'questions':
        return <QuestionsPage />;
      case 'mentors':
        return <MentorsPage onNavigate={setCurrentPage} onOpenConversation={setCurrentConversationId} />;
      case 'badges':
        return <BadgesPage />;
      case 'messages':
        return <MessagesPage initialConversationId={currentConversationId} />;
      case 'opportunities':
        return <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Opportunités</h1>
          <p className="text-muted-foreground">Page en cours de développement...</p>
        </div>;
      case 'profile':
        return <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Mon Profil</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.first_name || user?.username} !</p>
          <p className="text-muted-foreground">Email : {user?.email}</p>
          <Button variant="outline" className="mt-4" onClick={() => { setCurrentPage('home'); logout(); }}>Se déconnecter</Button>
        </div>;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        {currentPage === 'auth' ? (
          <AuthPage />
        ) : (
          <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
            {renderPage()}
          </Layout>
        )}
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
