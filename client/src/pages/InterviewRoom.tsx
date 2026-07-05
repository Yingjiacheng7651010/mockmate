import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

type Config = { position: string; stack: string; difficulty: string };

function InterviewRoom({ config, interviewId, onEnd }: { config: Config; interviewId: number; onEnd: () => void }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = async () => {
    setFeedback('');
    setAnswer('');
    setStreaming(false);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/interview/generate`, {
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

  // 保存当前问答到后端
  const saveCurrentQuestion = async (q: string, a: string, fb: string, scoresObj: Record<string, number> | null) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('无 token，无法保存');
    return;
  }

  const score = scoresObj
    ? scoresObj['综合'] || Math.round(Object.values(scoresObj).reduce((s, v) => s + v, 0) / Object.values(scoresObj).length)
    : null;

  const payload: any = {
    questionText: q,
    answerText: a,
    feedback: fb,
    score,
  };

  // 只有 scoresObj 不为 null 时才添加 scores 字段
  if (scoresObj) {
    payload.scores = scoresObj; // 直接传对象，后端会 JSON.stringify
  }

  console.log('即将发送的 payload:', payload);

  try {
    const res = await fetch(`http://localhost:3001/api/interview/${interviewId}/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error('保存问答失败：', result);
    } else {
      console.log('问答保存成功，服务器返回:', result);
    }
  } catch (err) {
    console.error('保存问答网络错误', err);
  }
};

  const submitAnswer = async () => {
  setLoading(true);
  setFeedback('');
  setStreaming(true);
  const token = localStorage.getItem('token');
  let fullFeedback = '';
  let scores: Record<string, number> | null = null;

  // 保存当前问题和回答的快照（避免闭包问题）
  const currentQuestion = question;
  const currentAnswer = answer;

  try {
    const response = await fetch('http://localhost:3001/api/interview/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question: currentQuestion, answer: currentAnswer, position: config.position, stack: config.stack }),
    });

    if (!response.ok) throw new Error('请求失败');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取流');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') {
            const match = fullFeedback.match(/<<SCORES>>(.*?)<<ENDSCORES>>/s);
            if (match) {
              try {
                scores = JSON.parse(match[1]);
                fullFeedback = fullFeedback.replace(/<<SCORES>>.*?<<ENDSCORES>>/s, '').trim();
              } catch (e) {
                console.error('解析评分失败', e);
              }
            }
            setFeedback(fullFeedback); // 这里 fullFeedback 已是清理后的
            setStreaming(false);
            await saveCurrentQuestion(currentQuestion, currentAnswer, fullFeedback, scores);
            continue;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              fullFeedback += `\n错误：${parsed.error}`;
              setFeedback(prev => prev + `\n错误：${parsed.error}`);
              setStreaming(false);
            } else if (parsed.content) {
              fullFeedback += parsed.content;
              setFeedback(prev => prev + parsed.content);
            }
          } catch (e) {}
        }
      }
    }
    setRound(prev => prev + 1);
  } catch (err: any) {
    setFeedback(prev => prev + `\n请求异常：${err.message}`);
  } finally {
    setLoading(false);
    setStreaming(false);
  }
  };

  

  const handleNext = () => {
    if (feedback.includes('结束') || feedback.includes('最终评语')) {
      onEnd();
    } else {
      generateQuestion();
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>🤖 AI 面试官</h2>
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
        {loading && streaming ? 'AI 正在回答...' : loading ? '评估中...' : '提交答案'}
      </button>
      {feedback && (
        <div style={{ background: '#e6fffa', padding: 12, marginTop: 12, whiteSpace: 'pre-wrap' }}>
          <strong>AI 反馈：</strong>
          <p>{feedback}{streaming && <span style={{ color: '#4F46E5' }}>▌</span>}</p>
          {!streaming && (
            <button onClick={handleNext} style={{ marginTop: 8, padding: 8, background: '#4F46E5', color: '#fff', border: 'none' }}>
              {feedback.includes('结束') ? '结束面试' : '下一题'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default InterviewRoom;