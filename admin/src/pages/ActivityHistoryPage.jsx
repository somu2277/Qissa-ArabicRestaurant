import React, { useEffect, useState } from 'react';
import { getActivityLogs } from '../services/adminApi';
import { History, Clock, Shield } from 'lucide-react';

export const ActivityHistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
          Admin Activity History
        </h1>
        <p className="text-xs text-[#6B655D] mt-1">
          Complete, immutable audit log of administrative menu modifications and QR generations.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E9ECEF] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6B655D]">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6B655D]">No activity logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A1A1A]">
              <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF] text-[#6B655D] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#E8602C]">{log.action}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#6B655D]">
                      {log.targetType}
                    </td>
                    <td className="py-3 px-4 font-medium">{log.adminEmail || 'admin'}</td>
                    <td className="py-3 px-4 text-[#6B655D]">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#6B655D] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
