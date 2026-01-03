'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../../../components/AuthHeader';
import Footer from '../../../../components/Footer';

interface Template {
  _id: string;
  name: string;
  subject: string;
  html: string;
}

interface SmtpConfig {
  _id: string;
  title?: string;
  smtpHost?: string;
  isAdminSmtp?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
}

interface ScheduledEmail {
  _id: string;
  templateId: {
    _id: string;
    name: string;
  };
  subject: string;
  scheduledAt: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  recipientFolders: string[];
}

interface Form {
  _id: string;
  name: string;
  formId: string;
}

interface AutoSendEmail {
  _id: string;
  formId: {
    _id: string;
    name: string;
  };
  templateId: {
    _id: string;
    name: string;
  };
  subject: string;
  enabled: boolean;
}

export default function ScheduledEmailsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [checkingProject, setCheckingProject] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingSmtp, setLoadingSmtp] = useState(false);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<Record<string, any[]>>({});
  const [forms, setForms] = useState<Form[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [autoSendEmails, setAutoSendEmails] = useState<AutoSendEmail[]>([]);
  const [loadingAutoSend, setLoadingAutoSend] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    templateId: '',
    smtpId: '',
    subject: '',
    html: '',
    scheduledDate: '',
    scheduledTime: '',
    recipientFolders: [] as string[],
  });
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [sendingNow, setSendingNow] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'autosend'>('schedule');
  const [autoSendFormData, setAutoSendFormData] = useState({
    formId: '',
    templateId: '',
    smtpId: '',
    subject: '',
    html: '',
    enabled: true,
  });
  const [savingAutoSend, setSavingAutoSend] = useState(false);

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

  const fetchTemplates = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoadingTemplates(true);
      const response = await axios.get(`/api/templates?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data.templates || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setMessage({ type: 'error', text: 'Failed to fetch templates' });
    } finally {
      setLoadingTemplates(false);
    }
  }, [token, projectId]);

  const fetchSmtpConfigs = useCallback(async () => {
    try {
      setLoadingSmtp(true);
      const userSmtpResponse = await axios.get('/api/user/smtp', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userSmtpConfigs = userSmtpResponse.data.smtpConfigs || [];

      const adminSmtpResponse = await axios.get('/api/admin/smtp/public');
      const adminSmtpConfigs = (adminSmtpResponse.data.smtpConfigs || []).map((smtp: any) => ({
        ...smtp,
        _id: `admin_${smtp._id}`,
        isAdminSmtp: true,
      }));

      const allConfigs = [...userSmtpConfigs, ...adminSmtpConfigs];
      setSmtpConfigs(allConfigs);

      const activeUser = userSmtpConfigs.find((s: any) => s.isActive);
      const defaultAdmin = adminSmtpConfigs.find((s: any) => s.isDefault === true);
      
      if (activeUser) {
        setScheduleFormData(prev => ({ ...prev, smtpId: activeUser._id }));
      } else if (defaultAdmin) {
        setScheduleFormData(prev => ({ ...prev, smtpId: defaultAdmin._id }));
      } else if (allConfigs.length > 0) {
        setScheduleFormData(prev => ({ ...prev, smtpId: allConfigs[0]._id }));
      }
    } catch (error: any) {
      console.error('Error fetching SMTP configs:', error);
      setMessage({ type: 'error', text: 'Failed to fetch SMTP configurations' });
    } finally {
      setLoadingSmtp(false);
    }
  }, [token]);

  const fetchScheduledEmails = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoadingScheduled(true);
      const response = await axios.get(`/api/projects/${projectId}/scheduled-emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScheduledEmails(response.data.scheduledEmails || []);
    } catch (error: any) {
      console.error('Error fetching scheduled emails:', error);
      setMessage({ type: 'error', text: 'Failed to fetch scheduled emails' });
    } finally {
      setLoadingScheduled(false);
    }
  }, [token, projectId]);

  const fetchRecipients = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await axios.get(`/api/user/recipients?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recipientsData = response.data.recipients || [];
      setRecipients(recipientsData);
      
      const uniqueFolders = Array.from(
        new Set(recipientsData.map((r: any) => r.folder || '').filter((f: string) => f))
      ) as string[];
      
      setFolders(uniqueFolders.sort());
    } catch (error: any) {
      console.error('Error fetching recipients:', error);
    }
  }, [token, projectId]);

  const fetchFormSubmissions = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await axios.get(`/api/projects/${projectId}/form-submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormSubmissions(response.data.formSubmissions || {});
    } catch (error: any) {
      console.error('Error fetching form submissions:', error);
    }
  }, [token, projectId]);

  const fetchForms = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoadingForms(true);
      const response = await axios.get(`/api/forms?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForms(response.data.forms || []);
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      setMessage({ type: 'error', text: 'Failed to fetch forms' });
    } finally {
      setLoadingForms(false);
    }
  }, [token, projectId]);

  const fetchAutoSendEmails = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoadingAutoSend(true);
      const response = await axios.get(`/api/projects/${projectId}/auto-send-emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAutoSendEmails(response.data.autoSendEmails || []);
    } catch (error: any) {
      console.error('Error fetching auto-send emails:', error);
      setMessage({ type: 'error', text: 'Failed to fetch auto-send emails' });
    } finally {
      setLoadingAutoSend(false);
    }
  }, [token, projectId]);

  useEffect(() => {
    if (user && token && projectId && !checkingProject) {
      fetchTemplates();
      fetchSmtpConfigs();
      fetchScheduledEmails();
      fetchRecipients();
      fetchFormSubmissions();
      fetchForms();
      fetchAutoSendEmails();
      
      // Set default date/time to tomorrow at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      const timeStr = '09:00';
      setScheduleFormData(prev => ({
        ...prev,
        scheduledDate: dateStr,
        scheduledTime: timeStr,
      }));
    }
  }, [user, token, projectId, checkingProject, fetchTemplates, fetchSmtpConfigs, fetchScheduledEmails, fetchRecipients, fetchFormSubmissions, fetchForms, fetchAutoSendEmails]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    setScheduleFormData(prev => ({
      ...prev,
      templateId,
      subject: template?.subject || prev.subject,
      html: template?.html || prev.html,
    }));
  };

  const handleFolderToggle = (folderName: string) => {
    setScheduleFormData(prev => {
      const folders = prev.recipientFolders;
      if (folders.includes(folderName)) {
        return { ...prev, recipientFolders: folders.filter(f => f !== folderName) };
      } else {
        return { ...prev, recipientFolders: [...folders, folderName] };
      }
    });
  };

  const handleScheduleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleFormData.templateId || !scheduleFormData.smtpId || !scheduleFormData.subject || !scheduleFormData.html || scheduleFormData.recipientFolders.length === 0 || !scheduleFormData.scheduledDate || !scheduleFormData.scheduledTime) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      setSavingSchedule(true);
      const scheduledAt = new Date(`${scheduleFormData.scheduledDate}T${scheduleFormData.scheduledTime}`);
      
      await axios.post(
        `/api/projects/${projectId}/scheduled-emails`,
        {
          templateId: scheduleFormData.templateId,
          smtpId: scheduleFormData.smtpId,
          subject: scheduleFormData.subject,
          html: scheduleFormData.html,
          recipientFolders: scheduleFormData.recipientFolders,
          scheduledAt: scheduledAt.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Email scheduled successfully' });
      setScheduleFormData({
        templateId: '',
        smtpId: scheduleFormData.smtpId, // Keep SMTP selection
        subject: '',
        html: '',
        scheduledDate: scheduleFormData.scheduledDate, // Keep date
        scheduledTime: scheduleFormData.scheduledTime, // Keep time
        recipientFolders: [],
      });
      fetchScheduledEmails();
    } catch (error: any) {
      console.error('Error scheduling email:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to schedule email' });
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleCancelScheduled = async (scheduledEmailId: string) => {
    try {
      await axios.put(
        `/api/projects/${projectId}/scheduled-emails/${scheduledEmailId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Scheduled email cancelled successfully' });
      fetchScheduledEmails();
    } catch (error: any) {
      console.error('Error cancelling scheduled email:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to cancel scheduled email' });
    }
  };

  const handleSendNow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleFormData.templateId || !scheduleFormData.smtpId || !scheduleFormData.subject || !scheduleFormData.html || scheduleFormData.recipientFolders.length === 0) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      setSendingNow(true);
      
      await axios.post(
        `/api/projects/${projectId}/scheduled-emails/send-now`,
        {
          templateId: scheduleFormData.templateId,
          smtpId: scheduleFormData.smtpId,
          subject: scheduleFormData.subject,
          html: scheduleFormData.html,
          recipientFolders: scheduleFormData.recipientFolders,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Email sent successfully!' });
    } catch (error: any) {
      console.error('Error sending email:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to send email' });
    } finally {
      setSendingNow(false);
    }
  };

  const handleAutoSendTemplateChange = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    setAutoSendFormData(prev => ({
      ...prev,
      templateId,
      subject: template?.subject || prev.subject,
      html: template?.html || prev.html,
    }));
  };

  const handleFormSelect = (formId: string) => {
    setAutoSendFormData(prev => ({ ...prev, formId }));
    // Check if auto-send rule already exists for this form
    const existing = autoSendEmails.find(a => a.formId._id === formId);
    if (existing) {
      // Load existing rule
      const template = templates.find(t => t._id === existing.templateId._id);
      setAutoSendFormData({
        formId: existing.formId._id,
        templateId: existing.templateId._id,
        smtpId: '', // Will be set from existing
        subject: existing.subject,
        html: '', // We'll need to fetch this from the API
        enabled: existing.enabled,
      });
    }
  };

  const handleSaveAutoSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!autoSendFormData.formId || !autoSendFormData.templateId || !autoSendFormData.smtpId || !autoSendFormData.subject || !autoSendFormData.html) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      setSavingAutoSend(true);
      
      await axios.post(
        `/api/projects/${projectId}/auto-send-emails`,
        {
          formId: autoSendFormData.formId,
          templateId: autoSendFormData.templateId,
          smtpId: autoSendFormData.smtpId,
          subject: autoSendFormData.subject,
          html: autoSendFormData.html,
          enabled: autoSendFormData.enabled,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Auto-send email rule saved successfully' });
      setAutoSendFormData({
        formId: '',
        templateId: '',
        smtpId: scheduleFormData.smtpId || '',
        subject: '',
        html: '',
        enabled: true,
      });
      fetchAutoSendEmails();
    } catch (error: any) {
      console.error('Error saving auto-send email:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save auto-send email rule' });
    } finally {
      setSavingAutoSend(false);
    }
  };

  const handleToggleAutoSend = async (autoSendId: string, currentEnabled: boolean) => {
    try {
      await axios.put(
        `/api/projects/${projectId}/auto-send-emails/${autoSendId}/toggle`,
        { enabled: !currentEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: `Auto-send email rule ${!currentEnabled ? 'enabled' : 'disabled'} successfully` });
      fetchAutoSendEmails();
    } catch (error: any) {
      console.error('Error toggling auto-send email:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to toggle auto-send email rule' });
    }
  };

  // Get available variables based on selected folders
  const getAvailableVariables = useMemo(() => {
    const variables = new Set<string>(['email', 'name']); // Always available
    
    // Get variables from selected recipient folders
    scheduleFormData.recipientFolders.forEach(folderName => {
      if (folderName.startsWith('form-')) {
        // Form lead folder - get variables from form submissions
        const formName = folderName.replace('form-', '');
        const submissions = formSubmissions[formName] || [];
        submissions.forEach((submission: any) => {
          Object.keys(submission.data || {}).forEach(key => {
            variables.add(key);
          });
        });
      } else {
        // Regular recipient folder - get variables from recipients
        recipients
          .filter((r: any) => r.folder === folderName)
          .forEach((recipient: any) => {
            // Add custom fields
            if (recipient.customFields) {
              Object.keys(recipient.customFields).forEach(key => {
                variables.add(key);
              });
            }
          });
      }
    });
    
    return Array.from(variables).sort();
  }, [scheduleFormData.recipientFolders, recipients, formSubmissions]);

  // Get available variables for auto-send (from selected form)
  const getAutoSendVariables = useMemo(() => {
    if (!autoSendFormData.formId) return [];
    
    const variables = new Set<string>(['email', 'name']);
    const formName = forms.find(f => f._id === autoSendFormData.formId)?.name;
    
    if (formName && formSubmissions[formName]) {
      formSubmissions[formName].forEach((submission: any) => {
        Object.keys(submission.data || {}).forEach(key => {
          variables.add(key);
        });
      });
    }
    
    return Array.from(variables).sort();
  }, [autoSendFormData.formId, forms, formSubmissions]);

  if (authLoading || checkingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !projectId || !projectInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader showProjectInfo={projectInfo} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Emails</h1>
            <p className="text-sm text-gray-500 mt-1">Schedule emails to be sent at a specific date and time</p>
          </div>
          <Link
            href={`/projects/${projectId}/users`}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Users
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Schedule Email
            </button>
            <button
              onClick={() => setActiveTab('autosend')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'autosend'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Auto-Send Email
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule New Email</h2>
              <form onSubmit={handleScheduleEmail}>
                <div className="mb-4">
                  <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Template <span className="text-red-500">*</span>
                  </label>
                  {loadingTemplates ? (
                    <div className="text-sm text-gray-500">Loading templates...</div>
                  ) : (
                    <select
                      id="template"
                      value={scheduleFormData.templateId}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Select a template</option>
                      {templates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="smtp" className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Configuration <span className="text-red-500">*</span>
                  </label>
                  {loadingSmtp ? (
                    <div className="text-sm text-gray-500">Loading SMTP configs...</div>
                  ) : (
                    <select
                      id="smtp"
                      value={scheduleFormData.smtpId}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, smtpId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Select SMTP</option>
                      {smtpConfigs.map((smtp) => (
                        <option key={smtp._id} value={smtp._id}>
                          {smtp.title || smtp.smtpHost} {smtp.isAdminSmtp ? '(Admin)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    {scheduleFormData.recipientFolders.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowVariables(!showVariables)}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        {showVariables ? 'Hide' : 'Show'} Variables
                      </button>
                    )}
                  </div>
                  {showVariables && scheduleFormData.recipientFolders.length > 0 && (
                    <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Available Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {getAvailableVariables.map((variable) => (
                          <button
                            key={variable}
                            type="button"
                            onClick={() => {
                              const currentSubject = scheduleFormData.subject;
                              const cursorPos = (document.getElementById('subject') as HTMLInputElement)?.selectionStart || currentSubject.length;
                              const newSubject = currentSubject.slice(0, cursorPos) + `{{${variable}}}` + currentSubject.slice(cursorPos);
                              setScheduleFormData(prev => ({ ...prev, subject: newSubject }));
                            }}
                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            {'{{'}{variable}{'}}'}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Click a variable to insert it into the subject</p>
                    </div>
                  )}
                  <input
                    type="text"
                    id="subject"
                    value={scheduleFormData.subject}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Hello {{name}}, welcome to our newsletter!"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="html" className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Content <span className="text-red-500">*</span>
                  </label>
                  {showVariables && scheduleFormData.recipientFolders.length > 0 && (
                    <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Available Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {getAvailableVariables.map((variable) => (
                          <button
                            key={variable}
                            type="button"
                            onClick={() => {
                              const textarea = document.getElementById('html') as HTMLTextAreaElement;
                              if (textarea) {
                                const cursorPos = textarea.selectionStart || scheduleFormData.html.length;
                                const currentHtml = scheduleFormData.html;
                                const newHtml = currentHtml.slice(0, cursorPos) + `{{${variable}}}` + currentHtml.slice(cursorPos);
                                setScheduleFormData(prev => ({ ...prev, html: newHtml }));
                                // Restore cursor position
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(cursorPos + variable.length + 4, cursorPos + variable.length + 4);
                                }, 0);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            {'{{'}{variable}{'}}'}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Click a variable to insert it into the HTML</p>
                    </div>
                  )}
                  <textarea
                    id="html"
                    value={scheduleFormData.html}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, html: e.target.value }))}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                    placeholder="<h1>Hello {{name}}!</h1><p>Your email: {{email}}</p>"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Folders <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {folders.length === 0 && Object.keys(formSubmissions).length === 0 ? (
                      <div className="text-sm text-gray-500">No folders available</div>
                    ) : (
                      <div className="space-y-2">
                        {folders.map((folder) => (
                          <label key={folder} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={scheduleFormData.recipientFolders.includes(folder)}
                              onChange={() => handleFolderToggle(folder)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{folder}</span>
                          </label>
                        ))}
                        {Object.keys(formSubmissions).map((formName) => {
                          const folderName = `form-${formName}`;
                          return (
                            <label key={folderName} className="flex items-center space-x-2 cursor-pointer hover:bg-green-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={scheduleFormData.recipientFolders.includes(folderName)}
                                onChange={() => handleFolderToggle(folderName)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-700 font-medium">{formName}</span>
                              <span className="text-xs text-green-600">
                                ({formSubmissions[formName].length} leads)
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {scheduleFormData.recipientFolders.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {scheduleFormData.recipientFolders.join(', ')}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="scheduledDate"
                      value={scheduleFormData.scheduledDate}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="scheduledTime"
                      value={scheduleFormData.scheduledTime}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSendNow}
                    disabled={sendingNow || savingSchedule}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sendingNow ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Send Now</span>
                      </>
                    )}
                  </button>
                  <button
                    type="submit"
                    disabled={savingSchedule || sendingNow}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingSchedule ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Scheduling...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Schedule Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Scheduled Emails List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scheduled Emails</h2>
              {loadingScheduled ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading...</p>
                </div>
              ) : scheduledEmails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No scheduled emails</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledEmails.map((scheduled) => (
                    <div key={scheduled._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">{scheduled.subject}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Template: {scheduled.templateId?.name || 'N/A'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          scheduled.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          scheduled.status === 'sent' ? 'bg-green-100 text-green-800' :
                          scheduled.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {scheduled.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        Scheduled: {new Date(scheduled.scheduledAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        Folders: {scheduled.recipientFolders.join(', ')}
                      </p>
                      {scheduled.status === 'pending' && (
                        <button
                          onClick={() => handleCancelScheduled(scheduled._id)}
                          className="w-full px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {activeTab === 'autosend' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Auto-Send Email on New Form Entry</h2>
          <p className="text-sm text-gray-500 mb-6">
            Configure automatic email sending when a new form submission is received. Use <code className="bg-gray-100 px-1 rounded">{'{{fieldName}}'}</code> to insert form field values in the subject and HTML.
          </p>
          
          <form onSubmit={handleSaveAutoSend}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="autoSendForm" className="block text-sm font-medium text-gray-700 mb-2">
                  Form <span className="text-red-500">*</span>
                </label>
                {loadingForms ? (
                  <div className="text-sm text-gray-500">Loading forms...</div>
                ) : (
                  <select
                    id="autoSendForm"
                    value={autoSendFormData.formId}
                    onChange={(e) => handleFormSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select a form</option>
                    {forms.map((form) => (
                      <option key={form._id} value={form._id}>
                        {form.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="autoSendTemplate" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template <span className="text-red-500">*</span>
                </label>
                {loadingTemplates ? (
                  <div className="text-sm text-gray-500">Loading templates...</div>
                ) : (
                  <select
                    id="autoSendTemplate"
                    value={autoSendFormData.templateId}
                    onChange={(e) => handleAutoSendTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select a template</option>
                    {templates.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="autoSendSmtp" className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Configuration <span className="text-red-500">*</span>
              </label>
              {loadingSmtp ? (
                <div className="text-sm text-gray-500">Loading SMTP configs...</div>
              ) : (
                <select
                  id="autoSendSmtp"
                  value={autoSendFormData.smtpId}
                  onChange={(e) => setAutoSendFormData(prev => ({ ...prev, smtpId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select SMTP</option>
                  {smtpConfigs.map((smtp) => (
                    <option key={smtp._id} value={smtp._id}>
                      {smtp.title || smtp.smtpHost} {smtp.isAdminSmtp ? '(Admin)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="autoSendSubject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              {autoSendFormData.formId && getAutoSendVariables.length > 0 && (
                <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {getAutoSendVariables.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => {
                          const currentSubject = autoSendFormData.subject;
                          const cursorPos = (document.getElementById('autoSendSubject') as HTMLInputElement)?.selectionStart || currentSubject.length;
                          const newSubject = currentSubject.slice(0, cursorPos) + `{{${variable}}}` + currentSubject.slice(cursorPos);
                          setAutoSendFormData(prev => ({ ...prev, subject: newSubject }));
                        }}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                      >
                        {'{{'}{variable}{'}}'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click a variable to insert it into the subject</p>
                </div>
              )}
              <input
                type="text"
                id="autoSendSubject"
                value={autoSendFormData.subject}
                onChange={(e) => setAutoSendFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Welcome {{name}}!"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Use {'{{fieldName}}'} to insert form field values</p>
            </div>

            <div className="mb-4">
              <label htmlFor="autoSendHtml" className="block text-sm font-medium text-gray-700 mb-2">
                HTML Content <span className="text-red-500">*</span>
              </label>
              {autoSendFormData.formId && getAutoSendVariables.length > 0 && (
                <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {getAutoSendVariables.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => {
                          const textarea = document.getElementById('autoSendHtml') as HTMLTextAreaElement;
                          if (textarea) {
                            const cursorPos = textarea.selectionStart || autoSendFormData.html.length;
                            const currentHtml = autoSendFormData.html;
                            const newHtml = currentHtml.slice(0, cursorPos) + `{{${variable}}}` + currentHtml.slice(cursorPos);
                            setAutoSendFormData(prev => ({ ...prev, html: newHtml }));
                            // Restore cursor position
                            setTimeout(() => {
                              textarea.focus();
                              textarea.setSelectionRange(cursorPos + variable.length + 4, cursorPos + variable.length + 4);
                            }, 0);
                          }
                        }}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                      >
                        {'{{'}{variable}{'}}'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click a variable to insert it into the HTML</p>
                </div>
              )}
              <textarea
                id="autoSendHtml"
                value={autoSendFormData.html}
                onChange={(e) => setAutoSendFormData(prev => ({ ...prev, html: e.target.value }))}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="<h1>Hello {{name}}!</h1><p>Thank you for subscribing with {{email}}</p>"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Use {'{{fieldName}}'} to insert form field values</p>
            </div>

            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoSendFormData.enabled}
                  onChange={(e) => setAutoSendFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Enable auto-send for this form</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={savingAutoSend}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {savingAutoSend ? 'Saving...' : 'Save Auto-Send Rule'}
            </button>
          </form>

          {/* Auto-Send Rules List */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Auto-Send Rules</h3>
            {loadingAutoSend ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </div>
            ) : autoSendEmails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No auto-send rules configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {autoSendEmails.map((autoSend) => (
                  <div key={autoSend._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{autoSend.formId?.name || 'Unknown Form'}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Template: {autoSend.templateId?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Subject: {autoSend.subject}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          autoSend.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {autoSend.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => handleToggleAutoSend(autoSend._id, autoSend.enabled)}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            autoSend.enabled
                              ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {autoSend.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

