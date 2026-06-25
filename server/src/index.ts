import express,{Request,Response}from'express';
import cors from 'cors';
import {PrismaClient} from'@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET||'mockmate-dev-secret';

// 认证中间件：提取并验证 JWT
function authenticateToken(req: Request, res: Response, next: Function) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: '无效的令牌' });
        (req as any).user = user;
        next();
    });
}

//注册
app.post('/api/auth/register',async(req:Request,res:Response)=>{
    try{
    const {email,password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data:{email,password:hashedPassword},
    });
    res.json({message:'注册成功',user:{id:user.id,email:user.email}});
}catch(error:any){
    res.status(400).json({error:error.message});
}
});
//登录
app.post('/api/auth/login',async(req:Request,res:Response)=>{
    const {email,password} = req.body;
    const user = await prisma.user.findUnique({where:{email}});
    if(!user)return res.status(401).json({error:'邮箱或密码错误'});
    const valid = await bcrypt.compare(password,user.password);
    if(!valid)return res.status(401).json({error:'邮箱或密码错误'});
    const token = jwt.sign({id:user.id,email:user.email},JWT_SECRET,{expiresIn:'7d'});
    res.json({message:'登陆成功',token,user:{id:user.id,email:user.email}});
});

app.get('/api/auto/me',authenticateToken,(req:Request,res:Response)=>{
    const user = (req as any).user;
    res.json({user});
});

app.listen(3001,()=>console.log('后端服务已启动 http://localhost:3001'));