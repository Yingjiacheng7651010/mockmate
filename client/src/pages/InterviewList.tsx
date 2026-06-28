import { useEffect, useState } from 'react';

type InterviewSummary = {
  id: number;
  position: string;
  stack: string;
  difficulty: string;
  createdAt: string;
  _count: { questions: number };
};

function InterviewList({ onBack, onViewDetail }: { onBack: () => void; onViewDetail: (id: number) => void }) {
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/interview/list', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setInterviews(data.interviews);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>📋 面试历史</h2>
      <button onClick={onBack} style={{ marginBottom: 16, padding: '6px 12px', background: '#ccc', border: 'none' }}>← 返回首页</button>
      {loading ? (
        <p>加载中...</p>
      ) : interviews.length === 0 ? (
        <p>暂无面试记录</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {interviews.map((item) => (
            <li
              key={item.id}
              onClick={() => onViewDetail(item.id)}
              style={{
                padding: 12,
                margin: '8px 0',
                background: '#f9f9f9',
                border: '1px solid #ddd',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>{item.position}</strong> - {item.stack} ({item.difficulty})
                <br />
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
              <div>{item._count.questions} 题</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default InterviewList;