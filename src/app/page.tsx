'use client';

import { Layout, Layers, MousePointer2, Users, Eye, Activity, RefreshCcw, Calendar, ChevronRight, X } from 'lucide-react';
import { useTrafficData } from '@/features/traffic/hooks/useTrafficData';
import { TrafficChart } from '@/features/traffic/components/TrafficChart';
import { TrafficTable } from '@/features/traffic/components/TrafficTable';
import { StatCard } from '@/components/ui/StatCard';
import { PlatformTab } from '@/components/ui/PlatformTab';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { data, loading, filters, options, stats, refresh } = useTrafficData();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black/20 text-gray-800 dark:text-gray-200 font-sans pb-20">
      
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[95%] mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-blue-200 dark:shadow-none shadow-md">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics<span className="text-blue-600 dark:text-blue-400">Hub</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <PlatformTab active={filters.platform === 'Facebook'} label="Facebook" onClick={() => filters.setPlatform('Facebook')} icon={Layout} />
                <PlatformTab active={filters.platform === 'Threads'} label="Threads" onClick={() => filters.setPlatform('Threads')} icon={Layers} />
             </div>
             <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
             <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-[95%] mx-auto px-4 py-8 space-y-8">
        
        {/* Controls & Filters Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4 justify-between">
           
           <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                  <input 
                    type="date" 
                    value={filters.startDate} 
                    onChange={e => filters.setStartDate(e.target.value)} 
                    className="bg-transparent text-sm pl-9 pr-2 py-1.5 outline-none text-gray-700 dark:text-gray-200 font-medium w-34 cursor-pointer dark:[color-scheme:dark]" 
                  />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 mx-0.5" />
                <input 
                  type="date" 
                  value={filters.endDate} 
                  onChange={e => filters.setEndDate(e.target.value)} 
                  className="bg-transparent text-sm px-2 py-1.5 outline-none text-gray-700 dark:text-gray-200 font-medium w-34 cursor-pointer dark:[color-scheme:dark]" 
                />
              </div>

              <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                 {[
                   { label: 'This Month', key: 'thisMonth' },
                   { label: 'Last 2 Weeks', key: 'prevWeek' },
                   { label: 'Last 30 Days', key: '30days' },
                 ].map((preset) => (
                   <button
                     key={preset.key}
                     onClick={() => filters.applyPreset(preset.key as any)}
                     className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                   >
                     {preset.label}
                   </button>
                 ))}
               </div>

              <select 
                value={filters.selectedCampaign} 
                onChange={(e) => filters.setSelectedCampaign(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 px-3 shadow-sm min-w-[160px]"
              >
                <option value="">All Campaigns</option>
                {options.availableCampaigns.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              
              {(filters.selectedCampaign || filters.startDate) && (
                <button 
                  onClick={filters.resetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
           </div>

           <button onClick={refresh} className="ml-auto flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 transition-all shadow-lg shadow-gray-200 dark:shadow-none active:scale-95">
             <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
             Refresh
           </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Sessions" value={stats.sessions.toLocaleString()} icon={MousePointer2} colorClass="bg-blue-500" />
          <StatCard title="Total Users" value={stats.users.toLocaleString()} icon={Users} colorClass="bg-indigo-500" />
          <StatCard title="Pageviews" value={stats.pageviews.toLocaleString()} icon={Eye} colorClass="bg-emerald-500" />
          <StatCard title="Avg Engagement" value={((stats.engagement / (data.length || 1)) * 100).toFixed(2) + '%'} icon={Activity} colorClass="bg-amber-500" />
        </div>

        <TrafficChart data={data} dateHeaders={options.dateHeaders} stats={stats} />
        <TrafficTable data={data} dateHeaders={options.dateHeaders} />

      </div>
    </div>
  );
}