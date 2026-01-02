'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../../../components/AuthHeader';
import Alert from '../../../../components/Alert';
import { ChevronLeft, BarChart3, Users, MousePointerClick, Eye, X, TrendingUp, Calendar, Download, Search, Filter, Copy, Check, ChevronDown, ChevronRight, FileText } from 'lucide-react';

const API_URL = '/api';

interface MetricsStats {
  total: {
    impressions: number;
    clicks: number;
    closes: number;
    uniqueVisitors: number;
    repeatVisitors: number;
    ctr: number;
  };
  today: {
    impressions: number;
    clicks: number;
  };
  elementClicks: {
    [key: string]: number;
  };
}

interface Metric {
  _id: string;
  eventType: 'impression' | 'click' | 'close';
  visitorId: string;
  elementSelector?: string;
  elementText?: string;
  url: string;
  userAgent?: string;
  isUniqueVisitor: boolean;
  isRepeatVisitor: boolean;
  timestamp: string;
}

interface FormSubmission {
  _id: string;
  formId: string;
  formObjectId: string;
  data: Record<string, any>;
  submittedAt: string;
  visitorId?: string;
  activityId: string;
}

export default function PopupMetricsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const activityId = params?.activityId as string;
  const projectId = searchParams.get('projectId');

  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [activity, setActivity] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MetricsStats | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(false);
  const [eventsSkip, setEventsSkip] = useState(0);
  const [formSubmissions, setFormSubmissions] = useState<Record<string, FormSubmission[]>>({});
  const [expandedVisitors, setExpandedVisitors] = useState<Set<string>>(new Set());
  const [loadingSubmissions, setLoadingSubmissions] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [filters, setFilters] = useState({
    eventType: '' as '' | 'impression' | 'click' | 'close',
    visitorType: 'unique' as '' | 'unique' | 'repeat',
    elementSelector: '',
    search: '', // Search by visitor ID
  });
  const [showFilters, setShowFilters] = useState(true);
  const [copiedVisitorId, setCopiedVisitorId] = useState<string | null>(null);
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  const copyVisitorId = async (visitorId: string) => {
    try {
      await navigator.clipboard.writeText(visitorId);
      setCopiedVisitorId(visitorId);
      setTimeout(() => setCopiedVisitorId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setAlert({
        isOpen: true,
        message: 'Failed to copy visitor ID',
        type: 'error',
      });
    }
  };

  const fetchFormSubmissions = async (visitorId: string) => {
    if (formSubmissions[visitorId] || loadingSubmissions.has(visitorId)) {
      return; // Already loaded or loading
    }

    setLoadingSubmissions(prev => new Set(prev).add(visitorId));

    try {
      const response = await axios.get(
        `${API_URL}/popup-activities/${activityId}/form-submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { visitorId },
        }
      );

      setFormSubmissions(prev => ({
        ...prev,
        [visitorId]: response.data.submissions || [],
      }));
    } catch (error: any) {
      console.error('Failed to fetch form submissions:', error);
    } finally {
      setLoadingSubmissions(prev => {
        const next = new Set(prev);
        next.delete(visitorId);
        return next;
      });
    }
  };

  const toggleVisitorExpansion = (visitorId: string) => {
    const newExpanded = new Set(expandedVisitors);
    if (newExpanded.has(visitorId)) {
      newExpanded.delete(visitorId);
    } else {
      newExpanded.add(visitorId);
      fetchFormSubmissions(visitorId);
    }
    setExpandedVisitors(newExpanded);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch stats (without events)
  const fetchStats = useCallback(async () => {
    if (!token || !activityId) return;
    try {
      const params: any = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (filters.eventType) params.eventType = filters.eventType;
      if (filters.visitorType) params.visitorType = filters.visitorType;
      if (filters.elementSelector) params.elementSelector = filters.elementSelector;
      if (filters.search) params.search = filters.search;
      params.limit = 0; // Don't fetch events, only stats

      const response = await axios.get(`${API_URL}/popup-activities/${activityId}/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setStats(response.data.stats);
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to fetch stats',
        type: 'error',
      });
    }
  }, [token, activityId, dateRange, filters]);

  // Fetch events with pagination
  const fetchEvents = useCallback(async (skip: number = 0, append: boolean = false) => {
    if (!token || !activityId) return;
    try {
      const params: any = {
        limit: 50,
        skip,
        eventsOnly: 'true', // Only fetch events, not stats
      };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (filters.eventType) params.eventType = filters.eventType;
      if (filters.visitorType) params.visitorType = filters.visitorType;
      if (filters.elementSelector) params.elementSelector = filters.elementSelector;
      if (filters.search) params.search = filters.search;

      const response = await axios.get(`${API_URL}/popup-activities/${activityId}/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (append) {
        setMetrics(prev => [...prev, ...(response.data.metrics || [])]);
      } else {
        setMetrics(response.data.metrics || []);
      }
      setHasMoreEvents(response.data.pagination?.hasMore || false);
      setEventsSkip(skip + (response.data.metrics?.length || 0));
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to fetch events',
        type: 'error',
      });
    }
  }, [token, activityId, dateRange, filters]);

  // Load more events
  const loadMoreEvents = async () => {
    if (loadingMoreEvents || !hasMoreEvents) return;
    setLoadingMoreEvents(true);
    await fetchEvents(eventsSkip, true);
    setLoadingMoreEvents(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token || !activityId || !projectId) {
        setLoading(false);
        return;
      }

      try {
        // Verify project access
        const projectResponse = await axios.get(`${API_URL}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjectInfo({
          name: projectResponse.data.project.name,
          role: projectResponse.data.project.role,
        });

        // Fetch popup activity
        const activityResponse = await axios.get(`${API_URL}/popup-activities/${activityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivity({ name: activityResponse.data.activity.name });

        // Fetch stats and initial events
        await Promise.all([
          fetchStats(),
          fetchEvents(0, false),
        ]);
      } catch (error: any) {
        console.error('Fetch error:', error);
        if (error.response?.status === 403 || error.response?.status === 404) {
          router.push('/projects');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, activityId, projectId, router]);

  // Refetch when filters change
  useEffect(() => {
    if (!user || !token || !activityId || !projectId) return;
    setEventsSkip(0);
    Promise.all([
      fetchStats(),
      fetchEvents(0, false),
    ]);
  }, [user, token, activityId, projectId, dateRange, filters, fetchStats, fetchEvents]);

  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilters({
      eventType: '',
      visitorType: 'unique',
      elementSelector: '',
      search: '',
    });
  };

  const hasActiveFilters = () => {
    return !!(
      dateRange.startDate ||
      dateRange.endDate ||
      filters.eventType ||
      filters.visitorType ||
      filters.elementSelector ||
      filters.search
    );
  };

  // Get unique element selectors for dropdown
  const uniqueElementSelectors = Array.from(
    new Set(metrics.filter(m => m.elementSelector).map(m => m.elementSelector))
  ).sort();

  const exportToCSV = async () => {
    if (!metrics.length) return;

    // Get all unique visitor IDs
    const uniqueVisitorIds = Array.from(new Set(metrics.map(m => m.visitorId)));
    
    // Fetch form submissions for all visitors
    const allFormSubmissions: Record<string, FormSubmission[]> = {};
    try {
      await Promise.all(
        uniqueVisitorIds.map(async (visitorId) => {
          try {
            const response = await axios.get(
              `${API_URL}/popup-activities/${activityId}/form-submissions`,
              {
                headers: { Authorization: `Bearer ${token}` },
                params: { visitorId },
              }
            );
            allFormSubmissions[visitorId] = response.data.submissions || [];
          } catch (error) {
            console.error(`Failed to fetch submissions for visitor ${visitorId}:`, error);
            allFormSubmissions[visitorId] = [];
          }
        })
      );
    } catch (error) {
      console.error('Error fetching form submissions:', error);
    }

    // Create rows - one per metric, with form submission info included
    const rows: string[][] = [];
    
    metrics.forEach(m => {
      const visitorSubmissions = allFormSubmissions[m.visitorId] || [];
      
      if (visitorSubmissions.length === 0) {
        // No form submissions
        rows.push([
          new Date(m.timestamp).toLocaleString(),
          m.eventType,
          m.visitorId,
          m.elementSelector || '-',
          (m.elementText || '-').replace(/"/g, '&quot;'),
          m.url,
          m.isUniqueVisitor ? 'Yes' : 'No',
          m.isRepeatVisitor ? 'Yes' : 'No',
          '0', // Form Submission Count
          '-', // Form IDs
          '-', // Form Submission Dates
          '-', // Form Data Summary
        ]);
      } else {
        // Combine all form submissions for this visitor
        const formIds = visitorSubmissions.map(s => s.formId).join('; ');
        const submissionDates = visitorSubmissions.map(s => new Date(s.submittedAt).toLocaleString()).join('; ');
        const formDataSummary = visitorSubmissions.map((submission, idx) => {
          const dataStr = Object.entries(submission.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
            .join(', ');
          return `[Submission ${idx + 1}] ${dataStr}`;
        }).join(' | ');
        
        rows.push([
          new Date(m.timestamp).toLocaleString(),
          m.eventType,
          m.visitorId,
          m.elementSelector || '-',
          (m.elementText || '-').replace(/"/g, '&quot;'),
          m.url,
          m.isUniqueVisitor ? 'Yes' : 'No',
          m.isRepeatVisitor ? 'Yes' : 'No',
          String(visitorSubmissions.length), // Form Submission Count
          formIds,
          submissionDates,
          formDataSummary,
        ]);
      }
    });

    const headers = [
      'Timestamp',
      'Event Type',
      'Visitor ID',
      'Element Selector',
      'Element Text',
      'URL',
      'Unique Visitor',
      'Repeat Visitor',
      'Form Submission Count',
      'Form IDs',
      'Form Submission Dates',
      'Form Data Summary'
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popup-metrics-${activityId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!projectId || !projectInfo || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Not Found</h2>
          <Link href="/projects" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Go to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AuthHeader showProjectInfo={projectInfo} projectId={projectId} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/popups/${activityId}?projectId=${projectId}`}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Popup Metrics</h1>
                <p className="text-sm text-gray-500 mt-1">{activity.name}</p>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              disabled={!metrics.length}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Filters Section - At Top */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {hasActiveFilters() && (
                  <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {showFilters ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="p-6 space-y-4">
                {/* Search by Visitor ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Search by Visitor ID
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Enter visitor ID to search..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  {/* Event Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      value={filters.eventType}
                      onChange={(e) => setFilters({ ...filters, eventType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    >
                      <option value="">All Events</option>
                      <option value="impression">Impressions</option>
                      <option value="click">Clicks</option>
                      <option value="close">Closes</option>
                    </select>
                  </div>

                  {/* Visitor Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visitor Type
                    </label>
                    <select
                      value={filters.visitorType}
                      onChange={(e) => setFilters({ ...filters, visitorType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    >
                      <option value="">All Visitors</option>
                      <option value="unique">Unique Visitors</option>
                      <option value="repeat">Repeat Visitors</option>
                    </select>
                  </div>
                </div>

                {/* Element Selector Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Element Selector
                  </label>
                  <select
                    value={filters.elementSelector}
                    onChange={(e) => setFilters({ ...filters, elementSelector: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="">All Elements</option>
                    {uniqueElementSelectors.map((selector) => (
                      <option key={selector} value={selector}>
                        {selector}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Two Column Layout: Left (Stats) | Right (Recent Events) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Stats Cards and Element Click Breakdown */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Cards */}
              {stats && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Impressions</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total.impressions.toLocaleString()}</p>
                        {stats.today.impressions > 0 && (
                          <p className="text-xs text-green-600 mt-1">+{stats.today.impressions} today</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Clicks</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total.clicks.toLocaleString()}</p>
                        {stats.today.clicks > 0 && (
                          <p className="text-xs text-green-600 mt-1">+{stats.today.clicks} today</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MousePointerClick className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Click-Through Rate</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total.ctr.toFixed(2)}%</p>
                        <p className="text-xs text-gray-500 mt-1">CTR</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Unique Visitors</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total.uniqueVisitors.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">{stats.total.repeatVisitors} repeat</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Element Click Breakdown */}
              {stats && stats.elementClicks && Object.keys(stats.elementClicks).length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Element Click Breakdown</h2>
                  <div className="space-y-2">
                    {Object.entries(stats.elementClicks)
                      .sort((a, b) => b[1] - a[1])
                      .map(([selector, count]) => {
                        // Find the most common element text for this selector
                        const elementTexts = metrics
                          .filter(m => m.eventType === 'click' && m.elementSelector === selector && m.elementText)
                          .map(m => m.elementText || '')
                          .filter(Boolean);
                        const mostCommonText = elementTexts.length > 0 
                          ? elementTexts.reduce((a, b, _, arr) => 
                              arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
                            )
                          : null;

                        return (
                          <div key={selector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <code className="text-sm text-gray-700 font-mono block mb-1">{selector}</code>
                              {mostCommonText && (
                                <span className="text-xs text-gray-500 italic">&quot;{mostCommonText.length > 60 ? mostCommonText.substring(0, 60) + '...' : mostCommonText}&quot;</span>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-indigo-600 ml-4">{count} clicks</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Recent Events */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
                  {hasMoreEvents && (
                    <button
                      onClick={loadMoreEvents}
                      disabled={loadingMoreEvents}
                      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingMoreEvents ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Load More
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Element</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Element Text</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {metrics.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No metrics data available yet
                          </td>
                        </tr>
                      ) : (
                        metrics.map((metric) => (
                          <>
                            <tr key={metric._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {new Date(metric.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  metric.eventType === 'impression' ? 'bg-blue-100 text-blue-800' :
                                  metric.eventType === 'click' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {metric.eventType}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {metric.elementSelector ? (
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{metric.elementSelector}</code>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {metric.elementText ? (
                                  <span className="text-gray-900" title={metric.elementText}>
                                    {metric.elementText.length > 50 
                                      ? `${metric.elementText.substring(0, 50)}...` 
                                      : metric.elementText}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleVisitorExpansion(metric.visitorId)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    title={expandedVisitors.has(metric.visitorId) ? 'Hide form submissions' : 'Show form submissions'}
                                  >
                                    {expandedVisitors.has(metric.visitorId) ? (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-500" />
                                    )}
                                  </button>
                                  <div className="flex items-center gap-1.5 group">
                                    <span 
                                      className="font-mono text-xs cursor-pointer hover:text-indigo-600 transition-colors" 
                                      title={`Full ID: ${metric.visitorId}\nClick to copy`}
                                      onClick={() => copyVisitorId(metric.visitorId)}
                                    >
                                      {metric.visitorId.substring(0, 8)}...
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyVisitorId(metric.visitorId);
                                      }}
                                      className="opacity-60 group-hover:opacity-100 hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                                      title="Copy full visitor ID"
                                    >
                                      {copiedVisitorId === metric.visitorId ? (
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5 text-gray-500 hover:text-indigo-600" />
                                      )}
                                    </button>
                                  </div>
                                  {metric.isUniqueVisitor && (
                                    <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">New</span>
                                  )}
                                  {metric.isRepeatVisitor && (
                                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Return</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                {metric.url}
                              </td>
                            </tr>
                            {expandedVisitors.has(metric.visitorId) && (
                              <tr key={`${metric._id}-submissions`} className="bg-gray-50">
                                <td colSpan={6} className="px-6 py-4">
                                  {loadingSubmissions.has(metric.visitorId) ? (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                      Loading form submissions...
                                    </div>
                                  ) : formSubmissions[metric.visitorId]?.length > 0 ? (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-4 h-4 text-indigo-600" />
                                        <h4 className="text-sm font-semibold text-gray-900">
                                          Form Submissions ({formSubmissions[metric.visitorId].length})
                                        </h4>
                                      </div>
                                      <div className="space-y-2">
                                        {formSubmissions[metric.visitorId].map((submission) => (
                                          <div
                                            key={submission._id}
                                            className="bg-white border border-gray-200 rounded-lg p-4"
                                          >
                                            <div className="flex items-start justify-between mb-2">
                                              <div className="flex items-center gap-3">
                                                <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                                                  Form ID: {submission.formId}
                                                </span>
                                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                                  Popup ID: {submission.activityId.substring(0, 8)}...
                                                </span>
                                              </div>
                                              <span className="text-xs text-gray-500">
                                                {new Date(submission.submittedAt).toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="mt-2 space-y-1">
                                              {Object.entries(submission.data).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                  <span className="font-medium text-gray-700">{key}:</span>{' '}
                                                  <span className="text-gray-900">
                                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                      No form submissions found for this visitor
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {hasMoreEvents && (
                  <div className="px-6 py-4 border-t border-gray-200 text-center">
                    <button
                      onClick={loadMoreEvents}
                      disabled={loadingMoreEvents}
                      className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {loadingMoreEvents ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Loading more events...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Load More Events
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
}

