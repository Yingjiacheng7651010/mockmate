import { useState } from 'react';

type Props = {
  onSuccess: (user: { id: number; email: string }) => void;
  goRegister: () => void;
};

function Login({ onSuccess, goRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '登录失败');
      localStorage.setItem('token', data.token);
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '40px auto' }}>
      <h2>MockMate</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10, background: '#4F46E5', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        没有账号？{' '}
        <button onClick={goRegister} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', textDecoration: 'underline' }}>
          去注册
        </button>
      </p>
    </div>
  );
}

export default Login;