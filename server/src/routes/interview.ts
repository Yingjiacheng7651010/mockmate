import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { authenticateToken } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});

// ========== 面试开始 ==========
router.post('/start', authenticateToken, async (req: Request, res: Response) => {
  const { position, stack, difficulty } = req.body;
  const user = (req as any).user;
  try {
    const interview = await prisma.interview.create({
      data: { userId: user.id, position, stack, difficulty },
    });
    res.json({ interviewId: interview.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 保存一道问答 ==========
router.post('/:id/question', authenticateToken, async (req: Request, res: Response) => {
  const interviewId = parseInt(req.params.id as string);
  const { questionText, answerText, feedback, score } = req.body;
  const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
  if (!interview || interview.userId !== (req as any).user.id) {
    return res.status(403).json({ error: '无权操作' });
  }
  try {
    await prisma.question.create({
      data: { interviewId, questionText, answerText, feedback, score },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 历史列表 ==========
router.get('/list', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const interviews = await prisma.interview.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      position: true,
      stack: true,
      difficulty: true,
      createdAt: true,
      _count: { select: { questions: true } },
    },
  });
  res.json({ interviews });
});

// ========== 面试详情 ==========
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  const interviewId = parseInt(req.params.id as string);
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { questions: true },
  });
  if (!interview || interview.userId !== (req as any).user.id) {
    return res.status(403).json({ error: '无权查看' });
  }
  res.json({ interview });
});

// ========== 原有：生成题目 ==========
router.post('/generate', authenticateToken, async (req: Request, res: Response) => {
  const { position, stack, difficulty } = req.body;
  const prompt = `你是一位资深技术面试官。请为一位应聘【${position}】岗位、技术栈为【${stack}】的候选人，生成一道${difficulty}难度的面试题。只返回题目本身，不要额外解释。`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });
    const question = completion.choices[0].message.content;
    res.json({ question });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 原有：评估答案（流式） ==========
router.post('/evaluate', authenticateToken, async (req: Request, res: Response) => {
  const { question, answer, position, stack } = req.body;
  const prompt = `面试题：${question}\n候选人回答：${answer}\n你是面试官，请评估这个回答（1-10分），并给出简短的改进建议。然后根据回答情况，要么提出一个追问，要么结束面试并给出最终评语。格式如下：
分数：...
建议：...
追问/结束语：...`;

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const stream = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;