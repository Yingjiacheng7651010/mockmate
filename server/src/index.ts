import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import interviewRoutes from './routes/interview';  // 新增

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mockmate-dev-secret';

// 注册
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.json({ message: '注册成功', user: { id: user.id, email: user.email } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 登录
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: '邮箱或密码错误' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: '邮箱或密码错误' });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ message: '登录成功', token, user: { id: user.id, email: user.email } });
});

// 面试路由
app.use('/api/interview', interviewRoutes);

app.listen(3001, () => console.log('后端已启动 http://localhost:3001'));