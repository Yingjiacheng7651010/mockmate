import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom from './pages/InterviewRoom';

type User = { id: number; email: string };
type Page = 'login' | 'register' | 'home' | 'setup' | 'interview';

function App() {
  const [page, setPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [interviewConfig, setInterviewConfig] = useState<any>(null);

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
   const handleInterviewStart = (config: any) => {
    setInterviewConfig(config);
    setPage('interview');
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
        <Home user={user} onLogout={handleLogout} onStartInterview={handleStartInterview} />
      )}
      {page === 'setup' && (
        <InterviewSetup onStart={handleInterviewStart} />
      )}
      {page === 'interview' && interviewConfig && (
        <InterviewRoom config={interviewConfig} onEnd={() => setPage('home')} />
      )}
    </div>
  );
}

export default App;