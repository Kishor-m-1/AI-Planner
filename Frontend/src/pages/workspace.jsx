import { AlertTriangle, ArrowLeft, Circle, Loader2, Plus, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectService } from '../services/api';

export default function Workspace() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Drawer Tracking Form States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // Active item for the AI inspection drawer
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium' });

  useEffect(() => {
    if (projectId) loadWorkspace();
  }, [projectId]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        projectService.getOne(projectId),
        projectService.getTasks(projectId)
      ]);
      if (projRes.success) setProject(projRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
    } catch (err) {
      alert('Error fetching dashboard indices: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await projectService.createTask({ ...newTask, projectId });
      if (res.success) {
        setTasks((prev) => [...prev, res.data]);
        setIsTaskModalOpen(false);
        setNewTask({ title: '', description: '', priority: 'Medium' });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusShift = async (taskId, nextStatus) => {
    try {
      const res = await projectService.updateTaskStatus(taskId, nextStatus);
      if (res.success) {
        setTasks((prev) => prev.map(t => t._id === taskId ? { ...t, status: nextStatus } : t));
        if (selectedTask?._id === taskId) setSelectedTask(prev => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Parsing engine telemetry logs...</p>
      </div>
    );
  }

  const columns = ['Todo', 'In Progress', 'Done'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Primary Board Pipeline Layout */}
      <div className="flex-1 overflow-x-auto p-6 sm:p-10 space-y-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project?.name}</h1>
              <p className="text-xs text-slate-500 font-medium">Core Contributor Cap: {project?.teamSize} Developers Assigned</p>
            </div>
          </div>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </header>

        {/* Dynamic Kanban Swim Lanes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {columns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col);
            return (
              <div key={col} className="bg-slate-100/70 border border-slate-200/60 p-4 rounded-xl min-h-[500px] flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <span className="font-bold text-xs tracking-wider text-slate-400 uppercase">{col}</span>
                  <span className="bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full text-xs">{columnTasks.length}</span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
                  {columnTasks.map((task) => (
                    <div 
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 cursor-pointer transition-all space-y-3 group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded tracking-wide uppercase ${
                          task.priority === 'High' ? 'bg-rose-50 text-rose-700' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                      
                      {/* AI Microindicator Metrics */}
                      {task.aiAssistedDetails?.suggestedSubtasks?.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 bg-indigo-50/50 py-1 px-2 rounded font-medium w-max">
                          <Sparkles className="w-3 h-3" />
                          <span>{task.aiAssistedDetails.suggestedSubtasks.length} Subtasks Generated</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- RIGHT HAND SIDE: GEMINI INTERACTIVE DRAWER --- */}
      {selectedTask && (
        <div className="w-96 bg-white border-l border-slate-200 shadow-xl p-6 flex flex-col justify-between h-screen sticky top-0 animate-in slide-in-from-right duration-200">
          <div className="space-y-6 overflow-y-auto pr-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> AI Summary Matrix
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedTask.title}</h2>
              <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">"{selectedTask.description || 'No description added'}"</p>
            </div>

            {/* Workflow Control State */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Modify Workflow State</label>
              <div className="flex gap-2">
                {columns.map(status => (
                  <button 
                    key={status}
                    onClick={() => handleStatusShift(selectedTask._id, status)}
                    className={`flex-1 text-xs font-medium py-1.5 rounded transition-all border ${
                      selectedTask.status === status ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Generated Checklist Elements */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gemini Architectural Subtasks</h3>
              {selectedTask.aiAssistedDetails?.suggestedSubtasks?.length > 0 ? (
                <ul className="space-y-2">
                  {selectedTask.aiAssistedDetails.suggestedSubtasks.map((sub, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/70 p-2 rounded border border-slate-100">
                      <Circle className="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0" />
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No structured data was parsed for this task footprint.</p>
              )}
            </div>

            {/* AI Risk Assessment Card */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Risk Vector Mapping</h3>
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg flex gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-bold mb-0.5">Complexity: {selectedTask.aiAssistedDetails?.complexityScore || 'Medium'}</span>
                  <p className="text-amber-800/90 leading-normal">{selectedTask.aiAssistedDetails?.riskAssessment || 'No clear blockers detected within this deployment footprint.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD TASK MODAL OVERLAY --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-150 border border-slate-200">
            <button onClick={() => setIsTaskModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-600" /> Formulate New Project Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                <input 
                  type="text" required placeholder="e.g., Implement OAuth2 Flow" value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Functional Requirements Context</label>
                <textarea 
                  required rows="3" placeholder="Provide details. Gemini uses this payload to compute risk parameters and generate functional subtask checklists." value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SLA Execution Priority</label>
                <select 
                  value={newTask.priority} onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-2 disabled:opacity-50 shadow-sm">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Inject & Build Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}