type Props = {
  user: {id:number, email:string}
  onLogout: () => void;
};

function Home({ user, onLogout }: Props) {
  return (
    <div style={{ maxWidth: 400, margin: '40px auto' ,textAlign:'center'}}>
      <h2>Welcome back {user.email}</h2>
      <p>MockMate 模拟面试平台 - 你已成功登录</p>
      <button
        onClick={onLogout}
        style={{ padding: '8px 16px', background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
}

export default Home;
