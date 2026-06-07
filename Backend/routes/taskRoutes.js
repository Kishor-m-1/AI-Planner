import { Router } from 'express';
import {
    createTask,
    getProjectTasks,
    updateTaskStatus
} from '../controllers/taskController.js';

const router = Router();

router.post('/', createTask);
router.get('/project/:projectId', getProjectTasks);
router.patch('/:taskId/status', updateTaskStatus);

export default router;
