import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';

import indexRoutes from './routes/index.routes.js';
import taskRoutes from './routes/tasks.routes.js';

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'https://int-line-production.up.railway.app']
}));

app.use(express.json());
app.use(indexRoutes);
app.use(taskRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
