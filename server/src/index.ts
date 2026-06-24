import express,{Request,Response}from'express';
import cors from 'cors';
import {PrismaClient} from'@prisma/client';

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

//注册
app.post('/api/auth/register',async(req:Request,res:Response)=>{try{
    const {email,password} = req.body;
    const user = await prisma.user.create({
        data:{email,password},
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
    if(!user || user.password !== password){
        return res.status(401).json({error:'邮箱或密码错误'});
    }
    res.json({message:'登陆成功',token:'placeholder-token',user:{id:user.id,email:user.email}});
});

app.listen(3001,()=>console.log('后端服务已启动 http://localhost:3001'));