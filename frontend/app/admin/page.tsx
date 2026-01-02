'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import Alert from '../../components/Alert';
import AuthHeader from '../../components/AuthHeader';

const API_URL = '/api';


interface User {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminSmtpConfigs, setAdminSmtpConfigs] = useState<any[]>([]);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [editingSmtp, setEditingSmtp] = useState<any | null>(null);
  const [smtpSettings, setSmtpSettings] = useState({
    title: '',
    host: '',
    port: '587',
    user: '',
    pass: '',
    from: '',
    isActive: true,
    isDefault: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState<string | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [googleOAuthSettings, setGoogleOAuthSettings] = useState({
    clientId: '',
    clientSecret: '',
    enabled: true,
  });
  const [savingGoogleOAuth, setSavingGoogleOAuth] = useState(false);
  const [showGoogleOAuthPassword, setShowGoogleOAuthPassword] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'danger',
    onConfirm: () => {},
    onCancel: () => {},
  });
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'info' as 'info' | 'success' | 'error',
  });
  const [externalJsScripts, setExternalJsScripts] = useState<Array<{ id?: string; scriptTag: string; injectInHead: boolean }>>([]);
  const [showJsModal, setShowJsModal] = useState(false);
  const [editingJs, setEditingJs] = useState<{ id?: string; scriptTag: string; injectInHead: boolean } | null>(null);
  const [jsSettings, setJsSettings] = useState({
    scriptTag: '',
    injectInHead: false,
  });
  const [savingJs, setSavingJs] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user && user.role !== 'admin') {
      router.push('/projects');
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [smtpResponse, googleOAuthResponse, jsScriptsResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/smtp`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/google-oauth`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/external-js`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAdminSmtpConfigs(smtpResponse.data.smtpConfigs || []);
      if (googleOAuthResponse.data.googleOAuth) {
        setGoogleOAuthSettings({
          clientId: googleOAuthResponse.data.googleOAuth.clientId || '',
          clientSecret: googleOAuthResponse.data.googleOAuth.clientSecret || '',
          enabled: googleOAuthResponse.data.googleOAuth.enabled === true,
        });
      }
      setExternalJsScripts(jsScriptsResponse.data.scripts || []);
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const seedWelcomeTemplate = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/admin/seed-welcome-template`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.message) {
        // Refresh templates after seeding
        fetchData();
      }
    } catch (error: any) {
      // Ignore error if template already exists or other issues
      if (error.response?.status !== 403) {
        console.error('Failed to seed welcome template:', error);
      }
    }
  }, [token, fetchData]);

  useEffect(() => {
    if (user && user.role === 'admin' && token) {
      if (activeTab === 'settings') {
        fetchSettings();
      } else {
        fetchData();
      }
    }
  }, [user, token, activeTab, fetchData, fetchSettings, seedWelcomeTemplate]);

  const handleOpenSmtpModal = (config?: any) => {
    if (config) {
      setEditingSmtp(config);
      setSmtpSettings({
        title: config.title || '',
        host: config.smtpHost || '',
        port: config.smtpPort?.toString() || '587',
        user: config.smtpUser || '',
        pass: '',
        from: config.smtpFrom || '',
        isActive: config.isActive !== undefined ? config.isActive : true,
        isDefault: config.isDefault !== undefined ? config.isDefault : false,
      });
    } else {
      setEditingSmtp(null);
      setSmtpSettings({
        title: '',
        host: '',
        port: '587',
        user: '',
        pass: '',
        from: '',
        isActive: true,
        isDefault: false,
      });
    }
    setShowPassword(false);
    setShowSmtpModal(true);
  };

  const handleCloseSmtpModal = () => {
    setShowSmtpModal(false);
    setEditingSmtp(null);
    setSmtpSettings({
      title: '',
      host: '',
      port: '587',
      user: '',
      pass: '',
      from: '',
      isActive: true,
      isDefault: false,
    });
    setShowPassword(false);
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpSettings.title.trim() || !smtpSettings.host || !smtpSettings.user) {
      setAlert({
        isOpen: true,
        message: 'Title, Host, and User are required',
        type: 'error',
      });
      return;
    }

    if (!editingSmtp && !smtpSettings.pass) {
      setAlert({
        isOpen: true,
        message: 'Password is required for new configurations',
        type: 'error',
      });
      return;
    }

    setSavingSettings(true);
    try {
      const payload: any = {
        title: smtpSettings.title.trim(),
        smtpHost: smtpSettings.host.trim(),
        smtpPort: parseInt(smtpSettings.port),
        smtpUser: smtpSettings.user.trim(),
        smtpFrom: smtpSettings.from.trim() || smtpSettings.user.trim(),
        isActive: smtpSettings.isActive,
        isDefault: smtpSettings.isDefault,
      };

      if (editingSmtp?._id) {
        payload.id = editingSmtp._id;
      }

      if (editingSmtp) {
        if (smtpSettings.pass && smtpSettings.pass.trim()) {
          payload.smtpPass = smtpSettings.pass.trim();
        }
      } else {
        payload.smtpPass = smtpSettings.pass.trim();
      }

      await axios.post(
        `${API_URL}/admin/smtp`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({
        isOpen: true,
        message: 'SMTP configuration saved successfully!',
        type: 'success',
      });
      handleCloseSmtpModal();
      fetchSettings();
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to save SMTP configuration',
        type: 'error',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteSmtp = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete SMTP Configuration',
      message: 'Are you sure you want to delete this SMTP configuration?',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await axios.delete(`${API_URL}/admin/smtp/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({
            isOpen: true,
            message: 'SMTP configuration deleted successfully!',
            type: 'success',
          });
          fetchSettings();
        } catch (error: any) {
          setAlert({
            isOpen: true,
            message: error.response?.data?.error || 'Failed to delete SMTP configuration',
            type: 'error',
          });
        }
      },
      onCancel: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
    });
  };

  const handleSaveGoogleOAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleOAuthSettings.clientId.trim()) {
      setAlert({
        isOpen: true,
        message: 'Google Client ID is required',
        type: 'error',
      });
      return;
    }

    setSavingGoogleOAuth(true);
    try {
      await axios.post(
        `${API_URL}/admin/google-oauth`,
        {
          clientId: googleOAuthSettings.clientId.trim(),
          clientSecret: googleOAuthSettings.clientSecret.trim() || undefined,
          enabled: googleOAuthSettings.enabled,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlert({
        isOpen: true,
        message: 'Google OAuth settings saved successfully!',
        type: 'success',
      });
      fetchSettings();
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to save Google OAuth settings',
        type: 'error',
      });
    } finally {
      setSavingGoogleOAuth(false);
    }
  };

  const handleTestSmtp = async (smtpId?: string, defaultEmail?: string) => {
    // If editing existing SMTP, use the ID
    // If creating new, use form data
    if (smtpId) {
      setTestingSmtp(smtpId);
      setTestEmailAddress(defaultEmail || smtpSettings.user || '');
      setShowTestModal(true);
    } else {
      // Test with current form data
      if (!smtpSettings.host || !smtpSettings.user || !smtpSettings.pass) {
        setAlert({
          isOpen: true,
          message: 'Please fill in Host, User, and Password fields to test',
          type: 'error',
        });
        return;
      }
      setTestingSmtp('form-data');
      setTestEmailAddress(smtpSettings.user || '');
      setShowTestModal(true);
    }
  };

  const handleOpenJsModal = (script?: { id?: string; scriptTag: string; injectInHead: boolean }) => {
    if (script) {
      setEditingJs(script);
      setJsSettings({
        scriptTag: script.scriptTag || '',
        injectInHead: script.injectInHead || false,
      });
    } else {
      setEditingJs(null);
      setJsSettings({
        scriptTag: '',
        injectInHead: false,
      });
    }
    setShowJsModal(true);
  };

  const handleCloseJsModal = () => {
    setShowJsModal(false);
    setEditingJs(null);
    setJsSettings({
      scriptTag: '',
      injectInHead: false,
    });
  };

  const handleSaveJs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsSettings.scriptTag.trim()) {
      setAlert({
        isOpen: true,
        message: 'Script tag is required',
        type: 'error',
      });
      return;
    }

    // Basic validation - check if it contains script tag
    const trimmedScript = jsSettings.scriptTag.trim();
    if (!trimmedScript.includes('<script') && !trimmedScript.includes('</script>')) {
      setAlert({
        isOpen: true,
        message: 'Please enter a valid script tag (e.g., <script src="..."></script>)',
        type: 'error',
      });
      return;
    }

    setSavingJs(true);
    try {
      const payload: any = {
        scriptTag: trimmedScript,
        injectInHead: jsSettings.injectInHead,
      };

      if (editingJs?.id) {
        payload.id = editingJs.id;
      }

      await axios.post(
        `${API_URL}/admin/external-js`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({
        isOpen: true,
        message: 'External JavaScript script saved successfully!',
        type: 'success',
      });
      handleCloseJsModal();
      fetchSettings();
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to save external JavaScript script',
        type: 'error',
      });
    } finally {
      setSavingJs(false);
    }
  };

  const handleDeleteJs = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete External JavaScript Script',
      message: 'Are you sure you want to delete this external JavaScript script?',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await axios.delete(`${API_URL}/admin/external-js/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlert({
            isOpen: true,
            message: 'External JavaScript script deleted successfully!',
            type: 'success',
          });
          fetchSettings();
        } catch (error: any) {
          setAlert({
            isOpen: true,
            message: error.response?.data?.error || 'Failed to delete external JavaScript script',
            type: 'error',
          });
        }
      },
      onCancel: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
    });
  };

  const handleSendTestEmail = async () => {
    if (!testingSmtp) return;

    try {
      const payload: any = {
        testEmail: testEmailAddress.trim() || undefined,
      };

      if (testingSmtp === 'form-data') {
        // Test with form data
        payload.smtpData = {
          host: smtpSettings.host,
          port: smtpSettings.port,
          user: smtpSettings.user,
          pass: smtpSettings.pass,
          from: smtpSettings.from || smtpSettings.user,
          title: smtpSettings.title,
        };
      } else {
        // Test with existing SMTP ID
        payload.smtpId = testingSmtp;
      }

      await axios.post(
        `${API_URL}/admin/smtp/test`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({
        isOpen: true,
        message: 'Test email sent successfully! Check the recipient inbox.',
        type: 'success',
      });
      setShowTestModal(false);
      setTestingSmtp(null);
      setTestEmailAddress('');
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to send test email',
        type: 'error',
      });
    } finally {
      setTestingSmtp(null);
    }
  };


  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to update user',
        type: 'error',
      });
    }
  };

  const handleDeleteUser = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user?',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false, onCancel: () => {} });
        try {
          await axios.delete(`${API_URL}/admin/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchData();
        } catch (error: any) {
          setAlert({
            isOpen: true,
            message: error.response?.data?.error || 'Failed to delete user',
            type: 'error',
          });
        }
      },
      onCancel: () => setConfirmDialog({ ...confirmDialog, isOpen: false }),
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'settings'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'users' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUser(u._id, { role: e.target.value as 'user' | 'admin' })}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={u.emailVerified}
                          onChange={(e) => handleUpdateUser(u._id, { emailVerified: e.target.checked })}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={u._id === user.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Email Settings (SMTP)</h2>
              <button
                onClick={() => handleOpenSmtpModal()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add SMTP Configuration</span>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Manage SMTP configurations that will be available as default options for all users. Users can also add their own SMTP settings.
            </p>

            {adminSmtpConfigs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No SMTP configurations</h3>
                <p className="text-sm text-gray-500 mb-4">Get started by adding your first SMTP configuration.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminSmtpConfigs.map((config) => (
                  <div
                    key={config._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
                          {config.isDefault && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Default
                            </span>
                          )}
                          {config.isActive && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Host:</span> {config.smtpHost}
                          </div>
                          <div>
                            <span className="font-medium">Port:</span> {config.smtpPort}
                          </div>
                          <div>
                            <span className="font-medium">User:</span> {config.smtpUser}
                          </div>
                          <div>
                            <span className="font-medium">From:</span> {config.smtpFrom}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleOpenSmtpModal(config)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSmtp(config._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SMTP Configuration Modal */}
            {showSmtpModal && (
              <>
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={handleCloseSmtpModal}
                ></div>
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {editingSmtp ? 'Edit SMTP Configuration' : 'Add SMTP Configuration'}
                      </h2>
                      <form onSubmit={handleSaveSmtp}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={smtpSettings.title}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, title: e.target.value })}
                            placeholder="e.g., Company Email, Gmail SMTP"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            A descriptive name for this SMTP configuration
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Host <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={smtpSettings.host}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                            placeholder="smtp.gmail.com"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            For Gmail: smtp.gmail.com | For Outlook: smtp-mail.outlook.com
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Port <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={smtpSettings.port}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                            placeholder="587"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Common ports: 587 (TLS) or 465 (SSL)
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP User (Email) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={smtpSettings.user}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, user: e.target.value })}
                            placeholder="your-email@gmail.com"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Password {!editingSmtp && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={smtpSettings.pass}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, pass: e.target.value })}
                              placeholder={editingSmtp ? "Leave blank to keep existing password" : "Your app password"}
                              required={!editingSmtp}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            For Gmail: Generate an App Password at{' '}
                            <a
                              href="https://myaccount.google.com/apppasswords"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              Google Account Settings
                            </a>
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Email Address
                          </label>
                          <input
                            type="email"
                            value={smtpSettings.from}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, from: e.target.value })}
                            placeholder="your-email@gmail.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Email address shown as sender (defaults to SMTP User if empty)
                          </p>
                        </div>

                        <div className="mb-4 flex items-center space-x-6">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={smtpSettings.isActive}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, isActive: e.target.checked })}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={smtpSettings.isDefault}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, isDefault: e.target.checked })}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Set as Default (for all users)</span>
                          </label>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div>
                            <button
                              type="button"
                              onClick={() => handleTestSmtp(editingSmtp?._id, smtpSettings.user)}
                              disabled={!smtpSettings.host || !smtpSettings.user || (!smtpSettings.pass && !editingSmtp) || testingSmtp !== null}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{testingSmtp ? 'Sending...' : 'Send Test Email'}</span>
                            </button>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={handleCloseSmtpModal}
                              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={savingSettings}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                              {savingSettings ? 'Saving...' : 'Save Configuration'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Google OAuth Settings Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Google OAuth Configuration</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure Google Sign-In credentials for user authentication
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveGoogleOAuth} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Client ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={googleOAuthSettings.clientId}
                    onChange={(e) => setGoogleOAuthSettings({ ...googleOAuthSettings, clientId: e.target.value })}
                    placeholder="xxx.apps.googleusercontent.com"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Get this from{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 underline"
                    >
                      Google Cloud Console
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Client Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showGoogleOAuthPassword ? 'text' : 'password'}
                      value={googleOAuthSettings.clientSecret === '***configured***' ? '' : googleOAuthSettings.clientSecret}
                      onChange={(e) => setGoogleOAuthSettings({ ...googleOAuthSettings, clientSecret: e.target.value })}
                      placeholder={googleOAuthSettings.clientSecret === '***configured***' ? 'Leave blank to keep existing secret' : 'Enter client secret'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGoogleOAuthPassword(!showGoogleOAuthPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showGoogleOAuthPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to keep existing secret. Get this from Google Cloud Console.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="googleOAuthEnabled"
                    checked={googleOAuthSettings.enabled}
                    onChange={(e) => setGoogleOAuthSettings({ ...googleOAuthSettings, enabled: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="googleOAuthEnabled" className="text-sm text-gray-700 cursor-pointer">
                    Enable Google Sign-In
                  </label>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={savingGoogleOAuth}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingGoogleOAuth ? 'Saving...' : 'Save Google OAuth Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* External JavaScript Scripts Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">External JavaScript Scripts</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add JavaScript script tags to be injected into all pages. Enter the full script tag and choose whether to inject in &lt;head&gt; or before &lt;/body&gt;.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenJsModal()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Script</span>
                </button>
              </div>

              {externalJsScripts.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No external JavaScript scripts</h3>
                  <p className="text-sm text-gray-500 mb-4">Get started by adding your first external JavaScript script.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {externalJsScripts.map((script, index) => (
                    <div
                      key={script.id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Script Tag:</h3>
                            <code className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded block">{script.scriptTag}</code>
                          </div>
                          {script.injectInHead ? (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded whitespace-nowrap">
                              In &lt;head&gt;
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap">
                              Before &lt;/body&gt;
                            </span>
                          )}
                        </div>
                      </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleOpenJsModal(script)}
                            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteJs(script.id || '')}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* External JS Modal */}
              {showJsModal && (
                <>
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={handleCloseJsModal}
                  ></div>
                  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                      <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                          {editingJs ? 'Edit External JavaScript Script' : 'Add External JavaScript Script'}
                        </h2>
                        <form onSubmit={handleSaveJs}>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Script Tag <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={jsSettings.scriptTag}
                              onChange={(e) => setJsSettings({ ...jsSettings, scriptTag: e.target.value })}
                              placeholder='<script src="https://example.com/script.js"></script>'
                              required
                              rows={4}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Enter the full script tag (e.g., <code className="bg-gray-100 px-1 rounded">&lt;script src=&quot;...&quot;&gt;&lt;/script&gt;</code> or inline scripts)
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Examples:
                            </p>
                            <ul className="mt-1 text-xs text-gray-500 list-disc list-inside space-y-1">
                              <li><code className="bg-gray-100 px-1 rounded">&lt;script src=&quot;/sdk.js&quot;&gt;&lt;/script&gt;</code></li>
                              <li><code className="bg-gray-100 px-1 rounded">&lt;script src=&quot;https://cdn.example.com/script.js&quot; async&gt;&lt;/script&gt;</code></li>
                              <li><code className="bg-gray-100 px-1 rounded">&lt;script&gt;console.log(&apos;Hello&apos;);&lt;/script&gt;</code></li>
                            </ul>
                          </div>

                          <div className="mb-4 flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="injectInHead"
                              checked={jsSettings.injectInHead}
                              onChange={(e) => setJsSettings({ ...jsSettings, injectInHead: e.target.checked })}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="injectInHead" className="text-sm text-gray-700 cursor-pointer">
                              Inject in &lt;head&gt; tag (otherwise injects before &lt;/body&gt;)
                            </label>
                          </div>

                          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={handleCloseJsModal}
                              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={savingJs}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                              {savingJs ? 'Saving...' : 'Save Script'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Test Email Modal */}
      {showTestModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowTestModal(false);
              setTestingSmtp(null);
              setTestEmailAddress('');
            }}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Test Email</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Send a test email to verify your SMTP configuration is working correctly.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to send to the SMTP user email address
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTestModal(false);
                      setTestingSmtp(null);
                      setTestEmailAddress('');
                    }}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendTestEmail}
                    disabled={testingSmtp === null}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {testingSmtp ? 'Sending...' : 'Send Test Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Alert */}
      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
}

