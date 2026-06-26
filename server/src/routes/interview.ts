import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 初始化 DeepSeek 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});

// 生成面试题
router.post('/generate', authenticateToken, async (req: Request, res: Response) => {
  const { position, stack, difficulty } = req.body;
  const prompt = `你是一位资深技术面试官。请为一位应聘【${position}】岗位、技术栈为【${stack}】的候选人，生成一道${difficulty}难度的面试题。只返回题目本身，不要额外解释。`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',   // DeepSeek 的模型名
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });
    const question = completion.choices[0].message.content;
    res.json({ question });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 评估答案
router.post('/evaluate', authenticateToken, async (req: Request, res: Response) => {
  const { question, answer, position, stack } = req.body;
  const prompt = `面试题：${question}\n候选人回答：${answer}\n你是面试官，请评估这个回答（1-10分），并给出简短的改进建议。然后根据回答情况，要么提出一个追问，要么结束面试并给出最终评语。格式如下：
分数：...
建议：...
追问/结束语：...`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    const feedback = completion.choices[0].message.content;
    res.json({ feedback });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;