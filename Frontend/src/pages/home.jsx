import { AlertCircle, CheckCircle2, FolderKanban, LayoutGrid, Loader2, LogOut, Plus, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState({ totalTasks: 0, completedTasks: 0, aiSuggestionsUsed: 0, highRiskBlockers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal and submission state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', teamSize: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live server data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Concurrently fire off API fetches
      const [projectsRes, metricsRes] = await Promise.all([
        projectService.getAll(),
        projectService.getMetrics()
      ]);

      if (projectsRes.success) setProjects(projectsRes.data);
      if (metricsRes.success) setMetrics(metricsRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the project server. Please ensure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await projectService.create(newProject);
      if (response.success) {
        // Optimistically append the newly generated entry to our view state
        setProjects((prev) => [response.data, ...prev]);
        setIsModalOpen(false);
        setNewProject({ name: '', teamSize: 1 });
      }
    } catch (err) {
      alert('Error creating new project workspace: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear tracking token parameters and redirect to auth router
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/auth';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Syncing live workspace dashboards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Welcome / Action Control Header Layout */}
      <header className="bg-white border-b border-slate-200 py-10 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg tracking-wide uppercase mb-1">
              SCHEDULE IT
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
              Team Workspace Hub
            </h1>
            <p className="mt-2 text-md text-slate-600 max-w-2xl">
              Manage sprints, sync dependencies, and leverage on-demand AI to instantly generate broken-down subtasks, detect risk parameters, and isolate development bottlenecks.
            </p>
          </div>
          
          {/* Action Row containing creation modal triggers and sign out controls */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
            
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-10">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        {/* Analytics Summary Bar */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Operational Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FolderKanban className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{metrics.totalTasks}</p>
                <p className="text-xs text-slate-500 font-medium">Active Tasks Assigned</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{metrics.completedTasks}</p>
                <p className="text-xs text-slate-500 font-medium">Completed Milestones</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Sparkles className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{metrics.aiSuggestionsUsed}</p>
                <p className="text-xs text-slate-500 font-medium">AI Subtasks Generated</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-rose-600">{metrics.highRiskBlockers}</p>
                <p className="text-xs text-slate-500 font-medium">AI-Flagged Risk Vectors</p>
              </div>
            </div>
          </div>
        </section>

        {/* Active Workspaces & Project Navigation */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Active Project Boards</h2>

          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-xl">
              <LayoutGrid className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">No projects found. Create one to kickstart tracking!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project._id} 
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {project.teamSize} Team Members • {project.taskCount || 0} Tasks Tracking
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <Link 
                      to={`/project/${project._id}`}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      Open Workspace &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Creation Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-600" /> Create Workspace Project
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Identifier Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Mobile App Core Engine"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estimated Core Contributor Count</label>
                <input 
                  type="number"
                  min="1"
                  required
                  value={newProject.teamSize}
                  onChange={(e) => setNewProject(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}