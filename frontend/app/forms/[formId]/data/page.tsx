'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../../../components/AuthHeader';
import Alert from '../../../../components/Alert';
import { ChevronLeft, Download, Database } from 'lucide-react';

const API_URL = '/api';

interface FormSubmission {
  _id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

interface Form {
  _id: string;
  formId: string;
  name: string;
  formType: string;
  fields: Array<{
    id: string;
    name: string;
    label: string;
    type: string;
  }>;
}

export default function FormDataPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const formId = params.formId as string;
  const projectId = searchParams.get('projectId');

  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
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
      if (!user || !token || !formId || !projectId) {
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

        // Fetch form
        const formResponse = await axios.get(`${API_URL}/forms/${formId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(formResponse.data.form);

        // Fetch submissions
        const submissionsResponse = await axios.get(`${API_URL}/forms/${formId}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(submissionsResponse.data.submissions || []);
      } catch (error: any) {
        console.error('Fetch error:', error);
        if (error.response?.status === 403 || error.response?.status === 404) {
          router.push('/forms');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, formId, projectId, router]);

  const exportToCSV = () => {
    if (!form || submissions.length === 0) return;

    // Get all unique field names from submissions
    const allFields = new Set<string>();
    submissions.forEach(sub => {
      Object.keys(sub.data).forEach(key => allFields.add(key));
    });

    // Create CSV header
    const headers = ['Submitted At', 'IP Address', ...Array.from(allFields)];
    const csvRows = [headers.join(',')];

    // Add data rows
    submissions.forEach(sub => {
      const row = [
        new Date(sub.submittedAt).toISOString(),
        sub.ipAddress || '',
        ...Array.from(allFields).map(field => {
          const value = sub.data[field];
          // Escape commas and quotes in CSV
          if (value === null || value === undefined) return '';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        }),
      ];
      csvRows.push(row.join(','));
    });

    // Download CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.formId}-submissions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (!form || !projectInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Form Not Found</h2>
          <Link href={`/forms?projectId=${projectId}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Go to Forms
          </Link>
        </div>
      </div>
    );
  }

  // Get all unique field names from submissions
  const allFields = new Set<string>();
  submissions.forEach(sub => {
    Object.keys(sub.data).forEach(key => allFields.add(key));
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AuthHeader showProjectInfo={projectInfo} projectId={projectId || ''} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/forms?projectId=${projectId}`}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{form.name} - Submissions</h1>
                <p className="text-sm text-gray-500 mt-1">Form ID: <code className="bg-gray-100 px-1 rounded">{form.formId}</code></p>
              </div>
            </div>
            {submissions.length > 0 && (
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>

          {/* Submissions Table */}
          {submissions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No submissions yet</p>
              <p className="text-sm text-gray-400">Form submissions will appear here once users start submitting data.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      {Array.from(allFields).map(field => {
                        const fieldInfo = form.fields.find(f => f.name === field);
                        return (
                          <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {fieldInfo?.label || field}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.ipAddress || 'N/A'}
                        </td>
                        {Array.from(allFields).map(field => (
                          <td key={field} className="px-6 py-4 text-sm text-gray-900">
                            {submission.data[field] !== null && submission.data[field] !== undefined
                              ? String(submission.data[field])
                              : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-600 font-medium">Total Submissions</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">{submissions.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Form Fields</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{form.fields.length}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Form Status</p>
                <p className="text-2xl font-bold text-purple-900 mt-1 capitalize">{form.formType}</p>
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

