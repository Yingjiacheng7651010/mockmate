"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openai_1 = __importDefault(require("openai"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});
// ========== 面试开始 ==========
router.post('/start', auth_1.authenticateToken, async (req, res) => {
    const { position, stack, difficulty } = req.body;
    const user = req.user;
    try {
        const interview = await prisma.interview.create({
            data: { userId: user.id, position, stack, difficulty },
        });
        res.json({ interviewId: interview.id });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ========== 保存一道问答 ==========
router.post('/:id/question', auth_1.authenticateToken, async (req, res) => {
    console.log('==== 路由被触发了 ====');
    const interviewId = parseInt(req.params.id);
    const { questionText, answerText, feedback, score, scores } = req.body;
    console.log('接收到的数据:', { interviewId, questionText, answerText, feedback, score, scores });
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });
    if (!interview || interview.userId !== req.user.id) {
        return res.status(403).json({ error: '无权操作' });
    }
    const createData = {
        interviewId,
        questionText: String(questionText),
        answerText: answerText || null,
        feedback: feedback || null,
        score: score != null ? Math.floor(Number(score)) : null,
        scores: scores ? JSON.stringify(scores) : null, // 必须存在
    };
    try {
        console.log('即将写入数据库的数据:', JSON.stringify(createData, null, 2));
        await prisma.question.create({ data: createData });
        console.log('问答保存成功');
        res.json({ success: true });
    }
    catch (error) {
        console.error('创建 Question 失败:', error);
        res.status(500).json({ error: error.message });
    }
});
// ========== 历史列表 ==========
router.get('/list', auth_1.authenticateToken, async (req, res) => {
    const user = req.user;
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
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    const interviewId = parseInt(req.params.id);
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: { questions: true },
    });
    if (!interview || interview.userId !== req.user.id) {
        return res.status(403).json({ error: '无权查看' });
    }
    res.json({ interview });
});
// ========== 原有：生成题目 ==========
router.post('/generate', auth_1.authenticateToken, async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ========== 原有：评估答案（流式） ==========
router.post('/evaluate', auth_1.authenticateToken, async (req, res) => {
    const { question, answer, position, stack } = req.body;
    const prompt = `面试题：${question}\n候选人回答：${answer}\n你是面试官，请评估这个回答（1-10分），并给出简短的改进建议。然后根据回答情况，要么提出一个追问，要么结束面试并给出最终评语。请按以下格式回答：

分数：X/10
建议：...
追问/结束语：...

最后，请务必在回答的最后单独一行附加一个 JSON 对象表示各维度评分（技术深度、表达沟通、问题拆解、综合），用 <<SCORES>> 和 <<ENDSCORES>> 包裹，例如：
<<SCORES>>{"技术深度":8,"表达沟通":7,"问题拆解":9,"综合":8}<<ENDSCORES>>`;
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
    }
    catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});
exports.default = router;
