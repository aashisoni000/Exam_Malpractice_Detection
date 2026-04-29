import React, { useState, useEffect } from 'react';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/common/Loader';
import api from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        console.log("Fetching reports...");
        const res = await api.get("/reports");
        console.log("Reports received:", res.data);
        setReports(res?.data?.data || []);
      } catch (error) {
        console.error("Failed loading reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return <Badge variant="danger">High</Badge>;
      case 'medium': return <Badge variant="warning">Medium</Badge>;
      case 'low': return <Badge variant="success">Low</Badge>;
      default: return <Badge variant="neutral">{severity}</Badge>;
    }
  };

  const filteredReports = (reports || []).filter(r => {
    const matchesSearch = r.student_name?.toLowerCase().includes(search.toLowerCase()) || 
                          r.subject_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || r.severity?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-6xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Suspicion Reports</h1>
        <p className="text-gray-500 mt-2 font-medium">Review malpractice activity flagged by the system.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="text-sm font-semibold underline rounded">Retry</button>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
            <input 
              type="text" 
              placeholder="Search by student or exam..." 
              className="w-full sm:w-80 bg-white border border-gray-300 text-gray-800 focus:border-[#7FB77E] focus:ring-2 focus:ring-[#7FB77E]/20 rounded-xl px-4 py-2 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              className="w-full sm:w-48 bg-white border border-gray-300 text-gray-800 focus:border-[#7FB77E] focus:ring-2 focus:ring-[#7FB77E]/20 rounded-xl px-4 py-2 outline-none transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.report_id}>
                      <td>{r.student_name || "Unknown"}</td>
                      <td>{r.subject_name || "Unknown"}</td>
                      <td>{r.reason}</td>
                      <td>{r.severity}</td>
                      <td>{new Date(r.reported_time).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
