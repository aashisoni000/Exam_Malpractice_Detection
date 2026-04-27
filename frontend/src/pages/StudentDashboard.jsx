import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  BookOpenIcon, 
  DocumentIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  CheckCircleIcon
} from '../components/Icons';
import Card, { CardContent } from '../components/ui/Card';
import Loader from '../components/common/Loader';
import Badge from '../components/ui/Badge';
import { getStudentDashboard } from '../api/studentApi';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

const COLORS = {
  High: '#ef4444', 
  Medium: '#f59e0b', 
  Low: '#22c55e',
  Default: '#7FB77E'
};

function formatSubject(name) {
  if (!name) return "";
  return name.length > 12
    ? name.substring(0, 10) + "..."
    : name;
}

const StudentDashboard = () => {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming user.id or user.student_id contains the ID
        const studentId = user?.student_id || user?.id;
        if (studentId) {
          const result = await getStudentDashboard(studentId);
          setData(result);
        }
      } catch (err) {
        console.error("Failed to fetch student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Loader fullScreen />;

  const stats = [
    { 
      label: 'Exams Taken', 
      value: data?.examsTaken || 0, 
      icon: <BookOpenIcon className="w-6 h-6 text-[#7FB77E]" />,
      color: 'bg-[#e5efdf]'
    },
    { 
      label: 'Reports Generated', 
      value: data?.reportsGenerated || 0, 
      icon: <DocumentIcon className="w-6 h-6 text-[#7FB77E]" />,
      color: 'bg-[#e5efdf]'
    },
    { 
      label: 'Suspicion Flags', 
      value: data?.suspicionFlags || 0, 
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />,
      color: 'bg-amber-50'
    },
    { 
      label: 'Avg. Time (min)', 
      value: data?.avgCompletionTime || 0, 
      icon: <ClockIcon className="w-6 h-6 text-[#7FB77E]" />,
      color: 'bg-[#e5efdf]'
    },
  ];

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'warning';
      case 'safe': return 'success';
      default: return 'success';
    }
  };

  const risk = {
    level: data?.risk_level || 'Safe',
    score: data?.risk_score || 0,
    color: getRiskColor(data?.risk_level)
  };

  // Prepare chart data
  const pieData = data?.riskDistribution?.map(rd => ({
    name: rd.severity,
    value: rd.count
  })) || [];

  const barData = data?.subjectAttempts?.map(sa => ({
    subject: sa.subject,
    attempts: sa.count
  })) || [];

  const lineData = data?.attemptsOverTime?.map(at => ({
    day: new Date(at.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    attempts: at.count
  })) || [];

  return (
    <div className="max-w-6xl mx-auto page-enter pb-10">
      {/* Welcome header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, <span className="text-[#4d7f4c]">{user?.name ?? 'Student'}</span> 👋
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Analytics-based student insights.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Risk Profile:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400">SCORE: {risk.score}</span>
            <Badge variant={risk.color}>{risk.level}</Badge>
          </div>
        </div>
      </div>


      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="!p-5 border-l-4 border-[#7FB77E] rounded-xl shadow-sm bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wide">{s.label}</span>
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary Text */}
      {data?.examsTaken > 0 && (
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Performance Insight</h3>
            <p className="text-gray-600">
              You have completed <span className="font-bold text-[#4d7f4c]">{data.examsTaken} exams</span> with an average completion time of <span className="font-bold text-[#4d7f4c]">{data.avgCompletionTime} minutes</span>. 
              {data.reportsGenerated === 0 
                ? " Great job! No suspicious activity has been recorded." 
                : ` Focus on following all exam rules to maintain a low-risk profile.`}
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attempts Over Time */}
        <Card className="lg:col-span-2">
          <CardContent>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-[#7FB77E]" />
              Attempts Over Time
            </h2>
            <div className="h-[300px]">
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#9ca3af" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="attempts" 
                      stroke="#7FB77E" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#7FB77E', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p>You haven't taken any exams yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              Risk Distribution
            </h2>
            <div className="h-[300px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Default} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-200 mb-2" />
                  <p>No suspicious activity recorded.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Subject Attempts */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-[#7FB77E]" />
              Subject-wise Attempts
            </h2>
            <div className="h-[300px]">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="subject" 
                      type="category" 
                      width={100}
                      fontSize={11}
                      tickFormatter={formatSubject}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="attempts" fill="#7FB77E" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p>No subject data available.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exam Rules Section */}
        <Card className="bg-amber-50 border-amber-100 shadow-none">
          <CardContent>
            <h2 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              Exam Rules & Monitoring Policies
            </h2>
            <ul className="space-y-2 text-sm text-amber-700 font-medium">
              <li className="flex items-center gap-2">• IP address switching is monitored</li>
              <li className="flex items-center gap-2">• Tab switching is logged</li>
              <li className="flex items-center gap-2">• Window focus loss is recorded</li>
              <li className="flex items-center gap-2">• Submitting too quickly may trigger alerts</li>
              <li className="flex items-center gap-2">• Multiple login attempts are tracked</li>
              <li className="flex items-center gap-2">• Idle inactivity is monitored</li>
              <li className="flex items-center gap-2">• Network change detection is enabled</li>
              <li className="flex items-center gap-2">• All suspicious actions are recorded</li>
            </ul>
            <div className="mt-6 p-4 bg-amber-100 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-800 flex items-center gap-1">
                <span className="font-bold uppercase tracking-wider">Note:</span> 
                Violations of these rules can lead to automatic disqualification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-[#7FB77E]" />
              Recent Exams
            </h2>
            <div className="space-y-4">
              {data?.recentExams?.length > 0 ? (
                data.recentExams.map((exam, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-800">{exam.subject_name}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(exam.start_time).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge variant="neutral">Completed</Badge>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-gray-400">
                  <p>No exams taken yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <DocumentIcon className="w-5 h-5 text-[#7FB77E]" />
              Recent Reports
            </h2>
            <div className="space-y-4">
              {data?.recentReports?.length > 0 ? (
                data.recentReports.map((report, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={report.severity.toLowerCase() === 'high' ? 'danger' : (report.severity.toLowerCase() === 'medium' ? 'warning' : 'success')}>
                        {report.severity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(report.reported_time).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-semibold">{report.reason}</p>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-gray-400">
                  <CheckCircleIcon className="w-10 h-10 mx-auto text-green-100 mb-2" />
                  <p>No suspicious activity recorded.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
