export interface EventResult {
  title: string;
  date?: { when: string };
  venue?: { name: string; rating?: number; reviews?: number };
  address?: string[];
  description?: string;
  ticket_info?: Array<{ source: string; link_type: string }>;
  link?: string;
  [key: string]: any;
}

export interface SearchMetadata {
  search_id: string;
  query: string;
  location?: string;
  date_filter?: string;
  event_type?: string;
  language: string;
  country: string;
  search_timestamp: string;
  total_results: number;
}

export interface ProcessedResults {
  search_metadata: SearchMetadata;
  search_parameters: any;
  search_information: any;
  events_results: EventResult[];
} 