"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const interview_1 = __importDefault(require("./routes/interview")); // 新增
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
const PORT = process.env.PORT || 3001;
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mockmate-dev-secret';
// 注册
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });
        res.json({ message: '注册成功', user: { id: user.id, email: user.email } });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 登录
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: '邮箱或密码错误' });
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ error: '邮箱或密码错误' });
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: '登录成功', token, user: { id: user.id, email: user.email } });
});
// 面试路由
app.use('/api/interview', interview_1.default);
app.listen(PORT, () => console.log(`后端已启动 http://localhost:${PORT}`));
