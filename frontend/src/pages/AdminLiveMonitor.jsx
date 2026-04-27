import React, { useState, useEffect, useCallback } from 'react';
import { getLiveSessions, getSessionActivity, getLiveStats, terminateSession } from '../api/adminApi';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { 
  UsersIcon, 
  ExclamationTriangleIcon, 
  ActivityHistoryIcon,
  ShieldCheckIcon,
  ClockIcon,
  StopIcon
} from '../components/Icons';
import Toast from '../components/Toast';


const AdminLiveMonitor = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ active_sessions: 0, total_violations: 0, high_risk_students: 0 });
  const [selectedSession, setSelectedSession] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [sessionsData, statsData] = await Promise.all([
        getLiveSessions(),
        getLiveStats()
      ]);
      setSessions(Array.isArray(sessionsData) ? sessionsData : (sessionsData.data || []));
      setStats(statsData.data || statsData);
      setError(null);
    } catch (err) {
      console.error("Live Monitoring Error:", err);
      // Don't set global error on polling to avoid UI flickering, just log it
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivity = useCallback(async (attemptId) => {
    setActivityLoading(true);
    try {
      const data = await getSessionActivity(attemptId);
      setActivity(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error("Activity Fetch Error:", err);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Poll for live data every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Poll for selected session activity every 5 seconds if one is selected
  useEffect(() => {
    if (selectedSession) {
      fetchActivity(selectedSession.attempt_id);
      const interval = setInterval(() => fetchActivity(selectedSession.attempt_id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedSession, fetchActivity]);

  const handleTerminate = async (attemptId) => {
    if (!window.confirm("Are you sure you want to terminate this student's exam session immediately?")) return;
    
    try {
      await terminateSession(attemptId);
      setToast({ message: "Session terminated successfully", type: 'success' });
      fetchData();
      if (selectedSession?.attempt_id === attemptId) {
        setSelectedSession(null);
        setActivity([]);
      }
    } catch (err) {
      setToast({ message: "Failed to terminate session", type: 'error' });
    }
  };

  const getRiskBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'safe': return <Badge variant="success">Safe</Badge>;
      case 'low': return <Badge variant="warning">Low Risk</Badge>;
      case 'medium': return <Badge variant="orange">Medium Risk</Badge>;
      case 'high': return <Badge variant="danger">High Risk</Badge>;
      default: return <Badge variant="success">Safe</Badge>;
    }
  };

  const getSeverityColor = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'high') return 'text-red-500 bg-red-50 border-red-100';
    if (s === 'medium') return 'text-orange-500 bg-orange-50 border-orange-100';
    return 'text-yellow-600 bg-yellow-50 border-yellow-100';
  };

  const filteredSessions = sessions.filter(s => 
    s.student_id.toString().includes(searchTerm) || 
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-[1600px] mx-auto page-enter">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            Live Exam Monitoring
          </h1>
          <p className="text-gray-500 mt-2 font-bold flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-[#7FB77E]" />
            Real-time proctor surveillance active. Data refreshes every 5s.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Sessions', val: stats.active_sessions, color: 'text-indigo-600 bg-indigo-50', icon: UsersIcon },
            { label: 'Violations', val: stats.total_violations, color: 'text-orange-600 bg-orange-50', icon: ExclamationTriangleIcon },
            { label: 'High Risk', val: stats.high_risk_students, color: 'text-red-600 bg-red-50', icon: ShieldCheckIcon }
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-3xl border border-white/50 shadow-sm ${stat.color} flex items-center gap-4`}>
              <stat.icon className="w-6 h-6" />
              <div>
                <p className="text-2xl font-black leading-none">{stat.val}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Sessions List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl">
            <CardContent className="p-0">
              <div className="p-8 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Active Student Sessions</h3>
                <div className="relative w-72">
                  <input
                    type="text"
                    placeholder="Search Student ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#7FB77E]/20 focus:border-[#7FB77E] outline-none font-bold text-sm transition-all"
                  />
                  <UsersIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      {['Student', 'Exam Name', 'Violations', 'Risk Score', 'Risk Level', 'Actions'].map((h) => (
                        <th key={h} className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map((s) => (
                        <tr 
                          key={s.attempt_id} 
                          className={`group hover:bg-[#F5F9F4] cursor-pointer transition-all ${selectedSession?.attempt_id === s.attempt_id ? 'bg-[#F5F9F4]' : ''}`}
                          onClick={() => setSelectedSession(s)}
                        >
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                {s.student_id.toString().slice(-2)}
                              </div>
                              <div>
                                <p className="font-extrabold text-gray-800 text-sm">{s.student_name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-8 font-bold text-gray-600 text-sm">{s.subject_name}</td>
                          <td className="py-6 px-8">
                            <span className={`px-2 py-1 rounded-lg font-black text-xs ${s.violation_count > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                              {s.violation_count} Events
                            </span>
                          </td>
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg font-black text-gray-700">{s.risk_score}</span>
                              <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${s.risk_score >= 16 ? 'bg-red-500' : s.risk_score >= 9 ? 'bg-orange-500' : s.risk_score >= 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                  style={{ width: `${Math.min(s.risk_score * 4, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-8">{getRiskBadge(s.risk_level)}</td>
                          <td className="py-6 px-8">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTerminate(s.attempt_id); }}
                              className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                              title="Terminate Session"
                            >
                              <StopIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))

                    ) : (
                      <tr>
                        <td colSpan="6" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No active exam sessions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Event Stream for Selected Session */}
        <div className="flex flex-col gap-6">
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl h-full flex flex-col">
            <div className="p-8 bg-gray-800 text-white flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tight">Live Event Stream</h3>
                <ActivityHistoryIcon className="w-6 h-6 text-[#7FB77E]" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {selectedSession ? `Monitoring: ${selectedSession.student_name}` : 'Select a student to monitor'}
              </p>
            </div>

            <CardContent className="p-6 flex-1 overflow-y-auto max-h-[700px] scrollbar-hide">
              {selectedSession ? (
                <div className="flex flex-col gap-4">
                  {activityLoading && activity.length === 0 ? (
                    <div className="py-20 flex justify-center"><Loader /></div>
                  ) : activity.length > 0 ? (
                    activity.map((event, i) => (
                      <div key={i} className={`p-4 rounded-2xl border ${getSeverityColor(event.severity)} transition-all animate-slide-in`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-black text-xs uppercase tracking-wider">{event.reason}</p>
                          <Badge variant={event.severity?.toLowerCase() === 'high' ? 'danger' : 'warning'} className="text-[9px] uppercase tracking-tighter px-1.5 h-4">
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-[10px] font-bold opacity-60 flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {new Date(event.reported_time).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-32 text-center">
                      <ShieldCheckIcon className="w-12 h-12 text-green-100 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No suspicious activity detected for this session</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-10 py-32">
                  <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <UsersIcon className="w-10 h-10 text-gray-200" />
                  </div>
                  <h4 className="text-lg font-black text-gray-800">No Student Selected</h4>
                  <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-wide">
                    Click on a student session from the left panel to begin real-time surveillance of their activity stream.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveMonitor;
