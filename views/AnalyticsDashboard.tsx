import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, BarChart3, Sparkles } from 'lucide-react';
import { fetchViews } from '../services/iaService';
import { AppSettings } from '../types';
import { Button } from '../components/ui/Button';

interface Props {
  settings: AppSettings;
}

const AnalyticsDashboard: React.FC<Props> = ({ settings }) => {
  const [identifier, setIdentifier] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SUGGESTIONS = ['internetarchive', 'nasa', 'grateful-dead', 'blockbuster-logo'];

  const loadData = async (e?: React.FormEvent, idOverride?: string) => {
    if (e) e.preventDefault();
    const target = idOverride || identifier;

    if (!target) return;
    if (idOverride) setIdentifier(idOverride);

    setLoading(true);
    setError('');
    
    try {
      const rawData = await fetchViews(target);
      
      // Filter out summary keys (all_time, last_7day, etc.) and keep only date keys (YYYYMMDD)
      const chartData = Object.entries(rawData)
        .filter(([key]) => /^\d{8}$/.test(key)) 
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, val]) => {
            const year = key.substring(0, 4);
            const month = key.substring(4, 6);
            const day = key.substring(6, 8);
            return {
                date: `${year}-${month}-${day}`,
                views: Number(val) || 0
            };
        });
        
      if (chartData.length === 0) {
          setError('No view data found for this identifier.');
      }
      
      setData(chartData);
    } catch (e) {
      console.error(e);
      setError('Failed to load analytics data.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            Analyze Item Views
        </h2>
        <form onSubmit={(e) => loadData(e)} className="flex gap-4 mb-4">
            <div className="relative flex-1">
                <input 
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-4 pr-4 py-3 text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none shadow-inner" 
                placeholder="Enter Identifier (e.g. internetarchive)"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                />
            </div>
            <Button type="submit" isLoading={loading} className="px-8 rounded-xl">Analyze</Button>
        </form>

        <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Try:</span>
            <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                    <button 
                        key={s} 
                        onClick={() => loadData(undefined, s)}
                        className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 px-2 py-1 rounded transition-colors"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>

        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            {error}
        </div>}
      </div>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 h-96 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6">Daily Views Trend</h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    tick={{fontSize: 12}} 
                    tickFormatter={(val) => val.slice(5)} // Show MM-DD
                />
                <YAxis stroke="#9ca3af" tick={{fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#fb923c' }}
                />
                <Area type="monotone" dataKey="views" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
            </ResponsiveContainer>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Total Views (Period)</h3>
                    <div className="text-4xl font-bold text-white">
                        {data.reduce((acc, curr) => acc + curr.views, 0).toLocaleString()}
                    </div>
                    <div className="text-orange-400 text-sm mt-1 font-medium">Based on available history</div>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Peak Day</h3>
                    <div className="text-2xl font-bold text-white">
                        {data.length > 0 ? [...data].sort((a,b) => b.views - a.views)[0].date : '-'}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                        {data.length > 0 ? [...data].sort((a,b) => b.views - a.views)[0].views.toLocaleString() : 0} views
                    </div>
                </div>
            </div>
        </div>
      ) : (
         !loading && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50 min-h-[300px]">
                <BarChart3 className="w-16 h-16" />
                <p className="text-lg">Select an item to visualize view traffic</p>
            </div>
         )
      )}
    </div>
  );
};

export default AnalyticsDashboard;