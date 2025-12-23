import dotenv from 'dotenv';
import express from 'express';
import cartRoutes from './routes/cartRoutes';
import { errorHandler, handleJsonSyntaxError } from './middleware/errorHandler';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();
const app = express();

app.use(express.json());
app.use(handleJsonSyntaxError);
app.use(rateLimiter);
app.use(apiKeyAuth);

app.use('/api/cart', cartRoutes);

app.use(errorHandler);

export default app;
