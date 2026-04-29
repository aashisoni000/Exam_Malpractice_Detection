import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import Card, { CardContent } from '../components/ui/Card';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { UsersIcon } from '../components/Icons';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await apiClient('/students');
        setStudents(res?.data?.students || []);
      } catch (err) {
        setError('Failed to load students.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <Loader fullScreen />;

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-500 mt-2 font-medium">
            All registered students ({students.length} total)
          </p>
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-72 bg-white border border-gray-300 text-gray-800 focus:border-[#7FB77E] focus:ring-2 focus:ring-[#7FB77E]/20 rounded-xl px-4 py-2 outline-none transition-all"
        />
      </div>

      <ErrorMessage message={error} />

      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Student ID', 'Name', 'Email', 'Status'].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? filtered.map((s) => (
                <tr key={s.student_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-500 font-mono text-sm">#{s.student_id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#e5efdf] flex items-center justify-center shrink-0">
                        <UsersIcon className="w-4 h-4 text-[#7FB77E]" />
                      </div>
                      <span className="font-semibold text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{s.email}</td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      s.current_status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {s.current_status || 'Active'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-400">
                    {search ? 'No students match your search.' : 'No students registered yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
