'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_URL = '/api';

export default function SettingsPage() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [smtpConfigs, setSmtpConfigs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any | null>(null);
  const [smtpSettings, setSmtpSettings] = useState({
    name: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchSmtpSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/user/smtp`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSmtpConfigs(response.data.smtpConfigs || []);
    } catch (error: any) {
      console.error('Failed to fetch SMTP settings:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      fetchSmtpSettings();
    }
  }, [user, token, fetchSmtpSettings]);

  const handleOpenModal = (config?: any) => {
    if (config) {
      setEditingConfig(config);
      setSmtpSettings({
        name: config.name || '',
        smtpHost: config.smtpHost || '',
        smtpPort: config.smtpPort?.toString() || '587',
        smtpUser: config.smtpUser || '',
        smtpPass: '',
        smtpFrom: config.smtpFrom || '',
        isActive: config.isActive !== undefined ? config.isActive : true,
      });
    } else {
      setEditingConfig(null);
      setSmtpSettings({
        name: '',
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
        smtpFrom: '',
        isActive: true,
      });
    }
    setShowPassword(false);
    setMessage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingConfig(null);
    setSmtpSettings({
      name: '',
      smtpHost: '',
      smtpPort: '587',
      smtpUser: '',
      smtpPass: '',
      smtpFrom: '',
      isActive: true,
    });
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload: any = {
        smtpHost: smtpSettings.smtpHost.trim(),
        smtpPort: parseInt(smtpSettings.smtpPort),
        smtpUser: smtpSettings.smtpUser.trim(),
        smtpFrom: smtpSettings.smtpFrom.trim(),
        isActive: smtpSettings.isActive,
      };

      // Include id if editing
      if (editingConfig?._id) {
        payload.id = editingConfig._id;
      }

      // Always include name - use trimmed value or 'Default' if empty
      payload.name = smtpSettings.name.trim() || 'Default';

      // Handle password - required for new, optional for edit
      if (editingConfig) {
        // For editing, always send password field if user entered something
        // Backend will only update if password is not empty
        if (smtpSettings.smtpPass && smtpSettings.smtpPass.trim()) {
          payload.smtpPass = smtpSettings.smtpPass.trim();
        }
        // If password is empty/not provided, don't send it (backend keeps existing password)
      } else {
        // For new configuration, password is required
        if (!smtpSettings.smtpPass || !smtpSettings.smtpPass.trim()) {
          setMessage({ type: 'error', text: 'SMTP Password is required for new configurations' });
          setSaving(false);
          return;
        }
        payload.smtpPass = smtpSettings.smtpPass.trim();
      }

      await axios.post(
        `${API_URL}/user/smtp`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'SMTP settings saved successfully!' });
      await fetchSmtpSettings();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to save SMTP settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SMTP configuration?')) return;

    try {
      await axios.delete(`${API_URL}/user/smtp/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSmtpSettings();
      setMessage({ type: 'success', text: 'SMTP configuration deleted successfully!' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to delete SMTP configuration',
      });
    }
  };

  const handleTest = async () => {
    if (!smtpSettings.smtpHost || !smtpSettings.smtpUser || !smtpSettings.smtpPass || !smtpSettings.smtpFrom) {
      setMessage({ type: 'error', text: 'Please fill in all required fields before testing' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await axios.post(
        `${API_URL}/user/smtp/test`,
        {
          smtpHost: smtpSettings.smtpHost.trim(),
          smtpPort: parseInt(smtpSettings.smtpPort),
          smtpUser: smtpSettings.smtpUser.trim(),
          smtpPass: smtpSettings.smtpPass,
          smtpFrom: smtpSettings.smtpFrom.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Test email sent successfully! Check your inbox.' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to send test email',
      });
    } finally {
      setSaving(false);
    }
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PRZIO
              </Link>
              <Link href="/tool" className="text-sm text-gray-600 hover:text-gray-900">
                ← Back to Tool
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add SMTP</span>
            </button>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* SMTP Configurations List */}
          <div className="space-y-4">
            {smtpConfigs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No SMTP configurations yet. Click &quot;Add SMTP&quot; to create one.</p>
              </div>
            ) : (
              smtpConfigs.map((config) => (
                <div
                  key={config._id}
                  className={`border rounded-lg p-4 ${
                    config.isActive
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{config.name || 'Default'}</h3>
                        {config.isActive && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
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
                        onClick={() => handleOpenModal(config)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(config._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingConfig ? 'Edit SMTP Configuration' : 'Add SMTP Configuration'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {message && (
                <div
                  className={`mb-4 p-3 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Configuration Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={smtpSettings.name}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, name: e.target.value })}
                    placeholder="My SMTP Server"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    A friendly name to identify this SMTP configuration
                  </p>
                </div>

                <div>
                  <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="smtpHost"
                    value={smtpSettings.smtpHost}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Your email provider&apos;s SMTP server address
                  </p>
                </div>

            <div>
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="smtpPort"
                value={smtpSettings.smtpPort}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })}
                placeholder="587"
                required
                min="1"
                max="65535"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Common ports: 587 (TLS), 465 (SSL), 25 (unsecured)
              </p>
            </div>

            <div>
              <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="smtpUser"
                value={smtpSettings.smtpUser}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpUser: e.target.value })}
                placeholder="your-email@domain.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your email address or username for SMTP authentication
              </p>
            </div>

            <div>
              <label htmlFor="smtpPass" className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Password {!editingConfig && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="smtpPass"
                  value={smtpSettings.smtpPass}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPass: e.target.value })}
                  placeholder={editingConfig ? "Leave blank to keep existing password" : "Your SMTP password"}
                  required={!editingConfig}
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
              <p className="mt-1 text-sm text-gray-500">
                {editingConfig
                  ? "Leave blank to keep your existing password, or enter a new password to update it."
                  : "For Gmail, use an App Password. For other providers, use your email password or app-specific password."}
              </p>
            </div>

            <div>
              <label htmlFor="smtpFrom" className="block text-sm font-medium text-gray-700 mb-2">
                From Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="smtpFrom"
                value={smtpSettings.smtpFrom}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpFrom: e.target.value })}
                placeholder="noreply@yourdomain.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                The email address that will appear as the sender
              </p>
            </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={smtpSettings.isActive}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Set as active (use this SMTP for sending emails)
                  </label>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : editingConfig ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={saving}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Testing...' : 'Send Test Email'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

