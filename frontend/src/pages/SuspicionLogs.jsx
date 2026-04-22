import React, { useState, useEffect } from 'react';
import { getReports } from '../api/reportApi';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { ExclamationTriangleIcon } from '../components/Icons';

const SuspicionLogs = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        setReports(Array.isArray(data) ? data : (data.reports || []));
      } catch (err) {
        setError('Failed to load suspicion logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getSeverityBadge = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'high') return <Badge variant="danger">High</Badge>;
    if (s === 'medium') return <Badge variant="warning">Medium</Badge>;
    if (s === 'low') return <Badge variant="success">Low</Badge>;
    return <Badge variant="neutral">{severity}</Badge>;
  };

  if (loading) return <Loader fullScreen />;

  const filtered = reports.filter(r => {
    const matchSearch =
      (r.name || r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.subject_name || r.exam_name || '').toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'All' || r.severity?.toLowerCase() === severityFilter.toLowerCase();
    return matchSearch && matchSeverity;
  });

  const counts = {
    High: reports.filter(r => r.severity?.toLowerCase() === 'high').length,
    Medium: reports.filter(r => r.severity?.toLowerCase() === 'medium').length,
    Low: reports.filter(r => r.severity?.toLowerCase() === 'low').length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Suspicion Logs</h1>
        <p className="text-gray-500 mt-2 font-medium">
          Malpractice events flagged by the detection system.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(counts).map(([level, count]) => (
          <div key={level} className={`rounded-2xl p-5 border shadow-sm ${
            level === 'High' ? 'bg-red-50 border-red-200' :
            level === 'Medium' ? 'bg-orange-50 border-orange-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className={`w-6 h-6 ${
                level === 'High' ? 'text-red-500' :
                level === 'Medium' ? 'text-orange-500' :
                'text-green-500'
              }`} />
              <div>
                <p className="text-2xl font-extrabold text-gray-800">{count}</p>
                <p className={`text-xs font-bold uppercase tracking-wide ${
                  level === 'High' ? 'text-red-600' :
                  level === 'Medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>{level} Risk</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ErrorMessage message={error} />

      <Card>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by student or exam..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-white border border-gray-300 text-gray-800 focus:border-[#7FB77E] focus:ring-2 focus:ring-[#7FB77E]/20 rounded-xl px-4 py-2 outline-none transition-all"
            />
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-48 bg-white border border-gray-300 text-gray-800 focus:border-[#7FB77E] focus:ring-2 focus:ring-[#7FB77E]/20 rounded-xl px-4 py-2 outline-none transition-all"
            >
              <option value="All">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Student', 'Exam', 'Reason', 'Severity', 'Reported At'].map(h => (
                    <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length > 0 ? filtered.map((r, i) => (
                  <tr key={r.report_id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {r.name || r.student_name || '—'}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {r.subject_name || r.exam_name || '—'}
                    </td>
                    <td className="py-4 px-4 text-gray-600 max-w-xs truncate">{r.reason}</td>
                    <td className="py-4 px-4">{getSeverityBadge(r.severity)}</td>
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {(r.reported_time || r.report_time)
                        ? new Date(r.reported_time || r.report_time).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-400">
                      No suspicion logs found.
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

export default SuspicionLogs;
