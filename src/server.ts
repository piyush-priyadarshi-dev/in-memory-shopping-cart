import dotenv from 'dotenv';
import app from './api/app';

dotenv.config();

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Cart API listening on port ${port}`);
});
