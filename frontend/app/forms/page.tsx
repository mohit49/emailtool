'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../components/AuthHeader';
import Alert from '../../components/Alert';
import { Plus, Settings, Trash2, Edit, ChevronLeft, X, Database } from 'lucide-react';

const API_URL = '/api';

interface Form {
  _id: string;
  formId: string;
  name: string;
  formType: 'subscription' | 'survey' | 'contact' | 'custom' | 'quiz';
  projectId: string;
  userId: string;
  fields: any[];
  status: 'draft' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function FormsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    formId: '',
    name: '',
    formType: 'custom' as 'subscription' | 'survey' | 'contact' | 'custom' | 'quiz',
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

        // Fetch forms
        const formsResponse = await axios.get(`${API_URL}/forms?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForms(formsResponse.data.forms || []);
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

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/forms/${formId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForms(forms.filter(f => f._id !== formId));
      setAlert({
        isOpen: true,
        message: 'Form deleted successfully',
        type: 'success',
      });
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to delete form',
        type: 'error',
      });
    }
  };

  const handleCreate = async () => {
    if (!projectId || !newForm.name.trim() || !newForm.formId.trim()) {
      setAlert({
        isOpen: true,
        message: 'Form name and Form ID are required',
        type: 'error',
      });
      return;
    }

    // Validate formId (alphanumeric and hyphens only)
    const formIdRegex = /^[a-z0-9-]+$/;
    if (!formIdRegex.test(newForm.formId.trim().toLowerCase())) {
      setAlert({
        isOpen: true,
        message: 'Form ID can only contain lowercase letters, numbers, and hyphens',
        type: 'error',
      });
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(
        `${API_URL}/forms`,
        {
          formId: newForm.formId.trim().toLowerCase(),
          name: newForm.name.trim(),
          formType: newForm.formType,
          projectId,
          fields: [],
          status: 'draft',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setForms([response.data.form, ...forms]);
      setShowCreateModal(false);
      setNewForm({
        formId: '',
        name: '',
        formType: 'custom',
      });
      setAlert({
        isOpen: true,
        message: 'Form created successfully',
        type: 'success',
      });
      
      // Navigate to form builder
      router.push(`/forms/${response.data.form._id}?projectId=${projectId}`);
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to create form',
        type: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  const getFormTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      subscription: 'Subscription Form',
      survey: 'Survey Form',
      contact: 'Contact Us Form',
      custom: 'Custom Form',
      quiz: 'Quiz Form',
    };
    return labels[type] || type;
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
                <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your forms and view submissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Form
            </button>
          </div>

          {/* Forms List */}
          {forms.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No forms yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Form
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {forms.map((form) => (
                <div
                  key={form._id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {getFormTypeLabel(form.formType)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            form.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : form.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {form.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        Form ID: <code className="bg-gray-100 px-1 rounded">{form.formId}</code>
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400">
                        Updated: {new Date(form.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/forms/${form._id}/data?projectId=${projectId}`}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="View Data"
                      >
                        <Database className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/forms/${form._id}?projectId=${projectId}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(form._id)}
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

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Create Form</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewForm({
                    formId: '',
                    name: '',
                    formType: 'custom',
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="px-6 py-6">
              {/* Form Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Name *
                </label>
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Enter form name"
                  required
                />
              </div>

              {/* Form ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form ID *
                </label>
                <input
                  type="text"
                  value={newForm.formId}
                  onChange={(e) => setNewForm({ ...newForm, formId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                  placeholder="my-form-id"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase letters, numbers, and hyphens only. This will be used to identify your form.
                </p>
              </div>

              {/* Form Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Type *
                </label>
                <select
                  value={newForm.formType}
                  onChange={(e) => setNewForm({ ...newForm, formType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="subscription">Subscription Form</option>
                  <option value="survey">Survey Form</option>
                  <option value="contact">Contact Us Form</option>
                  <option value="custom">Custom Form</option>
                  <option value="quiz">Quiz Form</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewForm({
                      formId: '',
                      name: '',
                      formType: 'custom',
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newForm.name.trim() || !newForm.formId.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Form'}
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

