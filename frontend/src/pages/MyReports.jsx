import React, { useState, useEffect } from 'react';
import { getReports } from '../api/reportApi';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { DocumentIcon } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';

const MyReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        const all = Array.isArray(data) ? data : (data.reports || []);
        // Filter to only this student's reports
        const mine = all.filter(r => !user || r.student_id == user.id || !r.student_id);
        setReports(mine);
      } catch (err) {
        setError('Failed to load your reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user]);

  const getSeverityBadge = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'high') return <Badge variant="danger">High</Badge>;
    if (s === 'medium') return <Badge variant="warning">Medium</Badge>;
    if (s === 'low') return <Badge variant="success">Low</Badge>;
    return <Badge variant="neutral">{severity}</Badge>;
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Reports</h1>
        <p className="text-gray-500 mt-2 font-medium">
          Suspicion events flagged during your exam sessions.
        </p>
      </div>

      <ErrorMessage message={error} />

      {!error && reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#f1f6ef] flex items-center justify-center mx-auto mb-4">
              <DocumentIcon className="w-8 h-8 text-[#7FB77E]" />
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">No reports found</h2>
            <p className="text-gray-400">You have no suspicion flags — keep it up!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Exam', 'Reason', 'Severity', 'Reported At'].map(h => (
                    <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((r, i) => (
                  <tr key={r.report_id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-800">{r.exam_name || r.subject_name || '—'}</td>
                    <td className="py-4 px-4 text-gray-600">{r.reason}</td>
                    <td className="py-4 px-4">{getSeverityBadge(r.severity)}</td>
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {r.reported_time || r.report_time
                        ? new Date(r.reported_time || r.report_time).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyReports;
