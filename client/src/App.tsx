import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom from './pages/InterviewRoom';
import InterviewList from './pages/InterviewList';
import InterviewDetail from './pages/InterviewDetail';

type User = { id: number; email: string };
type Page = 'login' | 'register' | 'home' | 'setup' | 'interview' | 'history' | 'detail';

function App() {
  const [page, setPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [interviewConfig, setInterviewConfig] = useState<any>(null);
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [viewInterviewId, setViewInterviewId] = useState<number | null>(null);

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
    localStorage.removeItem('token');
  };

  const handleStartInterview = () => setPage('setup');

  const handleInterviewStart = (config: any, id: number) => {
    setInterviewConfig(config);
    setInterviewId(id);
    setPage('interview');
  };

  const handleInterviewEnd = () => setPage('home');

  const goHistory = () => setPage('history');
  const goBackHome = () => setPage('home');
  const goViewDetail = (id: number) => {
    setViewInterviewId(id);
    setPage('detail');
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      {page === 'login' && (
        <Login onSuccess={handleLoginSuccess} goRegister={() => setPage('register')} />
      )}
      {page === 'register' && (
        <Register onSuccess={() => setPage('login')} goLogin={() => setPage('login')} />
      )}
      {page === 'home' && user && (
        <Home
          user={user}
          onLogout={handleLogout}
          onStartInterview={handleStartInterview}
          goHistory={goHistory}
        />
      )}
      {page === 'setup' && (
        <InterviewSetup onStart={handleInterviewStart} />
      )}
      {page === 'interview' && interviewConfig && interviewId && (
        <InterviewRoom config={interviewConfig} interviewId={interviewId} onEnd={handleInterviewEnd} />
      )}
      {page === 'history' && (
        <InterviewList onBack={goBackHome} onViewDetail={goViewDetail} />
      )}
      {page === 'detail' && viewInterviewId && (
        <InterviewDetail interviewId={viewInterviewId} onBack={() => setPage('history')} />
      )}
    </div>
  );
}

export default App;