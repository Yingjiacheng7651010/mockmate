import { useState } from 'react';

type Props = {
  onStart: (config: any, interviewId: number) => void;
};

const POSITIONS = ['前端开发', '后端开发', '全栈开发', '数据科学'];
const STACKS = ['React + Node.js', 'Vue + Express', 'Python + Django', 'Java + Spring', '任意'];
const DIFFICULTIES = ['初级', '中级', '高级'];

function InterviewSetup({ onStart }: Props) {
  const [position, setPosition] = useState(POSITIONS[0]);
  const [stack, setStack] = useState(STACKS[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3001/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ position, stack, difficulty }),
      });
      const data = await res.json();
      if (data.interviewId) {
        onStart({ position, stack, difficulty }, data.interviewId);
      }
    } catch (err: any) {
      alert('创建面试失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>🎯 配置你的模拟面试</h2>
      <label>目标职位</label>
      <select value={position} onChange={e => setPosition(e.target.value)} style={{ width: '100%', padding: 8, margin: '8px 0' }}>
        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <label>技术栈</label>
      <select value={stack} onChange={e => setStack(e.target.value)} style={{ width: '100%', padding: 8, margin: '8px 0' }}>
        {STACKS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <label>难度</label>
      <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ width: '100%', padding: 8, margin: '8px 0' }}>
        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <button
        onClick={handleStart}
        disabled={loading}
        style={{ width: '100%', marginTop: 16, padding: 10, background: '#4F46E5', color: '#fff', border: 'none' }}
      >
        {loading ? '创建面试中...' : '开始面试'}
      </button>
    </div>
  );
}

export default InterviewSetup;