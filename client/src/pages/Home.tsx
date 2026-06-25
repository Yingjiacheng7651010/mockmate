import { useEffect, useState } from 'react';

type Props = {
  user: {id:number, email:string}
  onLogout: () => void;
};

function Home({ user, onLogout }: Props) {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/auto/me', {
        headers: {Authorization: `Bearer ${token}`},
    })
      .then((res) => res.json())
      .then((data) => setMe(data.user))
      .catch(() => setMe(null));
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' ,textAlign:'center'}}>
      <h2>Welcome back {user.email}</h2>
      <p>MockMate 模拟面试平台 - 你已成功登录</p>
      {me && (
         <div style={{ background: '#f0f0f0', padding: 10, marginTop: 10 }}>
          <p>受保护接口验证通过：</p>
          <p>ID: {me.id}, Email: {me.email}</p>
        </div>
      )}
      <button
        onClick={onLogout}
          style={{ marginTop: 20, padding: '8px 16px', background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer' }}>
          退出登录
      </button>
    </div>
  );
}

export default Home;
