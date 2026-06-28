import { useEffect, useState } from 'react';

type Props = {
  user: { id: number; email: string };
  onLogout: () => void;
  onStartInterview: () => void;
  goHistory: () => void;   // 新增
};

function Home({ user, onLogout, onStartInterview, goHistory }: Props) {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setMe(data.user))
      .catch(() => setMe(null));
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
      <h2>👋 欢迎回来，{user.email}</h2>
      <p>MockMate 模拟面试平台 —— 你已成功登录。</p>
      {me && (
        <div style={{ background: '#f0f0f0', padding: 10, marginTop: 10 }}>
          <p>✅ 受保护接口验证通过：</p>
          <p>用户 ID：{me.id}，邮箱：{me.email}</p>
        </div>
      )}
      <button
        onClick={onStartInterview}
        style={{ margin: '10px', padding: '10px 20px', background: '#4F46E5', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        🚀 开始模拟面试
      </button>
      <button
        onClick={goHistory}
        style={{ margin: '10px', padding: '10px 20px', background: '#4F46E5', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        📋 历史面试
      </button>
      <button
        onClick={onLogout}
        style={{ margin: '10px', padding: '8px 16px', background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        退出登录
      </button>
    </div>
  );
}

export default Home;