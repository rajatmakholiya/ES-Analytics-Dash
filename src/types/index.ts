export interface BackendMetric {
  event_day: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  sessions: number;
  pageviews: number;
  users: number;
  new_users: number;
  event_count: number;
  engagement_rate: string | number;
}

export interface DailyMetric {
  date: string;
  sessions: number;
  pageviews: number;
  users: number;
  new_users: number;
  event_count: number;
  engagement_rate: number;
}

export interface AggregatedPageData {
  pageName: string;
  category: string;
  totals: {
    sessions: number;
    pageviews: number;
    users: number;
    new_users: number;
    event_count: number;
    engagement_rate_avg: number;
  };
  dailyTrend: DailyMetric[];
}