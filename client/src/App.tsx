import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

type User = { id: number; email: string };

function App() {
  const [page, setPage] = useState<'login' | 'register' | 'home'>('login');
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
    localStorage.removeItem('token');
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      {page === 'login' && (
        <Login
          onSuccess={handleLoginSuccess}
          goRegister={() => setPage('register')}
        />
      )}
      {page === 'register' && (
        <Register
          onSuccess={() => setPage('login')}
          goLogin={() => setPage('login')}
        />
      )}
      {page === 'home' && user && (
        <Home user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;