import React, { useState, useEffect } from 'react';
import { Shield, Lock, Users, FileText, Activity, Globe, LogOut, Trash2 } from 'lucide-react';
import { getAnalytics, clearAnalytics, AnalyticsSummary } from '../utils/analytics';

interface AdminDashboardProps {
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    // Check if previously logged in (session storage)
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
      setStats(getAnalytics());
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // HARDCODED PASSWORD FOR DEMO PURPOSES
    if (password === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setStats(getAnalytics());
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPassword("");
    onExit();
  };

  const handleClearData = () => {
      if(confirm("Are you sure you want to reset all statistics?")) {
          clearAnalytics();
          setStats(getAnalytics());
      }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
        <div className="bg-surface p-8 rounded-xl border border-slate-700 shadow-2xl max-w-sm w-full space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-slate-800 rounded-full text-primary">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Access</h2>
            <p className="text-slate-400 text-sm">Restricted area. Please identify yourself.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                autoFocus
              />
              {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Unlock Dashboard
            </button>
          </form>
          
          <button onClick={onExit} className="w-full text-xs text-slate-500 hover:text-slate-300">
            Return to App
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Shield className="text-emerald-500" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Administrator</h2>
            <p className="text-slate-400 text-xs">Analytics & System Overview</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-400 bg-red-900/10 hover:bg-red-900/20 rounded-lg transition-colors"
            >
                <Trash2 size={14} /> Reset Data
            </button>
            <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
            <LogOut size={16} /> Logout
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users size={20} />} 
          label="Unique Users" 
          value={stats.uniqueUsers} 
          subValue="Est. based on traffic"
        />
        <StatCard 
          icon={<FileText size={20} />} 
          label="Texts Processed" 
          value={stats.totalTextsRead} 
          subValue="Total sessions"
        />
        <StatCard 
          icon={<Activity size={20} />} 
          label="Avg Word Count" 
          value={stats.avgWordCount} 
          subValue={`Median: ${stats.medianWordCount}`}
        />
        <StatCard 
          icon={<Globe size={20} />} 
          label="Top Region" 
          value={Object.keys(stats.topCountries)[0] || "N/A"} 
          subValue={`${Object.values(stats.topCountries)[0] || 0} sessions`}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30">
            <h3 className="font-medium text-white">Recent Reading Sessions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 font-medium bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Words</th>
                  <th className="px-6 py-3">Speed</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stats.sessions.slice(0, 10).map((session) => (
                  <tr key={session.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3">
                        <span className="flex items-center gap-2">
                             <span className="text-slate-500 font-mono text-xs">[{session.countryCode}]</span>
                             {session.country}
                        </span>
                    </td>
                    <td className="px-6 py-3 text-slate-300">{session.wordCount}</td>
                    <td className="px-6 py-3 text-slate-400">{session.wpm} WPM</td>
                    <td className="px-6 py-3 text-slate-500">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demographics / Additional Info */}
        <div className="bg-surface rounded-xl border border-slate-700 p-6 space-y-6 h-fit">
          <h3 className="font-medium text-white border-b border-slate-700 pb-4">Global Reach</h3>
          <div className="space-y-3">
             {Object.entries(stats.topCountries)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([country, count]) => (
                 <div key={country} className="flex items-center justify-between">
                     <span className="text-slate-300">{country}</span>
                     <div className="flex items-center gap-2">
                         <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-primary" 
                                style={{ width: `${(count / stats.totalTextsRead) * 100}%` }} 
                             />
                         </div>
                         <span className="text-xs text-slate-500 font-mono w-6 text-right">{count}</span>
                     </div>
                 </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, subValue: string }> = ({ icon, label, value, subValue }) => (
  <div className="bg-surface p-5 rounded-xl border border-slate-700">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
      </div>
      <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
        {icon}
      </div>
    </div>
    <p className="text-xs text-slate-500">{subValue}</p>
  </div>
);
