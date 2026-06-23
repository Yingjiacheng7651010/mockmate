import {useEffect,useState} from 'react';

function App() { 
  const [msg, setmsg] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/hello')
      .then((res) => res.json())
      .then((data) => setmsg(data.message))
      .catch(() => setmsg('后端未启动，请检查终端'));
  }, []);
  
  return (
    <div style={{padding: 40,fontFamily: 'sans-serif'}}>
      <h1>mockmate启动成功</h1>
      <p>后端返回: {msg||'加载中...'}</p>
    </div>
  );

}
export default App;