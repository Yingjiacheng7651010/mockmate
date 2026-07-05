import { useEffect, useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { API_BASE } from '../config';

type Question = {
  id: number;
  questionText: string;
  answerText: string | null;
  feedback: string | null;
  score: number | null;
  scores: string | null; // JSON 字符串
};

type Interview = {
  id: number;
  position: string;
  stack: string;
  difficulty: string;
  createdAt: string;
  questions: Question[];
};

function InterviewDetail({ interviewId, onBack }: { interviewId: number; onBack: () => void }) {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/api/interview/${interviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setInterview(data.interview);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [interviewId]);

  if (loading) return <p style={{ textAlign: 'center' }}>加载中...</p>;
  if (!interview) return <p>面试不存在或无权查看</p>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <button onClick={onBack} style={{ marginBottom: 16, padding: '6px 12px', background: '#ccc', border: 'none' }}>
        ← 返回列表
      </button>
      <h2>📄 面试详情</h2>
      <p>
        <strong>职位：</strong>{interview.position} | {interview.stack} | {interview.difficulty}
        <br />
        <small>{new Date(interview.createdAt).toLocaleString()}</small>
      </p>

      {interview.questions.map((q, idx) => {
        // 解析 scores JSON
        let scoresData: { subject: string; score: number }[] | null = null;
        if (q.scores) {
          try {
            const parsed = JSON.parse(q.scores);
            scoresData = Object.entries(parsed).map(([key, value]) => ({
              subject: key,
              score: Number(value),
            }));
          } catch (e) {
            console.error('解析 scores 失败', e);
          }
        }

        return (
          <div key={q.id} style={{ background: '#f9f9f9', margin: '16px 0', padding: 12, border: '1px solid #ddd' }}>
            <h3>第 {idx + 1} 题</h3>
            <p><strong>📝 题目：</strong>{q.questionText}</p>
            <p><strong>💬 你的回答：</strong>{q.answerText || '未回答'}</p>
            <p><strong>🤖 AI 反馈：</strong></p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#e6fffa', padding: 8 }}>{q.feedback || '无反馈'}</pre>
            {q.score !== null && <p>总分：{q.score}/10</p>}

            {/* 雷达图 */}
            {scoresData && (
              <div style={{ width: 300, height: 300, margin: '16px 0' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={scoresData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar name="评分" dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default InterviewDetail;