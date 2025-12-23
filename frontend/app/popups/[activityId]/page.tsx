'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../../components/AuthHeader';
import Alert from '../../../components/Alert';
import { ChevronLeft, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = '/api';

interface UrlCondition {
  type: 'contains' | 'equals' | 'landing' | 'startsWith' | 'doesNotContain';
  value: string;
  domain?: string;
}

interface PopupActivity {
  _id: string;
  name: string;
  projectId: string;
  userId: string;
  urlConditions: UrlCondition[];
  logicOperator: 'AND' | 'OR';
  html: string;
  status: 'draft' | 'deactivated' | 'activated';
  createdAt: string;
  updatedAt: string;
}

export default function PopupActivityPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const activityId = params?.activityId as string;
  const projectId = searchParams.get('projectId');

  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [activity, setActivity] = useState<PopupActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '', // Single domain for the entire popup
    urlConditions: [] as UrlCondition[],
    logicOperators: [] as ('AND' | 'OR')[], // One operator between each pair of conditions
    html: '',
    status: 'draft' as 'draft' | 'deactivated' | 'activated',
  });
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });
  const [isBasicSettingsCollapsed, setIsBasicSettingsCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
        const fetchedActivity = activityResponse.data.activity;
        setActivity(fetchedActivity);
        // Convert single logicOperator to array of operators (defaulting all to the same operator)
        const logicOperator = fetchedActivity.logicOperator || 'OR';
        const logicOperators = (fetchedActivity.urlConditions || []).length > 1
          ? Array((fetchedActivity.urlConditions || []).length - 1).fill(logicOperator)
          : [];
        
        // Extract domain from first condition if exists (for backward compatibility)
        const domain = (fetchedActivity.urlConditions || [])[0]?.domain || '';
        
        setFormData({
          name: fetchedActivity.name,
          domain: domain,
          urlConditions: fetchedActivity.urlConditions || [],
          logicOperators: logicOperators,
          html: fetchedActivity.html || '',
          status: fetchedActivity.status || 'draft',
        });
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

  const addUrlCondition = () => {
    setFormData({
      ...formData,
      urlConditions: [
        ...formData.urlConditions,
        { type: 'contains', value: '', domain: '' }
      ],
      // Add default 'OR' operator when adding a new condition (if there are existing conditions)
      logicOperators: formData.urlConditions.length > 0 
        ? [...formData.logicOperators, 'OR']
        : formData.logicOperators,
    });
  };

  const updateUrlCondition = (index: number, field: keyof UrlCondition, value: string) => {
    const updated = [...formData.urlConditions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, urlConditions: updated });
  };

  const removeUrlCondition = (index: number) => {
    const updated = formData.urlConditions.filter((_, i) => i !== index);
    // Remove the corresponding logic operator
    const updatedOperators = formData.logicOperators.filter((_, i) => {
      // If removing first condition, remove first operator
      // If removing any other, remove the operator before it
      return index === 0 ? i !== 0 : i !== index - 1;
    });
    setFormData({ ...formData, urlConditions: updated, logicOperators: updatedOperators });
  };

  const updateLogicOperator = (index: number, operator: 'AND' | 'OR') => {
    const updated = [...formData.logicOperators];
    updated[index] = operator;
    setFormData({ ...formData, logicOperators: updated });
  };

  const handleSave = async () => {
    if (!activityId || !formData.name.trim()) {
      setAlert({
        isOpen: true,
        message: 'Popup name is required',
        type: 'error',
      });
      return;
    }

    // Validate URL conditions
    const validConditions = formData.urlConditions.filter(
      cond => cond.value.trim() || cond.type === 'landing'
    );

    // Apply single domain to all conditions
    const conditionsWithDomain = validConditions.map(cond => ({
      ...cond,
      domain: formData.domain.trim() || undefined,
    }));

    // Use the first logic operator, or default to 'OR' if none
    const logicOperator = formData.logicOperators.length > 0 
      ? formData.logicOperators[0] 
      : 'OR';

    setSaving(true);
    try {
      const response = await axios.put(
        `${API_URL}/popup-activities/${activityId}`,
        {
          name: formData.name.trim(),
          urlConditions: conditionsWithDomain,
          logicOperator: logicOperator,
          html: formData.html,
          status: formData.status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActivity(response.data.activity);
      setAlert({
        isOpen: true,
        message: 'Popup activity updated successfully',
        type: 'success',
      });
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to update popup activity',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this popup activity? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/popup-activities/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push(`/popups?projectId=${projectId}`);
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to delete popup activity',
        type: 'error',
      });
    }
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

  if (!activity || !projectInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Popup Activity Not Found</h2>
          <Link href={`/popups?projectId=${projectId}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AuthHeader showProjectInfo={projectInfo} projectId={projectId || ''} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/popups?projectId=${projectId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Popup Activity</h1>
              <p className="text-sm text-gray-500 mt-1">{activity.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Main Content - Full Screen */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - Settings */}
          {!isSidebarCollapsed && (
            <div className="w-64 overflow-y-auto bg-white border-r border-gray-200 p-3 space-y-3 flex-shrink-0">
            {/* Popup Name */}
            <div>
              <button
                onClick={() => setIsBasicSettingsCollapsed(!isBasicSettingsCollapsed)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors"
              >
                <span>Basic Settings</span>
                {isBasicSettingsCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
              {!isBasicSettingsCollapsed && (
                <>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Popup Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'deactivated' | 'activated' })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="deactivated">Deactivated</option>
                      <option value="activated">Activated</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* URL Conditions */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Enable Popup on Page</h2>

                {/* Domain Name - Single field at top */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Domain Name *
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="example.com"
                    required
                  />
                </div>

                {/* URL Conditions */}
                <div className="space-y-2">
                  {formData.urlConditions.map((condition, index) => (
                    <div key={index}>
                      {/* AND/OR Selector - Show between conditions */}
                      {index > 0 && (
                        <div className="mb-2 flex items-center justify-center">
                          <select
                            value={formData.logicOperators[index - 1] || 'OR'}
                            onChange={(e) => updateLogicOperator(index - 1, e.target.value as 'AND' | 'OR')}
                            className="px-2 py-1 border-2 border-indigo-300 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer hover:bg-indigo-100 transition-colors"
                          >
                            <option value="OR">OR</option>
                            <option value="AND">AND</option>
                          </select>
                        </div>
                      )}

                      <div className="border border-gray-200 rounded p-2 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">#{index + 1}</span>
                          <button
                            onClick={() => removeUrlCondition(index)}
                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                          >
                            ×
                          </button>
                        </div>

                        {/* Condition Type - Enhanced Select */}
                        <div className="mb-2">
                          <label className="block text-xs font-medium text-gray-600 mb-0.5">
                            Type
                          </label>
                          <select
                            value={condition.type}
                            onChange={(e) => updateUrlCondition(index, 'type', e.target.value)}
                            className="w-full px-2 py-1.5 pr-7 text-xs border-2 border-gray-300 rounded font-medium bg-white text-gray-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer hover:border-indigo-400 transition-colors appearance-none bg-no-repeat bg-right bg-[length:1em_1em]"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            }}
                          >
                            <option value="contains">Contains</option>
                            <option value="equals">Equals</option>
                            <option value="landing">Landing Page</option>
                            <option value="startsWith">Starts With</option>
                            <option value="doesNotContain">Does Not Contain</option>
                          </select>
                        </div>

                        {/* URL Value (hidden for landing page) */}
                        {condition.type !== 'landing' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-0.5">
                              URL Value *
                            </label>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateUrlCondition(index, 'value', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              placeholder={
                                condition.type === 'contains' ? '/products' :
                                condition.type === 'equals' ? 'https://example.com/page' :
                                condition.type === 'startsWith' ? '/blog' :
                                '/exclude'
                              }
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addUrlCondition}
                  className="mt-2 w-full px-2 py-1.5 text-xs text-indigo-600 border border-indigo-300 rounded hover:bg-indigo-50 transition-colors font-medium"
                >
                  + Add Condition
                </button>
            </div>
          </div>
          )}

          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex-shrink-0 w-6 bg-gray-100 hover:bg-gray-200 border-r border-gray-200 flex items-center justify-center transition-colors"
            title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-600 rotate-[-90deg]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 rotate-90" />
            )}
          </button>

          {/* Right Column - HTML Editor */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white">
            <div className="flex-1 flex flex-col p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Popup HTML Content</h2>
              <textarea
                value={formData.html}
                onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm resize-none"
                placeholder="Enter HTML content for your popup..."
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the HTML content that will be displayed in the popup. You can use any HTML, CSS, and JavaScript.
              </p>
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

