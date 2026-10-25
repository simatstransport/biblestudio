import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, AlertTriangle, AlertCircle, Cpu, Clock, RefreshCw } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { api } from '../services/api.js';
import { HistoryItem } from '../types/index.js';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    api.getHistory()
      .then(res => setHistory(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-white flex items-center space-x-2">
              <History className="w-7 h-7 text-gold-400" />
              <span>AI Generation Audit History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Transparent telemetry of provider requests, latency metrics, and automatic failovers.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-navy-900 border border-navy-700 hover:border-gold-500 text-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* History Table */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-2xl">
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">No generation history recorded yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your AI requests (titles, devotional captions, image backgrounds) will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-navy-800">
                  <tr>
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-4">Task Type</th>
                    <th className="py-3.5 px-4">Provider</th>
                    <th className="py-3.5 px-4">Model</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Status & Routing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-slate-300">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white capitalize">
                        {item.task_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          item.provider === 'openai' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}>
                          {item.provider}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {item.model}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {item.duration_ms} ms
                      </td>
                      <td className="py-3.5 px-4">
                        {item.status === 'success' && (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Primary Direct</span>
                          </span>
                        )}
                        {item.status === 'fallback_recovered' && (
                          <span className="inline-flex items-center space-x-1 text-amber-400 font-semibold" title={item.error_category}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Fallback Recovered</span>
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="inline-flex items-center space-x-1 text-red-400 font-semibold" title={item.error_category}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Failed ({item.error_category || 'Error'})</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
