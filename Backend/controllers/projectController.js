import Project from '../models/Project.js';
import Task from '../models/Task.js';

// 1. Get projects belonging ONLY to the logged-in user
export const getAllProjects = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ success: false, message: 'User identification missing.' });

    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Save a new project tied to the logged-in user
export const createProject = async (req, res) => {
  try {
    const { name, teamSize } = req.body;
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ success: false, message: 'User identification missing.' });

    const newProject = new Project({ name, teamSize, userId });
    await newProject.save();

    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Compute dashboard metrics ONLY for the logged-in user's projects
export const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ success: false, message: 'User identification missing.' });

    const userProjects = await Project.find({ userId }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({ projectId: { $in: projectIds }, status: 'Done' });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        aiSuggestionsUsed: totalTasks * 2, 
        highRiskBlockers: 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. ADD THIS CRITICAL CONTROLLER: Fetch a single project entry by ID
export const getOneProject = async (req, res) => {
  try {
    const { projectId } = req.params; // Extract from URL parameters
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Workspace log footprint not found.' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};