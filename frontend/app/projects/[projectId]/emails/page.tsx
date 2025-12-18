'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../../../components/AuthHeader';
import Footer from '../../../../components/Footer';

interface EmailHistory {
  _id: string;
  projectId: string;
  userId: string | {
    _id: string;
    name: string;
    email: string;
  };
  templateId?: string;
  templateName?: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  fromEmail: string;
  fromName?: string;
  smtpId: string;
  status: 'pending' | 'sent' | 'failed' | 'success';
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailStats {
  pending: number;
  sent: number;
  failed: number;
  success: number;
}

export default function EmailDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [checkingProject, setCheckingProject] = useState(true);
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmailStats>({ pending: 0, sent: 0, failed: 0, success: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Check project access
  useEffect(() => {
    const checkProject = async () => {
      if (!user || !token || !projectId) {
        setCheckingProject(false);
        return;
      }

      try {
        const response = await axios.get(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setProjectInfo({
          name: response.data.project.name,
          role: response.data.project.role,
        });
        localStorage.setItem('selectedProjectId', projectId);
      } catch (error: any) {
        console.error('Project access error:', error);
        localStorage.removeItem('selectedProjectId');
        router.push('/projects');
      } finally {
        setCheckingProject(false);
      }
    };

    checkProject();
  }, [user, token, projectId, router]);

  const fetchEmailHistory = useCallback(async () => {
    if (!token || !projectId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await axios.get(
        `/api/projects/${projectId}/emails?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEmailHistory(response.data.emailHistory || []);
      setStats(response.data.stats || { pending: 0, sent: 0, failed: 0, success: 0 });
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error('Error fetching email history:', error);
    } finally {
      setLoading(false);
    }
  }, [token, projectId, page, statusFilter]);

  useEffect(() => {
    if (token && projectId && !checkingProject) {
      fetchEmailHistory();
    }
  }, [token, projectId, checkingProject, fetchEmailHistory]);

  // Auto-refresh every 10 seconds to update pending emails
  useEffect(() => {
    if (statusFilter === 'all' || statusFilter === 'pending') {
      const interval = setInterval(() => {
        fetchEmailHistory();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [statusFilter, fetchEmailHistory]);

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'sent':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEmails = emailHistory.filter((email) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const senderName = typeof email.userId === 'object' ? email.userId.name : '';
    const senderEmail = typeof email.userId === 'object' ? email.userId.email : '';
    return (
      email.recipientEmail.toLowerCase().includes(query) ||
      email.recipientName?.toLowerCase().includes(query) ||
      email.subject.toLowerCase().includes(query) ||
      email.templateName?.toLowerCase().includes(query) ||
      email.fromEmail.toLowerCase().includes(query) ||
      senderName.toLowerCase().includes(query) ||
      senderEmail.toLowerCase().includes(query)
    );
  });

  if (authLoading || checkingProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !projectId || !projectInfo) {
    return null;
  }

  const totalEmails = stats.pending + stats.sent + stats.failed + stats.success;

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader showProjectInfo={projectInfo} projectId={projectId} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Dashboard</h1>
              <p className="text-gray-600 mt-1">Track all emails sent from this project</p>
            </div>
            <Link
              href={`/tool?projectId=${projectId}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Send Emails
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalEmails}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.success}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by email, name, subject, template, or sender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading email history...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 text-lg font-medium">No emails found</p>
              <p className="text-gray-500 mt-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start sending emails to see history here'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmails.map((email) => (
                      <tr key={email._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(email.status)}>
                            {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {email.recipientName || email.recipientEmail}
                            </div>
                            {email.recipientName && (
                              <div className="text-sm text-gray-500">{email.recipientEmail}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {email.fromName || email.fromEmail}
                            </div>
                            {email.fromName && (
                              <div className="text-sm text-gray-500">{email.fromEmail}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            {typeof email.userId === 'object' && email.userId ? (
                              <>
                                <div className="text-sm font-medium text-gray-900">
                                  {email.userId.name}
                                </div>
                                <div className="text-sm text-gray-500">{email.userId.email}</div>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={email.subject}>
                            {email.subject}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {email.templateName || (email.templateId ? `Template ID: ${email.templateId}` : 'N/A')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {email.sentAt ? formatDate(email.sentAt) : formatDate(email.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          {email.errorMessage ? (
                            <div className="text-sm text-red-600 max-w-xs truncate" title={email.errorMessage}>
                              {email.errorMessage}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

