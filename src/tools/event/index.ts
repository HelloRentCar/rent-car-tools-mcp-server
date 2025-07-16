import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';
import { EventResult, ProcessedResults } from '../../types/events';

const EVENTS_DIR = 'events';

function getSerpApiKey(): string {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error('SERPAPI_KEY environment variable is required');
  return apiKey;
}

export const EVENTS_TOOLS = [
  {
    name: "search_events",
    description: "搜索活动事件，支持关键词、地点、时间、类型等过滤。",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索关键词" },
        location: { type: "string", description: "地点，可选" },
        date_filter: { type: "string", description: "时间过滤，可选" },
        event_type: { type: "string", description: "事件类型，可选" },
        language: { type: "string", description: "语言代码，可选，默认en" },
        country: { type: "string", description: "国家代码，可选，默认us" },
        max_results: { type: "number", description: "最大返回数量，可选，默认20" }
      }
    }
  },
  {
    name: "get_event_details",
    description: "获取指定搜索ID的事件详情。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" }
      }
    }
  },
  {
    name: "filter_events_by_date",
    description: "按日期范围或具体日期过滤事件。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" },
        date_range: { type: "string", description: "日期范围，如today、week等，可选" },
        specific_date: { type: "string", description: "具体日期YYYY-MM-DD，可选" }
      }
    }
  },
  {
    name: "filter_events_by_type",
    description: "按类型过滤事件。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" },
        event_types: { type: "array", items: { type: "string" }, description: "事件类型数组" }
      }
    }
  },
  {
    name: "filter_events_by_venue",
    description: "按场馆名称过滤事件。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" },
        venue_names: { type: "array", items: { type: "string" }, description: "场馆名称数组" }
      }
    }
  },
  {
    name: "get_event_searches",
    description: "获取所有已保存的事件搜索列表。",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "get_event_search_details",
    description: "获取指定搜索ID的详细事件搜索信息（markdown格式）。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" }
      }
    }
  },
  {
    name: "event_discovery_prompt",
    description: "生成事件发现的AI提示词。",
    inputSchema: {
      type: "object",
      properties: {
        location: { type: "string" },
        interests: { type: "string" },
        date_preference: { type: "string" },
        event_type: { type: "string" },
        budget: { type: "string" }
      }
    }
  },
  {
    name: "event_comparison_prompt",
    description: "生成事件对比分析的AI提示词。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string" }
      }
    }
  }
];

export async function searchEvents(params: {
  query: string;
  location?: string;
  date_filter?: string;
  event_type?: string;
  language?: string;
  country?: string;
  max_results?: number;
}): Promise<any> {
  const {
    query, location, date_filter, event_type,
    language = 'en', country = 'us', max_results = 20
  } = params;

  const apiKey = getSerpApiKey();
  let searchQuery = query;
  if (location) searchQuery += ` in ${location}`;

  const serpParams: any = {
    engine: 'google_events',
    api_key: apiKey,
    q: searchQuery,
    hl: language,
    gl: country,
  };

  const filters: string[] = [];
  if (date_filter) filters.push(`date:${date_filter}`);
  if (event_type) filters.push(`event_type:${event_type}`);
  if (filters.length) serpParams.htichips = filters.join(',');

  const response = await axios.get('https://serpapi.com/search', { params: serpParams });
  const eventData = response.data;

  const searchId = [
    query.replace(/\s+/g, '_'),
    location || 'global',
    date_filter,
    event_type,
    dayjs().format('YYYYMMDD_HHmmss')
  ].filter(Boolean).join('_');

  await fs.mkdir(EVENTS_DIR, { recursive: true });

  const eventsResults: EventResult[] = (eventData.events_results || []).slice(0, max_results);

  const processedResults: ProcessedResults = {
    search_metadata: {
      search_id: searchId,
      query, location, date_filter, event_type, language, country,
      search_timestamp: dayjs().toISOString(),
      total_results: eventsResults.length
    },
    search_parameters: eventData.search_parameters,
    search_information: eventData.search_information,
    events_results: eventsResults
  };

  const filePath = path.join(EVENTS_DIR, `${searchId}.json`);
  await fs.writeFile(filePath, JSON.stringify(processedResults, null, 2));

  return {
    search_id: searchId,
    total_events: eventsResults.length,
    query, location,
    filters_applied: { date_filter, event_type },
    sample_events: eventsResults.slice(0, 3).map(event => ({
      title: event.title || 'N/A',
      date: event.date?.when || 'N/A',
      venue: event.venue?.name || 'N/A'
    })),
    search_parameters: processedResults.search_metadata
  };
}

