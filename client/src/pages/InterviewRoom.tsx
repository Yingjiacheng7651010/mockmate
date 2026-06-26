import { useState, useEffect } from 'react';

type Config = { position: string; stack: string; difficulty: string };

function InterviewRoom({ config, onEnd }: { config: Config; onEnd: () => void }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = async () => {
    setFeedback('');
    setAnswer('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3001/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setQuestion(data.question);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3001/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question, answer, ...config }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
      setRound(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // 如果反馈里包含“结束”，则结束面试，否则生成新题
    if (feedback.includes('结束') || feedback.includes('最终评语')) {
      onEnd();
    } else {
      generateQuestion();
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2> AI 面试官</h2>
      <p><strong>职位：</strong>{config.position} | {config.stack} | {config.difficulty}</p>
      <div style={{ background: '#f0f0f0', padding: 12, margin: '12px 0' }}>
        <p><strong>第 {round + 1} 题：</strong>{question}</p>
      </div>
      <textarea
        rows={4}
        placeholder="输入你的回答..."
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        style={{ width: '100%', padding: 8 }}
        disabled={loading}
      />
      <button
        onClick={submitAnswer}
        disabled={loading || !answer.trim()}
        style={{ marginTop: 8, padding: 10, background: '#10B981', color: '#fff', border: 'none', width: '100%' }}
      >
        {loading ? '评估中...' : '提交答案'}
      </button>
      {feedback && (
        <div style={{ background: '#e6fffa', padding: 12, marginTop: 12, whiteSpace: 'pre-wrap' }}>
          <strong>AI 反馈：</strong>
          <p>{feedback}</p>
          <button onClick={handleNext} style={{ marginTop: 8, padding: 8, background: '#4F46E5', color: '#fff', border: 'none' }}>
            {feedback.includes('结束') ? '结束面试' : '下一题'}
          </button>
        </div>
      )}
    </div>
  );
}

export default InterviewRoom;