import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  UsersIcon, BookOpenIcon, DocumentIcon,
  ExclamationTriangleIcon, ChartBarIcon,
} from '../components/Icons';
import Card, { CardContent } from '../components/ui/Card';
import Loader from '../components/common/Loader';
import Badge from '../components/ui/Badge';
import { getDashboardStats, getDashboardCharts, getRecentReports } from '../api/dashboardApi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

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

const AdminDashboard = () => {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_students: 0,
    total_exams: 0,
    total_reports: 0,
    high_risk_count: 0
  });
  const [charts, setCharts] = useState({
    severityDistribution: [],
    subjectAttempts: []
  });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, chartsData, reportsData] = await Promise.all([
          getDashboardStats(),
          getDashboardCharts(),
          getRecentReports()
        ]);
        
        setStats(statsData);
        setCharts(chartsData);
        if (reportsData?.reports) {
          setRecentReports(reportsData.reports);
        } else if (Array.isArray(reportsData)) {
           setRecentReports(reportsData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return <Badge variant="danger">High</Badge>;
      case 'medium': return <Badge variant="warning">Medium</Badge>;
      case 'low': return <Badge variant="success">Low</Badge>;
      default: return <Badge variant="neutral">{severity}</Badge>;
    }
  };

  if (loading) return <Loader fullScreen />;

  const statCards = [
    { label: 'Total Students', value: stats.total_students, icon: <UsersIcon className="w-6 h-6 text-[#7FB77E]" /> },
    { label: 'Total Exams', value: stats.total_exams, icon: <BookOpenIcon className="w-6 h-6 text-[#7FB77E]" /> },
    { label: 'Total Attempts', value: stats.total_attempts, icon: <DocumentIcon className="w-6 h-6 text-[#7FB77E]" /> },
    { label: 'Suspicion Flags', value: stats.total_reports, icon: <ExclamationTriangleIcon className="w-6 h-6 text-[#7FB77E]" /> },
    { label: 'High Risk Count', value: stats.high_risk_count, icon: <ChartBarIcon className="w-6 h-6 text-[#ef4444]" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto page-enter pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, <span className="text-[#4d7f4c]">{user?.name ?? 'Admin'}</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">
          System overview and malpractice detection control panel.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="!p-5 border-l-4 border-[#7FB77E] rounded-xl shadow-sm bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wide">{s.label}</span>
                <div className="w-10 h-10 rounded-xl bg-[#e5efdf] flex items-center justify-center">
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-800">{s.value || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-[#7FB77E]" />
              Subject-wise Attempts
            </h2>
            <div className="overflow-x-auto">
              <div style={{ minWidth: '400px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={charts.subjectAttempts} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    barCategoryGap="20%"
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="subject" 
                      stroke="#6b7280" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={70}
                      tickFormatter={formatSubject}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: '#f3f4f6' }} 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      formatter={(value, name, props) => [
                        value,
                        props.payload.subject
                      ]}
                    />
                    <Bar dataKey="attempts" fill="#7FB77E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-[#f59e0b]" />
              Severity Distribution
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.severityDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {charts.severityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Default} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="text-lg font-bold text-gray-800 mb-6">Recent Suspicion Reports</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReports?.length > 0 ? (
                  recentReports.map((report) => (
                    <tr key={report.report_id || Math.random()} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">{report.student_name}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{report.exam_name}</td>
                      <td className="py-4 px-4 text-gray-600 truncate max-w-xs">{report.reason}</td>
                      <td className="py-4 px-4">{getSeverityBadge(report.severity)}</td>
                      <td className="py-4 px-4 text-gray-500 text-sm">
                        {report.report_time ? new Date(report.report_time).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                      No suspicion reports yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