export async function getEventDetails(searchId: string): Promise<string> {
  const filePath = path.join(EVENTS_DIR, `${searchId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (e) {
    return `No event search found with ID: ${searchId}`;
  }
}

export async function filterEventsByDate(searchId: string, date_range?: string, specific_date?: string): Promise<string> {
  const filePath = path.join(EVENTS_DIR, `${searchId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const eventData: ProcessedResults = JSON.parse(data);
    const events = eventData.events_results;
    const filtered_events = events.filter(event => {
      const event_date: any = event.date || {};
      if (date_range) {
        return event_date.when?.toLowerCase().includes(date_range.toLowerCase());
      } else if (specific_date) {
        return event_date.when?.includes(specific_date);
      }
      return true;
    });
    return JSON.stringify({
      search_id: searchId,
      filters_applied: { date_range, specific_date },
      filtered_events,
      total_filtered: filtered_events.length
    }, null, 2);
  } catch (e) {
    return `Error processing event data for ${searchId}: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function filterEventsByType(searchId: string, event_types: string[]): Promise<string> {
  const filePath = path.join(EVENTS_DIR, `${searchId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const eventData: ProcessedResults = JSON.parse(data);
    const events = eventData.events_results;
    const filtered_events = events.filter(event => {
      const title = event.title?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';
      return event_types.some(type => title.includes(type.toLowerCase()) || description.includes(type.toLowerCase()));
    });
    return JSON.stringify({
      search_id: searchId,
      filters_applied: { event_types },
      filtered_events,
      total_filtered: filtered_events.length
    }, null, 2);
  } catch (e) {
    return `Error processing event data for ${searchId}: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function filterEventsByVenue(searchId: string, venue_names: string[]): Promise<string> {
  const filePath = path.join(EVENTS_DIR, `${searchId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const eventData: ProcessedResults = JSON.parse(data);
    const events = eventData.events_results;
    const filtered_events = events.filter(event => {
      const venue_name = event.venue?.name?.toLowerCase() || '';
      return venue_names.some(name => venue_name.includes(name.toLowerCase()));
    });
    return JSON.stringify({
      search_id: searchId,
      filters_applied: { venue_names },
      filtered_events,
      total_filtered: filtered_events.length
    }, null, 2);
  } catch (e) {
    return `Error processing event data for ${searchId}: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function getEventSearches(): Promise<string> {
  let searches: any[] = [];
  try {
    const files = await fs.readdir(EVENTS_DIR);
    for (const filename of files) {
      if (filename.endsWith('.json')) {
        const search_id = filename.slice(0, -5);
        const filePath = path.join(EVENTS_DIR, filename);
        try {
          const data = await fs.readFile(filePath, 'utf-8');
          const json = JSON.parse(data);
          const metadata = json.search_metadata || {};
          searches.push({
            search_id,
            query: metadata.query || 'N/A',
            location: metadata.location || 'N/A',
            date_filter: metadata.date_filter || 'None',
            event_type: metadata.event_type || 'None',
            total_results: metadata.total_results || 0,
            search_time: metadata.search_timestamp || 'N/A'
          });
        } catch { }
      }
    }
  } catch { }
  let content = '# Event Searches\n\n';
  if (searches.length) {
    content += `Total searches: ${searches.length}\n\n`;
    for (const search of searches) {
      content += `## ${search.search_id}\n`;
      content += `- **Query**: ${search.query}\n`;
      content += `- **Location**: ${search.location}\n`;
      content += `- **Date Filter**: ${search.date_filter}\n`;
      content += `- **Event Type**: ${search.event_type}\n`;
      content += `- **Total Results**: ${search.total_results}\n`;
      content += `- **Search Time**: ${search.search_time}\n\n`;
      content += '---\n\n';
    }
  } else {
    content += 'No event searches found.\n\nUse the searchEvents tool to search for events.\n';
  }
  return content;
}

export async function getEventSearchDetails(searchId: string): Promise<string> {
  const filePath = path.join(EVENTS_DIR, `${searchId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const eventData: ProcessedResults = JSON.parse(data);
    const metadata = eventData.search_metadata;
    const events = eventData.events_results;
    let content = `# Event Search: ${searchId}\n\n`;
    content += '## Search Details\n';
    content += `- **Query**: ${metadata.query}\n`;
    content += `- **Location**: ${metadata.location}\n`;
    content += `- **Date Filter**: ${metadata.date_filter}\n`;
    content += `- **Event Type**: ${metadata.event_type}\n`;
    content += `- **Language**: ${metadata.language}\n`;
    content += `- **Country**: ${metadata.country}\n`;
    content += `- **Total Results**: ${metadata.total_results}\n`;
    content += `- **Search Time**: ${metadata.search_timestamp}\n\n`;
    if (events.length) {
      content += `## Events Found (${events.length})\n\n`;
      for (let i = 0; i < Math.min(events.length, 10); i++) {
        const event = events[i];
        content += `### ${i + 1}. ${event.title || 'N/A'}\n`;
        const date_info: any = event.date || {};
        content += `- **When**: ${date_info.when || 'N/A'}\n`;
        const address = event.address || [];
        if (address.length) content += `- **Address**: ${address.join(', ')}\n`;
        const venue: any = event.venue || {};
        if (venue.name) {
          content += `- **Venue**: ${venue.name}`;
          if (venue.rating) content += ` (Rating: ${venue.rating}/5, ${venue.reviews || 0} reviews)`;
          content += '\n';
        }
        const description = event.description || '';
        if (description) content += `- **Description**: ${description.slice(0, 200)}${description.length > 200 ? '...' : ''}\n`;
        const ticket_info = event.ticket_info || [];
        if (ticket_info.length) {
          content += `- **Tickets Available**: ${ticket_info.length} sources\n`;
          for (let j = 0; j < Math.min(ticket_info.length, 2); j++) {
            const ticket = ticket_info[j];
            content += `  - ${ticket.source || 'N/A'}: ${ticket.link_type || 'info'}\n`;
          }
        }
        content += `- **Event Link**: ${event.link || 'N/A'}\n\n---\n\n`;
      }
    } else {
      content += 'No events found for this search.\n';
    }
    return content;
  } catch (e) {
    return `# Event Search Not Found: ${searchId}\n\nNo event search found with this ID.`;
  }
}

export function eventDiscoveryPrompt(params: {
  location: string;
  interests?: string;
  date_preference?: string;
  event_type?: string;
  budget?: string;
}): string {
  const { location, interests = '', date_preference = '', event_type = '', budget = '' } = params;
  let prompt = `Help me discover interesting events in ${location}`;
  if (interests) prompt += ` related to my interests: ${interests}`;
  if (date_preference) prompt += ` for ${date_preference}`;
  if (event_type) prompt += `, specifically ${event_type} events`;
  prompt += '.';
  if (budget) prompt += ` My budget consideration: ${budget}.`;
  prompt += `\n\nPlease help me find and explore events using the following approach:\n\n1. **Event Search**: Use the searchEvents tool to find events:\n   - Location: ${location}\n   - Query: ${interests || 'events'}`;
  if (date_preference) prompt += `\n   - Date filter: ${date_preference}`;
  if (event_type) prompt += `\n   - Event type: ${event_type}`;
  prompt += `\n\n2. **Event Analysis**: Once events are found, provide:\n   - Summary of the most interesting events with highlights\n   - Categorization by event type (concerts, festivals, arts, sports, etc.)\n   - Date and time analysis for planning\n   - Venue information and accessibility\n   - Ticket availability and pricing insights\n\n3. **Personalized Recommendations**: Based on my interests and preferences:\n   - Top 5 recommended events with detailed reasoning\n   - Alternative events that might be of interest\n   - Hidden gems or lesser-known events\n   - Seasonal or timely events I shouldn't miss\n\n4. **Practical Information**: For recommended events:\n   - Venue details and how to get there\n   - Parking and transportation options\n   - What to expect and how to prepare\n   - Ticket purchasing recommendations\n\n5. **Event Planning**: Help me plan around the events:\n   - Suggested itineraries if multiple events are selected\n   - Nearby restaurants or activities\n   - Timing considerations and scheduling tips\n\nUse the event search tools first, then provide comprehensive analysis and personalized recommendations based on the results. Focus on events that align with my interests and preferences.`;
  return prompt;
}

export function eventComparisonPrompt(searchId: string): string {
  return `Analyze and compare the events from search ID: ${searchId}\n\nPlease provide a comprehensive analysis including:\n\n1. **Event Overview**: Use getEventDetails('${searchId}') to retrieve the complete event data\n\n2. **Event Categorization**:\n   - Group events by type (concerts, festivals, arts, sports, networking, etc.)\n   - Identify recurring events vs one-time events\n   - Highlight free vs paid events\n\n3. **Detailed Comparison**:\n   - Date and time analysis (weekday vs weekend, time of day)\n   - Venue comparison (indoor vs outdoor, capacity, accessibility)\n   - Ticket pricing and availability analysis\n   - Duration and format of events\n\n4. **Quality Indicators**:\n   - Venue ratings and reviews\n   - Event popularity and attendance expectations\n   - Organizer reputation and event history\n\n5. **Filtering Recommendations**:\n   - Use filterEventsByDate for specific time preferences\n   - Use filterEventsByType for category-specific events\n   - Use filterEventsByVenue for preferred locations\n\n6. **Top Recommendations**:\n   - Best value events (quality vs price)\n   - Most unique or special events\n   - Most accessible events\n   - Events suitable for different group sizes\n\n7. **Planning Considerations**:\n   - Events that can be combined in a single day/weekend\n   - Advance booking requirements\n   - Weather considerations for outdoor events\n   - Transportation and parking logistics\n\nPlease format the analysis in a clear, organized structure with specific recommendations for different types of event-goers (families, couples, solo attendees, groups).`;
} 