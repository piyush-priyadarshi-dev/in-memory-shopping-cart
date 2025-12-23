import express from 'express';
import cartRoutes from './routes/cartRoutes';
import { errorHandler, handleJsonSyntaxError } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(handleJsonSyntaxError);

app.use('/api/cart', cartRoutes);

app.use(errorHandler);

export default app;
