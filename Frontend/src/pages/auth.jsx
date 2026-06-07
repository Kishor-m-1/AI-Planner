import { Loader2, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/api';

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    if (isSignUp) {
      // Flow Path: Registering a completely new profile
      const res = await projectService.auth.register(formData);
      if (res.success) {
        alert('Account registered! Swapping to authentication screen.');
        setIsSignUp(false); // Toggle to login view
      } else {
        alert(res.message);
      }
    } else {
      // Flow Path: Verification of current profile credentials
      const res = await projectService.auth.login({
        email: formData.email,
        password: formData.password
      });

      if (res.success) {
        // Store simple token flag locally to remember session active state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', res.user.id);
        navigate('/dashboard');
      } else {
        alert(res.message);
      }
    }
  } catch (err) {
    alert('Authentication pipeline timed out: ' + err.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1e1b29] via-[#38334a] to-[#cbd5e1] flex items-center justify-center p-4 antialiased font-sans">
      
      {/* Centered Component Card Box */}
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[440px] transform transition-all duration-300">
        
        {/* LEFT COLUMN: Dynamic Brand Message Branding */}
        <div className="space-y-3 text-center md:text-left select-none">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#b07eff] font-black text-4xl tracking-widest uppercase">
            PLANNER
          </div>
          <h2 className="text-2xl font-bold text-slate-400">
            {isSignUp ? 'Create your team profile' : 'Sign in to your account'}
          </h2>
          <p className="text-sm text-slate-400/80 leading-relaxed max-w-xs mx-auto md:mx-0">
            {isSignUp 
              ? 'Join our workspace management platform to synchronize sprints with automated AI tasks.' 
              : 'Enter your credential parameters to view team velocity queues and project logs.'
            }
          </p>
        </div>

        {/* RIGHT COLUMN: Functional Entry Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 pl-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" required placeholder="YOUR NAME"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm bg-white focus:ring-2 focus:ring-[#b07eff] focus:border-transparent focus:outline-none transition-all placeholder:text-slate-300 text-slate-700"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500 pl-1">Email Identifier</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="email" required placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm bg-white focus:ring-2 focus:ring-[#b07eff] focus:border-transparent focus:outline-none transition-all placeholder:text-slate-300 text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500 pl-1">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="password" required placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                className="w-full border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm bg-white focus:ring-2 focus:ring-[#b07eff] focus:border-transparent focus:outline-none transition-all placeholder:text-slate-300 text-slate-700"
              />
            </div>
          </div>

          {/* Submission and Alternate Flow Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormData({ name: '', email: '', password: '' });
              }}
              className="text-xs font-semibold text-[#b07eff] hover:text-[#965eff] underline transition-colors order-2 sm:order-1"
            >
              {isSignUp ? 'Already registered? Login here' : 'Not registered yet?'}
            </button>

            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#b07eff] hover:bg-[#965eff] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignUp ? 'Register Account' : 'Sign in'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}