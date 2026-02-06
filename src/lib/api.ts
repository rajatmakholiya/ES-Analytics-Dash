import { AggregatedPageData, BackendMetric } from '@/types';
import axios from 'axios';
import { PAGE_MAPPING_DATA, MappingEntry } from '@/data/page-mapping';

const API_BASE_URL = 'http://localhost:4000/v1/analytics';

// ---------------------------------------------------------------------------
// 1. GENERATE LOOKUP MAP (Run once on load)
// ---------------------------------------------------------------------------

interface PageInfo {
  pageName: string;
  category: string;
}

// Transform the TS Array into a fast lookup object
const MAPPING_LOOKUP: Record<string, PageInfo> = {};

PAGE_MAPPING_DATA.forEach((entry: MappingEntry) => {
  entry.utmMediums.forEach(medium => {
    MAPPING_LOOKUP[medium] = {
      pageName: entry.pageName,
      category: entry.category
    };
  });
});

// ---------------------------------------------------------------------------
// 2. API FUNCTIONS
// ---------------------------------------------------------------------------

export async function fetchAnalyticsData(startDate: string, endDate: string, source: string): Promise<BackendMetric[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/utm/metrics`, {
      params: {
        rollup: 'daily',
        startDate,
        endDate,
        utmSource: source
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export function processDataForDashboard(
  rawData: BackendMetric[], 
  platform: 'Facebook' | 'Threads',
  selectedCampaign: string
): AggregatedPageData[] {
  
  const grouped: Record<string, AggregatedPageData> = {};

  rawData.forEach(row => {
    // 1. Filter by Campaign if selected
    if (selectedCampaign && row.utm_campaign !== selectedCampaign) return;

    // 2. Resolve Page Name using Lookup Map
    const rawMedium = row.utm_medium || '';
    const mappedInfo = MAPPING_LOOKUP[rawMedium];
    
    // Fallback: If not in JSON, use raw name and 'Other' category
    const pageName = mappedInfo ? mappedInfo.pageName : rawMedium;
    const category = mappedInfo ? mappedInfo.category : 'Other';

    // 3. Initialize Group if it doesn't exist
    if (!grouped[pageName]) {
      grouped[pageName] = {
        pageName,
        category,
        totals: {
          sessions: 0,
          pageviews: 0,
          users: 0,
          new_users: 0,
          event_count: 0,
          engagement_rate_avg: 0
        },
        dailyTrend: []
      };
    }

    const pageEntry = grouped[pageName];
    const parsedEngagement = parseFloat(String(row.engagement_rate)) || 0;

    // 4. Update Totals
    pageEntry.totals.sessions += Number(row.sessions);
    pageEntry.totals.pageviews += Number(row.pageviews);
    pageEntry.totals.users += Number(row.users);
    pageEntry.totals.new_users += Number(row.new_users);
    pageEntry.totals.event_count += Number(row.event_count);
    
    // 5. Aggregation Logic for Daily Trend
    const existingDay = pageEntry.dailyTrend.find(d => d.date === row.event_day);

    if (existingDay) {
      // If we have multiple entries for the same day (e.g. diff campaigns), sum them up
      existingDay.sessions += Number(row.sessions);
      existingDay.pageviews += Number(row.pageviews);
      existingDay.users += Number(row.users);
      existingDay.new_users += Number(row.new_users);
      existingDay.event_count += Number(row.event_count);
      
      // Average the engagement rate for the day
      existingDay.engagement_rate = (existingDay.engagement_rate + parsedEngagement) / 2;
    } else {
      // Create new entry for this date
      pageEntry.dailyTrend.push({
        date: row.event_day,
        sessions: Number(row.sessions),
        pageviews: Number(row.pageviews),
        users: Number(row.users),
        new_users: Number(row.new_users),
        event_count: Number(row.event_count),
        engagement_rate: parsedEngagement
      });
    }
  });

  // 6. Calculate Average Engagement Rate for the entire period
  Object.values(grouped).forEach(page => {
    const totalEngRates = page.dailyTrend.reduce((acc, curr) => acc + curr.engagement_rate, 0);
    // Avoid division by zero
    page.totals.engagement_rate_avg = page.dailyTrend.length ? (totalEngRates / page.dailyTrend.length) : 0;
  });

  return Object.values(grouped);
}