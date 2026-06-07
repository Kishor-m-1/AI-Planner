import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import { createProject, getAllProjects, getDashboardMetrics, getOneProject } from '../controllers/projectController.js';
import { createTask, getProjectTasks, updateTaskStatus } from '../controllers/taskController.js';

const router = Router();

router.get('/', getAllProjects);
router.post('/', createProject);
router.get('/metrics', getDashboardMetrics);
router.get('/:projectId', getOneProject);
router.post('/tasks', createTask);
router.get('/tasks/project/:projectId', getProjectTasks);
router.patch('/tasks/:taskId/status', updateTaskStatus);
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);  

export default router;