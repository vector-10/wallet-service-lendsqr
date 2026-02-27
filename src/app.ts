import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middlewares';

dotenv.config();

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: true,
    message: 'Demo Credit Wallet Service is running',
    timestamp: new Date().toISOString(),
  });
});


app.use('/api/v1', routes);


app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: false,
    message: 'Route not found',
  });
});


app.use(errorHandler);

export default app;