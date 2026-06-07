import Task from '../models/Task.js';
import { generateTaskInsights } from '../utils/geminiHelper.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, priority } = req.body;

    // Trigger on-demand inference calculations from Gemini SDK
    const aiInsights = await generateTaskInsights(title, description);

    const newTask = new Task({
      title,
      description,
      projectId,
      priority,
      status: 'Todo',
      aiAssistedDetails: aiInsights
    });

    await newTask.save();
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};