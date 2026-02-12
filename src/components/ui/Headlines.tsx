import { TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';
import { HeadlineData } from '@/types';

interface HeadlinesProps {
  data: HeadlineData | null;
  loading: boolean;
}

export function Headlines({ data, loading }: HeadlinesProps) {
  if (loading || !data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Day on Day */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Day over Day</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.daily.sessions.toLocaleString()} <span className="text-sm font-normal text-gray-400">sessions</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">vs yesterday ({data.daily.prevSessions.toLocaleString()})</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${data.daily.diff >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {data.daily.diff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {data.daily.diff > 0 ? '+' : ''}{data.daily.diff}%
        </div>
      </div>

      {/* Week on Week */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Week over Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.weekly.sessions.toLocaleString()} <span className="text-sm font-normal text-gray-400">sessions</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{data.weekly.range}</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${data.weekly.diff >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {data.weekly.diff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {data.weekly.diff > 0 ? '+' : ''}{data.weekly.diff}%
        </div>
      </div>
    </div>
  );
}