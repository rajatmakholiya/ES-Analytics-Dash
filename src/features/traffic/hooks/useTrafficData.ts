import { useState, useEffect, useMemo } from 'react';
import { fetchAnalyticsData, processDataForDashboard } from '@/lib/api';
import { AggregatedPageData, BackendMetric } from '@/types';
import { 
  format, subDays, eachDayOfInterval, parseISO, 
  startOfWeek, startOfMonth, isBefore, subWeeks, startOfToday 
} from 'date-fns';

export function useTrafficData() {
  const [data, setData] = useState<AggregatedPageData[]>([]);
  const [rawData, setRawData] = useState<BackendMetric[]>([]);
  const [loading, setLoading] = useState(false);
  
  // --- Smart Date Initialization ---
  const getSmartStartDate = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);
    return isBefore(weekStart, monthStart) ? monthStart : weekStart;
  };

  const [platform, setPlatform] = useState<'Facebook' | 'Threads'>('Facebook');
  const [startDate, setStartDate] = useState(format(getSmartStartDate(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  // --- Actions ---
  const applyPreset = (preset: '30days' | 'prevWeek' | 'thisMonth') => {
    const today = startOfToday();
    let newStart;
    let newEnd = today;

    switch (preset) {
      case '30days': newStart = subDays(today, 30); break;
      case 'prevWeek': newStart = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1); break;
      case 'thisMonth': newStart = startOfMonth(today); break;
    }
    setStartDate(format(newStart!, 'yyyy-MM-dd'));
    setEndDate(format(newEnd, 'yyyy-MM-dd'));
  };

  const resetFilters = () => {
    setStartDate(format(getSmartStartDate(), 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedCampaign('');
  };

  // 1. Load Data
  const loadData = async () => {
    setLoading(true);
    const utmSource = platform === 'Facebook' ? 'fb' : 'threads';
    const fetchedRaw = await fetchAnalyticsData(startDate, endDate, utmSource);
    setRawData(fetchedRaw);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [platform, startDate, endDate]);

  // 2. Process Data
  useEffect(() => {
    if (rawData.length > 0) {
      const processed = processDataForDashboard(rawData, platform, selectedCampaign);
      processed.sort((a, b) => b.totals.sessions - a.totals.sessions);
      setData(processed);
    } else {
      setData([]);
    }
  }, [selectedCampaign, rawData, platform]);

  // 3. Derived Helpers
  const dateHeaders = useMemo(() => {
    try {
      const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
      return days.reverse().map(d => format(d, 'yyyy-MM-dd'));
    } catch { return []; }
  }, [startDate, endDate]);

  const availableCampaigns = useMemo(() => {
    const campaigns = new Set(rawData.map(r => r.utm_campaign).filter(Boolean));
    return Array.from(campaigns).sort();
  }, [rawData]);

  const globalStats = useMemo(() => {
    return data.reduce((acc, curr) => ({
      sessions: acc.sessions + curr.totals.sessions,
      users: acc.users + curr.totals.users,
      pageviews: acc.pageviews + curr.totals.pageviews,
      engagement: acc.engagement + curr.totals.engagement_rate_avg
    }), { sessions: 0, users: 0, pageviews: 0, engagement: 0 });
  }, [data]);

  return {
    data, loading,
    filters: { 
      platform, setPlatform, startDate, setStartDate, endDate, setEndDate, 
      selectedCampaign, setSelectedCampaign, applyPreset, resetFilters 
    },
    options: { dateHeaders, availableCampaigns },
    stats: globalStats,
    refresh: loadData
  };
}