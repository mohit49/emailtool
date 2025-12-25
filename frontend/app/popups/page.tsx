'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../components/AuthHeader';
import Alert from '../../components/Alert';
import { Plus, Settings, Trash2, Edit, ChevronLeft, X } from 'lucide-react';

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

export default function PopupsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [activities, setActivities] = useState<PopupActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: '',
    domain: '', // Single domain for the entire popup
    urlConditions: [] as UrlCondition[],
    logicOperators: [] as ('AND' | 'OR')[], // One operator between each pair of conditions
  });
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token || !projectId) {
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

        // Fetch popup activities
        const activitiesResponse = await axios.get(`${API_URL}/popup-activities?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(activitiesResponse.data.activities || []);
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
  }, [user, token, projectId, router]);

  const handleDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this popup activity?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/popup-activities/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(activities.filter(a => a._id !== activityId));
      setAlert({
        isOpen: true,
        message: 'Popup activity deleted successfully',
        type: 'success',
      });
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to delete popup activity',
        type: 'error',
      });
    }
  };

  const addUrlCondition = () => {
    setNewActivity({
      ...newActivity,
      urlConditions: [
        ...newActivity.urlConditions,
        { type: 'contains', value: '' }
      ],
      // Add default 'OR' operator when adding a new condition (if there are existing conditions)
      logicOperators: newActivity.urlConditions.length > 0 
        ? [...newActivity.logicOperators, 'OR']
        : newActivity.logicOperators,
    });
  };

  const updateUrlCondition = (index: number, field: keyof UrlCondition, value: string) => {
    const updated = [...newActivity.urlConditions];
    updated[index] = { ...updated[index], [field]: value };
    setNewActivity({ ...newActivity, urlConditions: updated });
  };

  const removeUrlCondition = (index: number) => {
    const updated = newActivity.urlConditions.filter((_, i) => i !== index);
    // Remove the corresponding logic operator
    const updatedOperators = newActivity.logicOperators.filter((_, i) => {
      // If removing first condition, remove first operator
      // If removing any other, remove the operator before it
      return index === 0 ? i !== 0 : i !== index - 1;
    });
    setNewActivity({ ...newActivity, urlConditions: updated, logicOperators: updatedOperators });
  };

  const updateLogicOperator = (index: number, operator: 'AND' | 'OR') => {
    const updated = [...newActivity.logicOperators];
    updated[index] = operator;
    setNewActivity({ ...newActivity, logicOperators: updated });
  };

  const handleCreate = async () => {
    if (!projectId || !newActivity.name.trim()) {
      setAlert({
        isOpen: true,
        message: 'Popup name is required',
        type: 'error',
      });
      return;
    }

    // Validate URL conditions
    const validConditions = newActivity.urlConditions.filter(
      cond => cond.value.trim() || cond.type === 'landing'
    );

    setCreating(true);
    try {
      // Apply single domain to all conditions
      const conditionsWithDomain = validConditions.map(cond => ({
        ...cond,
        domain: newActivity.domain.trim() || undefined,
      }));

      // Use the first logic operator, or default to 'OR' if none
      const logicOperator = newActivity.logicOperators.length > 0 
        ? newActivity.logicOperators[0] 
        : 'OR';
      
      const response = await axios.post(
        `${API_URL}/popup-activities`,
        {
          name: newActivity.name.trim(),
          projectId,
          urlConditions: conditionsWithDomain,
          logicOperator: logicOperator,
          html: '',
          status: 'draft',
          popupSettings: {
            domain: newActivity.domain.trim() || undefined, // Store domain in popupSettings
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActivities([response.data.activity, ...activities]);
      setShowCreateModal(false);
      setNewActivity({
        name: '',
        domain: '',
        urlConditions: [],
        logicOperators: [],
      });
      setAlert({
        isOpen: true,
        message: 'Popup activity created successfully',
        type: 'success',
      });
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to create popup activity',
        type: 'error',
      });
    } finally {
      setCreating(false);
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

  if (!projectId || !projectInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Project Not Found</h2>
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
                href="/projects"
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Popup Activities</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your popup activities</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Popup Activity
            </button>
          </div>

          {/* Activities List */}
          {activities.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No popup activities yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Popup
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            activity.status === 'activated'
                              ? 'bg-green-100 text-green-800'
                              : activity.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {activity.urlConditions.length} URL condition{activity.urlConditions.length !== 1 ? 's' : ''} ({activity.logicOperator})
                      </p>
                      <p className="text-xs text-gray-400">
                        Updated: {new Date(activity.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/popups/${activity._id}?projectId=${projectId}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(activity._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Popup Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Create Popup Activity</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewActivity({
                    name: '',
                    domain: '',
                    urlConditions: [],
                    logicOperators: [],
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="px-6 py-6">
              {/* Popup Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popup Name *
                </label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Enter popup activity name"
                  required
                />
              </div>

              {/* Enable Popup on Page */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Enable Popup on Page
                </label>

                {/* Domain Name - Single field at top */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain Name *
                  </label>
                  <input
                    type="text"
                    value={newActivity.domain}
                    onChange={(e) => setNewActivity({ ...newActivity, domain: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="example.com"
                    required
                  />
                </div>

                {/* URL Conditions */}
                <div className="space-y-4">
                  {newActivity.urlConditions.map((condition, index) => (
                    <div key={index}>
                      {/* AND/OR Selector - Show between conditions */}
                      {index > 0 && (
                        <div className="mb-4 flex items-center justify-center">
                          <select
                            value={newActivity.logicOperators[index - 1] || 'OR'}
                            onChange={(e) => updateLogicOperator(index - 1, e.target.value as 'AND' | 'OR')}
                            className="px-4 py-2 border-2 border-indigo-300 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer hover:bg-indigo-100 transition-colors"
                          >
                            <option value="OR">OR</option>
                            <option value="AND">AND</option>
                          </select>
                        </div>
                      )}

                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Condition {index + 1}</span>
                          <button
                            onClick={() => removeUrlCondition(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Condition Type - Enhanced Select */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Condition Type
                          </label>
                          <select
                            value={condition.type}
                            onChange={(e) => updateUrlCondition(index, 'type', e.target.value)}
                            className="w-full px-3 py-2.5 pr-8 border-2 border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer hover:border-indigo-400 transition-colors appearance-none"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundSize: '1.25em 1.25em',
                              backgroundRepeat: 'no-repeat',
                            }}
                          >
                            <option value="contains">URL Contains</option>
                            <option value="equals">URL Equals To</option>
                            <option value="landing">Is Landing Page (Home Page)</option>
                            <option value="startsWith">URL Starts With</option>
                            <option value="doesNotContain">URL Does Not Contain</option>
                          </select>
                        </div>

                        {/* URL Value (hidden for landing page) */}
                        {condition.type !== 'landing' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              URL Value *
                            </label>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateUrlCondition(index, 'value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                  className="mt-4 px-4 py-2 text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium"
                >
                  + Add URL Condition
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewActivity({
                      name: '',
                      domain: '',
                      urlConditions: [],
                      logicOperators: [],
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newActivity.name.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Popup Activity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
}
