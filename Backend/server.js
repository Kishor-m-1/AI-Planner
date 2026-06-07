import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();
const app = express();

// Middleware 
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-planner-tau.vercel.app' // ◄ Make sure this exact link is here!
  ],
  credentials: true
}));
app.use(express.json());

// Routes Integration Layer
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// MongoDB Initializer Hook
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`serving running on Port ${PORT}`));
  })
  .catch(err => console.error('CRITICAL DATABASE ERROR:', err));