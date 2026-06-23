import express,{Request,Response}from'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Mockmate骨架已通', timestamp: Date.now() });
});

const PORT = process.env.PORT||3001;
app.listen(PORT,()=>{
  console.log(`后端跑在http://localhost:${PORT}`);
});