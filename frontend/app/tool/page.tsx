'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import HTMLEditor from '../../components/HTMLEditor';
import ConfirmDialog from '../../components/ConfirmDialog';
import Alert from '../../components/Alert';
import AuthHeader from '../../components/AuthHeader';

const API_URL = '/api';

const defaultHtmlTemplate = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Welcome to Przio</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0; padding:0; background-color:#f2f4f7;">

    <!-- Wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f4f7">
        <tr>
            <td align="center" style="padding:20px 10px;">

                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="width:100%; max-width:600px; background-color:#ffffff; border-radius:8px;">

                    <!-- Gradient Header -->
                    <tr>
                        <td align="center" style="padding:35px 20px;
                   background-color:#4f46e5;
                   background-image: linear-gradient(90deg, #4f46e5, #0ea5e9);
                   border-radius:8px 8px 0 0;">

                            <h1 style="margin:0;
                       font-family:Arial, Helvetica, sans-serif;
                       font-size:28px;
                       color:#ffffff;">
                                Welcome to Przio
                            </h1>

                            <p style="margin:10px 0 0;
                      font-family:Arial, Helvetica, sans-serif;
                      font-size:16px;
                      color:#e0e7ff;">
                                Your journey starts here
                            </p>

                        </td>
                    </tr>

                    <!-- Banner Placeholder -->
                    <tr>
                        <td align="center" style="padding:20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background-color:#eef2ff; border:1px dashed #c7d2fe;">
                                <tr>
                                    <td align="center" style="padding:40px 20px;">
                                        <p style="margin:0;
                            font-family:Arial, Helvetica, sans-serif;
                            font-size:18px;
                            color:#4f46e5;">
                                            Banner Image Placeholder
                                        </p>
                                        <p style="margin:8px 0 0;
                            font-family:Arial, Helvetica, sans-serif;
                            font-size:14px;
                            color:#6b7280;">
                                            (Recommended size: 600 × 250)
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding:10px 30px 30px;
                     font-family:Arial, Helvetica, sans-serif;
                     color:#333333;">

                            <p style="font-size:16px; line-height:24px; margin:0 0 15px;">
                                Hello <strong>{{User Name}}</strong>,
                            </p>

                            <p style="font-size:16px; line-height:24px; margin:0 0 15px;">
                                We're excited to welcome you to <strong>Przio</strong>. You're now part of a growing
                                community that values innovation, performance, and simplicity.
                            </p>

                            <p style="font-size:16px; line-height:24px; margin:0 0 20px;">
                                This email is designed to help you get started quickly and understand what Przio
                                can do for you.
                            </p>

                            <!-- Feature Section -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:15px; background-color:#f9fafb; border-radius:6px;">

                                        <h3 style="margin:0 0 10px;
                             font-size:18px;
                             font-family:Arial, Helvetica, sans-serif;
                             color:#111827;">
                                            What you can do with Przio
                                        </h3>

                                        <ul style="padding-left:20px; margin:0; font-size:15px; line-height:22px;">
                                            <li>Feature placeholder one – short explanation text</li>
                                            <li>Feature placeholder two – short explanation text</li>
                                            <li>Feature placeholder three – short explanation text</li>
                                        </ul>

                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:30px auto;">
                                <tr>
                                    <td align="center" style="background-color:#4f46e5;
                         background-image: linear-gradient(90deg, #4f46e5, #0ea5e9);
                         border-radius:5px;">
                                        <a href="{{CTA Link}}" target="_blank" style="display:inline-block;
                           padding:14px 28px;
                           font-size:16px;
                           font-family:Arial, Helvetica, sans-serif;
                           color:#ffffff;
                           text-decoration:none;">
                                            Get Started with Przio
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size:15px; line-height:22px; margin:0 0 10px; color:#4b5563;">
                                Need help? Our support team is always here for you.
                            </p>

                            <p style="font-size:14px; line-height:22px; margin:0; color:#6b7280;">
                                Simply reply to this email or visit our help center for more information.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding:20px;
                   background-color:#f2f4f7;
                   border-radius:0 0 8px 8px;">
                            <p style="margin:0;
                      font-family:Arial, Helvetica, sans-serif;
                      font-size:13px;
                      color:#6b7280;">
                                © 2025 Przio. All rights reserved.
                            </p>
                            <p style="margin:5px 0 0;
                      font-family:Arial, Helvetica, sans-serif;
                      font-size:12px;
                      color:#9ca3af;">
                                {{Company Address}} | <a href="{{Unsubscribe Link}}"
                                    style="color:#6b7280;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- End Main Container -->

            </td>
        </tr>
    </table>

</body>

</html>`;

interface Template {
  _id: string;
  name: string;
  html: string;
  folder?: string;
  isDefault?: boolean;
  defaultTemplateId?: string;
  createdAt: string;
  updatedAt: string;
}


export default function ToolPage() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [checkingProject, setCheckingProject] = useState(true);
  const [html, setHtml] = useState(defaultHtmlTemplate);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [previewZoom, setPreviewZoom] = useState(100); // Zoom percentage
  const [splitPosition, setSplitPosition] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [originalHtml, setOriginalHtml] = useState(defaultHtmlTemplate);
  const [originalTemplateName, setOriginalTemplateName] = useState('');
  const [folders, setFolders] = useState<Array<{ _id?: string; name: string }>>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewPageInput, setShowNewPageInput] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [draggedTemplate, setDraggedTemplate] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [emailProgress, setEmailProgress] = useState({ sent: 0, pending: 0, failed: 0, total: 0 });
  const [selectedSmtp, setSelectedSmtp] = useState<string>('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [smtpConfigs, setSmtpConfigs] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [recipientFolders, setRecipientFolders] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [expandedRecipientFolders, setExpandedRecipientFolders] = useState<Set<string>>(new Set());
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const [templateSearch, setTemplateSearch] = useState('');
  const [showTemplateSuggestions, setShowTemplateSuggestions] = useState(false);
  const [highlightedTemplateIndex, setHighlightedTemplateIndex] = useState(-1);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
  });
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [creatingShareLink, setCreatingShareLink] = useState(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchSmtpConfigs = useCallback(async () => {
    try {
      // Fetch user's SMTP configs
      const userSmtpResponse = await axios.get('/api/user/smtp', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userSmtpConfigs = userSmtpResponse.data.smtpConfigs || [];

      // Fetch admin SMTP configs (public, default active one)
      const adminSmtpResponse = await axios.get('/api/admin/smtp/public');
      const adminSmtpConfigs = (adminSmtpResponse.data.smtpConfigs || []).map((smtp: any) => {
        const adminSmtp = {
          ...smtp,
          _id: `admin_${smtp._id}`, // Prefix to distinguish from user SMTP
          isAdminSmtp: true,
          // Explicitly preserve isDefault and isActive
          isDefault: smtp.isDefault === true,
          isActive: smtp.isActive === true,
        };
        console.log('Admin SMTP mapped:', {
          originalId: smtp._id,
          mappedId: adminSmtp._id,
          isDefault: adminSmtp.isDefault,
          isActive: adminSmtp.isActive,
          title: adminSmtp.title,
        });
        return adminSmtp;
      });

      // Combine: user SMTP first, then admin SMTP
      const allConfigs = [...userSmtpConfigs, ...adminSmtpConfigs];
      setSmtpConfigs(allConfigs);

      // Debug logging
      console.log('SMTP Configs Debug:', {
        userSmtpCount: userSmtpConfigs.length,
        adminSmtpCount: adminSmtpConfigs.length,
        adminSmtpConfigs: adminSmtpConfigs,
        allConfigsCount: allConfigs.length,
      });

      // Set default to active user SMTP, or default admin SMTP, or first one
      const activeUser = userSmtpConfigs.find((s: any) => s.isActive);
      const defaultAdmin = adminSmtpConfigs.find((s: any) => s.isDefault === true);
      
      console.log('SMTP Selection Debug:', {
        activeUser: activeUser ? activeUser._id : null,
        defaultAdmin: defaultAdmin ? defaultAdmin._id : null,
        defaultAdminDetails: defaultAdmin,
      });
      
      if (activeUser) {
        setSelectedSmtp(activeUser._id);
      } else if (defaultAdmin) {
        setSelectedSmtp(defaultAdmin._id);
      } else if (allConfigs.length > 0) {
        setSelectedSmtp(allConfigs[0]._id);
      }
    } catch (error) {
      console.error('Error fetching SMTP configs:', error);
    }
  }, [token]);

  const fetchRecipients = useCallback(async () => {
    try {
      // If projectId is available, fetch project-specific recipients (includes Team Members folder)
      // Otherwise, fetch personal recipients
      const url = projectId 
        ? `/api/user/recipients?projectId=${projectId}`
        : '/api/user/recipients';
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recipientsData = response.data.recipients || [];
      setRecipients(recipientsData);
      
      // Extract unique folders
      const uniqueFolders = Array.from(
        new Set(recipientsData.map((r: any) => (r.folder || '').trim()).filter((f: string) => f))
      ) as string[];
      
      // Ensure Team Members folder appears first if it exists
      const sortedFolders = uniqueFolders.sort((a, b) => {
        if (a === 'Team Members') return -1;
        if (b === 'Team Members') return 1;
        return a.localeCompare(b);
      });
      
      setRecipientFolders(sortedFolders);
      
      console.log('Recipients fetched:', recipientsData.length, 'Folders:', sortedFolders);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  }, [token, projectId]);

  const fetchTemplates = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await axios.get(`${API_URL}/templates?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data.templates);
      
      // Fetch folders after templates are loaded
      const foldersResponse = await axios.get(`${API_URL}/folders?type=template&projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dbFolders = foldersResponse.data.folders || [];
      const dbFolderMap = new Map<string, { _id: string; name: string }>(
        dbFolders.map((f: any) => [f.name, { _id: f._id, name: f.name }])
      );
      
      // Extract unique folders from templates
      const foldersFromTemplates = Array.from(new Set(
        response.data.templates
          .map((t: Template) => t.folder)
          .filter((f: string | undefined) => f && f.trim())
      )) as string[];
      
      // Merge DB folders with folders from templates
      const allFolderNames = Array.from(new Set([...dbFolders.map((f: any) => f.name), ...foldersFromTemplates]));
      const allFolders: Array<{ _id?: string; name: string }> = allFolderNames.map((name: string) => {
        // If folder exists in DB, use DB folder object, otherwise create a name-only object
        const dbFolder = dbFolderMap.get(name);
        if (dbFolder) {
          return { _id: dbFolder._id, name: dbFolder.name };
        }
        return { name };
      }).sort((a, b) => a.name.localeCompare(b.name));
      setFolders(allFolders);
      
      // Auto-expand folders that have templates
      const foldersWithTemplates = foldersFromTemplates.filter(folder => 
        response.data.templates.some((t: Template) => t.folder === folder)
      );
      setExpandedFolders(new Set(foldersWithTemplates));
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  }, [token, projectId]);

  // Check project access
  useEffect(() => {
    const checkProject = async () => {
      if (!user || !token) {
        setCheckingProject(false);
        return;
      }

      // Get projectId from query params or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const queryProjectId = urlParams.get('projectId');
      const storedProjectId = localStorage.getItem('selectedProjectId');
      const currentProjectId = queryProjectId || storedProjectId;

      if (!currentProjectId) {
        router.push('/projects');
        return;
      }

      try {
        // Verify user has access to this project
        const response = await axios.get(`${API_URL}/projects/${currentProjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setProjectId(currentProjectId);
        setProjectInfo({
          name: response.data.project.name,
          role: response.data.project.role,
        });
        localStorage.setItem('selectedProjectId', currentProjectId);
      } catch (error: any) {
        console.error('Project access error:', error);
        localStorage.removeItem('selectedProjectId');
        router.push('/projects');
      } finally {
        setCheckingProject(false);
      }
    };

    checkProject();
  }, [user, token, router]);

  useEffect(() => {
    if (user && token && projectId && !checkingProject) {
      fetchTemplates();
      fetchSmtpConfigs();
      fetchRecipients();
    }
  }, [user, token, projectId, checkingProject, fetchTemplates, fetchSmtpConfigs, fetchRecipients]);

  // Set default template when modal opens
  useEffect(() => {
    if (showSendEmailModal) {
      // If a template is currently selected, use it
      if (selectedTemplate && templates.find(t => t._id === selectedTemplate)) {
        // Already set
      } else if (templates.length > 0) {
        // Try to find template matching current HTML
        const matchingTemplate = templates.find(t => t.html.trim() === html.trim());
        if (matchingTemplate) {
          setSelectedTemplate(matchingTemplate._id);
        } else {
          // Default to first template
          setSelectedTemplate(templates[0]._id);
        }
      }
    }
  }, [showSendEmailModal, templates, selectedTemplate, html]);

  // Auto-save functionality - saves after 2 seconds of inactivity
  useEffect(() => {
    // Only auto-save if we have content
    if (!html.trim()) {
      return;
    }

    // Only auto-save if we have a template name OR it's an existing template
    if (!templateName.trim() && !selectedTemplate) {
      return;
    }

    // Clear existing timeout
    const timeoutId = setTimeout(() => {
      handleSaveTemplate(true);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, templateName, selectedTemplate]);

  const handleSaveTemplate = async (isAutoSave = false) => {
    // Prevent duplicate saves
    if (isSavingRef.current) {
      return;
    }

    // For auto-save: check if there are actual changes
    if (isAutoSave) {
      // Check if content has changed
      const htmlChanged = html.trim() !== originalHtml.trim();
      const nameChanged = templateName.trim() !== originalTemplateName.trim();
      
      // Only save if there are actual changes
      if (!htmlChanged && !nameChanged) {
        return; // No changes, don't save
      }

      // If it's a new template without a name, generate a temporary name
      if (!selectedTemplate && !templateName.trim() && html.trim()) {
        const tempName = `Untitled Template ${new Date().toLocaleTimeString()}`;
        setTemplateName(tempName);
        setOriginalTemplateName(tempName);
        // Wait a bit for state to update, then save
        setTimeout(() => handleSaveTemplate(true), 100);
        return;
      }
      // Only auto-save if we have content and (a name or existing template)
      if (!html.trim() || (!templateName.trim() && !selectedTemplate)) {
        return;
      }
    }

    isSavingRef.current = true;

    // For manual save, show alert if fields are empty
    if (!isAutoSave && (!templateName.trim() || !html.trim())) {
      setAlert({
        isOpen: true,
        message: 'Please provide a template name and HTML content',
        type: 'error',
      });
      isSavingRef.current = false;
      return;
    }

    isSavingRef.current = true;

    if (isAutoSave) {
      setAutoSaving(true);
    } else {
      setSaving(true);
    }

    try {
      if (selectedTemplate) {
        // Update existing template
        await axios.put(
          `${API_URL}/templates/${selectedTemplate}`,
          { name: templateName, html, folder: selectedFolder || undefined, projectId: projectId || undefined },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new template
        const response = await axios.post(
          `${API_URL}/templates`,
          { 
            name: templateName, 
            html, 
            folder: selectedFolder || undefined,
            isDefault: false,
            projectId: projectId || undefined
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Update selectedTemplate after creating
        if (response.data.template) {
          setSelectedTemplate(response.data.template._id);
        }
      }
      await fetchTemplates();
      setLastSaved(new Date());
      
      // Update original values after successful save (only for auto-save)
      if (isAutoSave) {
        setOriginalHtml(html);
        setOriginalTemplateName(templateName);
      }
      
      if (!isAutoSave) {
        setSelectedTemplate(null);
        setTemplateName('');
        setOriginalHtml('');
        setOriginalTemplateName('');
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successMsg.textContent = 'Template saved successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          document.body.removeChild(successMsg);
        }, 3000);
      }
    } catch (error: any) {
      if (!isAutoSave) {
        setAlert({
          isOpen: true,
          message: error.response?.data?.error || 'Failed to save template',
          type: 'error',
        });
      }
    } finally {
      isSavingRef.current = false;
      if (isAutoSave) {
        setAutoSaving(false);
      } else {
        setSaving(false);
      }
    }
  };

  // Auto-save functionality - saves after 2 seconds of inactivity
  useEffect(() => {
    // Skip if already saving
    if (isSavingRef.current) {
      return;
    }

    // Only auto-save if we have content
    if (!html.trim()) {
      return;
    }

    // Only auto-save if we have a template name OR it's an existing template
    if (!templateName.trim() && !selectedTemplate) {
      return;
    }

    // Check if there are actual changes before setting timeout
    const htmlChanged = html.trim() !== originalHtml.trim();
    const nameChanged = templateName.trim() !== originalTemplateName.trim();
    
    if (!htmlChanged && !nameChanged) {
      return; // No changes, don't set timeout
    }

    // Clear existing timeout
    const timeoutId = setTimeout(() => {
      if (!isSavingRef.current) {
        handleSaveTemplate(true);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, templateName, selectedTemplate, originalHtml, originalTemplateName]);

  const handleLoadTemplate = (template: Template) => {
    setHtml(template.html);
    setTemplateName(template.name);
    setSelectedTemplate(template._id);
    setOriginalHtml(template.html);
    setOriginalTemplateName(template.name);
    setSelectedFolder(template.folder || '');
    setLastSaved(null);
  };


  const handleSelectSuggestion = (recipient: any) => {
    if (!selectedRecipients.includes(recipient._id)) {
      setSelectedRecipients([...selectedRecipients, recipient._id]);
    }
    // Expand the folder if recipient is in a folder
    if (recipient.folder && !expandedRecipientFolders.has(recipient.folder)) {
      setExpandedRecipientFolders(new Set([...Array.from(expandedRecipientFolders), recipient.folder]));
    }
    setRecipientSearch('');
    setShowSearchSuggestions(false);
    setHighlightedSuggestionIndex(-1);
  };

  const handleSelectTemplateSuggestion = (template: any) => {
    setSelectedTemplate(template._id);
    setHtml(template.html);
    setTemplateName(template.name);
    setTemplateSearch('');
    setShowTemplateDropdown(false);
    setShowTemplateSuggestions(false);
    setHighlightedTemplateIndex(-1);
  };

  const handleSendEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate || !selectedSmtp || (selectedRecipients.length === 0 && selectedFolders.length === 0)) {
      return;
    }

    // Get all recipient emails
    let recipientEmails: string[] = [];
    
    // Add individual recipients
    selectedRecipients.forEach(id => {
      const recipient = recipients.find(r => r._id === id);
      if (recipient) {
        recipientEmails.push(recipient.email);
      }
    });

    // Add recipients from selected folders
    selectedFolders.forEach(folder => {
      const folderRecipients = recipients.filter(r => r.folder === folder);
      folderRecipients.forEach(r => {
        if (!recipientEmails.includes(r.email)) {
          recipientEmails.push(r.email);
        }
      });
    });

    if (recipientEmails.length === 0) {
      setAlert({
        isOpen: true,
        message: 'Please select at least one recipient',
        type: 'error',
      });
      return;
    }

    const template = templates.find(t => t._id === selectedTemplate);
    if (!template) {
      setAlert({
        isOpen: true,
        message: 'Template not found',
        type: 'error',
      });
      return;
    }

    setSendingEmails(true);
    setShowSendEmailModal(false);
    setShowProgressModal(true);
    setEmailProgress({ sent: 0, pending: recipientEmails.length, failed: 0, total: recipientEmails.length });

    try {
      // Use the template's HTML, not the current editor HTML
      const response = await axios.post(
        '/api/emails/send-bulk',
        {
          templateId: selectedTemplate,
          html: template.html,
          subject: emailSubject,
          smtpId: selectedSmtp,
          recipients: recipientEmails,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update progress from response
      if (response.data.progress) {
        setEmailProgress(response.data.progress);
      } else {
        setEmailProgress({
          sent: response.data.sent || recipientEmails.length,
          pending: 0,
          failed: response.data.failed || 0,
          total: recipientEmails.length,
        });
      }
    } catch (error: any) {
      console.error('Error sending emails:', error);
      setEmailProgress(prev => ({
        ...prev,
        failed: prev.total - prev.sent,
        pending: 0,
      }));
    } finally {
      setSendingEmails(false);
      setSelectedRecipients([]);
      setSelectedFolders([]);
    }
  };


  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const folderName = newFolderName.trim();
    
    try {
      // Save folder to database
      const response = await axios.post(
        `${API_URL}/folders`,
        { name: folderName, type: 'template', projectId: projectId || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const folderExists = folders.some(f => f.name === folderName);
      if (!folderExists) {
        setFolders([...folders, { _id: response.data.folder._id, name: folderName }].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setSelectedFolder(folderName);
      setNewFolderName('');
      setShowNewFolderInput(false);
    } catch (error: any) {
      console.error('Failed to create folder:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create folder';
      setAlert({
        isOpen: true,
        message: errorMessage,
        type: 'error',
      });
      
      // Still add to local state if it's a duplicate error (folder might already exist in DB)
      if (error.response?.status === 400 && errorMessage.includes('already exists')) {
        const folderExists = folders.some(f => f.name === folderName);
        if (!folderExists) {
          // Try to fetch the folder from DB to get its ID
          try {
            const foldersResponse = await axios.get(`${API_URL}/folders?type=template${projectId ? `&projectId=${projectId}` : ''}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const dbFolder = foldersResponse.data.folders?.find((f: any) => f.name === folderName);
            if (dbFolder) {
              setFolders([...folders, { _id: dbFolder._id, name: folderName }].sort((a, b) => a.name.localeCompare(b.name)));
            } else {
              setFolders([...folders, { name: folderName }].sort((a, b) => a.name.localeCompare(b.name)));
            }
          } catch {
            setFolders([...folders, { name: folderName }].sort((a, b) => a.name.localeCompare(b.name)));
          }
        }
        setSelectedFolder(folderName);
        setNewFolderName('');
        setShowNewFolderInput(false);
      }
    }
  };

  const handleCreateNewPage = () => {
    if (newPageName.trim()) {
      setTemplateName(newPageName.trim());
      setHtml(defaultHtmlTemplate);
      setSelectedTemplate(null);
      setOriginalHtml(defaultHtmlTemplate);
      setOriginalTemplateName('');
      setNewPageName('');
      setShowNewPageInput(false);
    }
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
  };

  const handleDragStart = (e: React.DragEvent, templateId: string) => {
    setDraggedTemplate(templateId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', templateId);
  };

  const handleDragOver = (e: React.DragEvent, folder: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folder);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolder: string | null) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    if (!draggedTemplate) return;

    const template = templates.find(t => t._id === draggedTemplate);
    if (!template) return;

    // Don't do anything if dropped on the same folder
    if (template.folder === targetFolder) {
      setDraggedTemplate(null);
      return;
    }

    try {
      await axios.put(
        `${API_URL}/templates/${draggedTemplate}`,
        { 
          name: template.name, 
          html: template.html,
          folder: targetFolder || undefined,
          projectId: projectId || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchTemplates();
      
      // If the template was moved to a folder, expand that folder
      if (targetFolder) {
        setExpandedFolders(prev => new Set(prev).add(targetFolder));
      }
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to move template',
        type: 'error',
      });
    } finally {
      setDraggedTemplate(null);
    }
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Folder',
      message: `Are you sure you want to delete the folder "${folderName}"? This will only delete the folder if it's empty.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await axios.delete(`${API_URL}/folders/${folderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Remove folder from state
          setFolders(folders.filter(f => f._id !== folderId));
          
          // Clear selected folder if it was the deleted one
          if (selectedFolder === folderName) {
            setSelectedFolder('');
          }
          
          // Remove from expanded folders
          setExpandedFolders(prev => {
            const newSet = new Set(prev);
            newSet.delete(folderName);
            return newSet;
          });
          
          // Refresh templates to update folder list
          await fetchTemplates();
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to delete folder';
          setAlert({
            isOpen: true,
            message: errorMessage,
            type: 'error',
          });
        }
      },
    });
  };

  // Group templates by folder
  const groupedTemplates = templates.reduce((acc, template) => {
    const folder = template.folder || '';
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  // Separate folders and templates without folders
  const templatesWithoutFolder = groupedTemplates[''] || [];
  const folderOrder = folders.map(f => f.name);

  const handleShare = async () => {
    if (!html || !html.trim()) {
      setAlert({
        isOpen: true,
        message: 'Please add some content to share',
        type: 'error',
      });
      return;
    }

    setCreatingShareLink(true);
    try {
      const response = await axios.post(
        `${API_URL}/share/create`,
        {
          html: html,
          templateId: selectedTemplate || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShareUrl(response.data.shareUrl);
      setShowShareModal(true);
    } catch (error: any) {
      console.error('Share error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Failed to create share link';
      setAlert({
        isOpen: true,
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setCreatingShareLink(false);
    }
  };

  const handleCopyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setAlert({
        isOpen: true,
        message: 'Share link copied to clipboard!',
        type: 'success',
      });
    }
  };

  const handleDeleteTemplate = (id: string) => {
    const template = templates.find(t => t._id === id);
    const templateName = template?.name || 'this template';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Template',
      message: `Are you sure you want to delete "${templateName}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await axios.delete(`${API_URL}/templates/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await fetchTemplates();
          if (selectedTemplate === id) {
            setHtml('');
            setTemplateName('');
            setSelectedTemplate(null);
          }
          setAlert({
            isOpen: true,
            message: 'Template deleted successfully',
            type: 'success',
          });
        } catch (error: any) {
          setAlert({
            isOpen: true,
            message: error.response?.data?.error || 'Failed to delete template',
            type: 'error',
          });
        }
      },
    });
  };

  const handleNewTemplate = () => {
    setHtml(defaultHtmlTemplate);
    setTemplateName('');
    setSelectedTemplate(null);
    setOriginalHtml(defaultHtmlTemplate);
    setOriginalTemplateName('');
    setLastSaved(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const container = document.querySelector('.split-container');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
      
      // Limit between 20% and 80%
      const clampedPosition = Math.max(20, Math.min(80, newPosition));
      setSplitPosition(clampedPosition);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (authLoading || loading || checkingProject) {
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

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      {!isFullscreen && projectInfo && (
        <AuthHeader showProjectInfo={projectInfo} projectId={projectId || undefined} />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Templates */}
        {!isFullscreen && (
          <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Templates</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="New Folder"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowNewPageInput(!showNewPageInput)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="New HTML Page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* New Folder Input */}
              {showNewFolderInput && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="Folder name..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-2"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateFolder}
                      className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* New Page Input */}
              {showNewPageInput && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateNewPage()}
                    placeholder="Page name..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-2"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateNewPage}
                      className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPageInput(false);
                        setNewPageName('');
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {templates.length === 0 && folders.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">No templates yet</p>
                    <p className="text-xs text-gray-400">Create a new template to get started</p>
                  </div>
                ) : (
                  <>
                    {/* Folders with Accordion */}
                    {folders.map((folder) => {
                      const folderName = folder.name;
                      const folderTemplates = groupedTemplates[folderName] || [];
                      const isExpanded = expandedFolders.has(folderName);
                      const isDraggedOver = dragOverFolder === folderName;

                      return (
                        <div key={folderName} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Folder Accordion Header */}
                          <div
                            className={`flex items-center justify-between p-2.5 bg-gray-50 transition-colors ${
                              isDraggedOver
                                ? 'bg-indigo-100 border-b-2 border-indigo-400'
                                : 'hover:bg-gray-100'
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              handleDragOver(e, folderName);
                            }}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, folderName)}
                          >
                            <div 
                              className="flex items-center space-x-2 flex-1 cursor-pointer"
                              onClick={() => toggleFolder(folderName)}
                            >
                              <svg
                                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <svg
                                className="w-4 h-4 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">{folderName}</span>
                              <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">
                                {folderTemplates.length}
                              </span>
                            </div>
                            {folder._id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFolder(folder._id!, folderName);
                                }}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors ml-2"
                                title="Delete folder"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          {/* Folder Accordion Content */}
                          {isExpanded && (
                            <div className="bg-white border-t border-gray-200">
                              <div className="p-2 space-y-1">
                                {folderTemplates.length === 0 ? (
                                  <div className="text-center py-4 text-sm text-gray-400">
                                    <p>No templates in this folder</p>
                                    <p className="text-xs mt-1">Create a template and save it here</p>
                                  </div>
                                ) : (
                                  folderTemplates.map((template) => (
                                  <div
                                    key={template._id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, template._id)}
                                    className={`p-2 rounded border cursor-pointer transition-all ${
                                      selectedTemplate === template._id
                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                        : draggedTemplate === template._id
                                        ? 'opacity-50 border-gray-300'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div
                                        onClick={() => handleLoadTemplate(template)}
                                        className="flex-1 cursor-pointer min-w-0"
                                      >
                                        <div className="flex items-center space-x-2 mb-1">
                                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <h3 className="font-medium text-sm text-gray-900 truncate">
                                            {template.name}
                                          </h3>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-5.5">
                                          {new Date(template.updatedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTemplate(template._id);
                                          }}
                                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                          title="Delete template"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  ))
                                )}
                                
                                {/* Drop Zone inside folder */}
                                <div
                                  className={`p-2 rounded border-2 border-dashed transition-colors ${
                                    isDraggedOver && dragOverFolder === folderName
                                      ? 'border-indigo-400 bg-indigo-50'
                                      : 'border-gray-200'
                                  }`}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    handleDragOver(e, folderName);
                                  }}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, folderName)}
                                >
                                  <p className="text-xs text-center text-gray-400">
                                    {isDraggedOver ? 'Drop here to add to folder' : 'Drag template here'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Templates without folder */}
                    {templatesWithoutFolder.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-2.5 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Other Templates</span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">
                              {templatesWithoutFolder.length}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 space-y-1 bg-white">
                          {templatesWithoutFolder.map((template) => (
                            <div
                              key={template._id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, template._id)}
                              className={`p-2 rounded border cursor-pointer transition-all ${
                                selectedTemplate === template._id
                                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                  : draggedTemplate === template._id
                                  ? 'opacity-50 border-gray-300'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div
                                  onClick={() => handleLoadTemplate(template)}
                                  className="flex-1 cursor-pointer min-w-0"
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="font-medium text-sm text-gray-900 truncate">
                                      {template.name}
                                    </h3>
                                  </div>
                                  <p className="text-xs text-gray-500 ml-5.5">
                                    {new Date(template.updatedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTemplate(template._id);
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="Delete template"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white flex flex-col h-full">
            {/* Toolbar */}
            {!isFullscreen && (
              <div className="border-b border-gray-200 p-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Template name..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    {(folders.length > 0 || selectedFolder) && (
                      <div className="relative">
                        <select
                          value={selectedFolder}
                          onChange={(e) => setSelectedFolder(e.target.value)}
                          className="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:border-gray-400 shadow-sm"
                        >
                          <option value="">No Folder</option>
                          {folders.map((folder) => (
                            <option key={folder.name} value={folder.name}>
                              {folder.name}
                            </option>
                          ))}
                          {/* Show selected folder even if it's not in folders yet (newly created) */}
                          {selectedFolder && !folders.some(f => f.name === selectedFolder) && (
                            <option key={selectedFolder} value={selectedFolder}>
                              {selectedFolder}
                            </option>
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {autoSaving && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Auto-saving...</span>
                      </div>
                    )}
                    {lastSaved && !autoSaving && !saving && (
                      <div className="text-xs text-gray-500">
                        Saved {lastSaved.toLocaleTimeString()}
                      </div>
                    )}
                    <button
                      onClick={() => handleSaveTemplate(false)}
                      disabled={saving || !templateName.trim() || !html.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Template'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            {!isFullscreen && (
              <div className="border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('split')}
                      className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === 'split'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Split View
                    </button>
                    <button
                      onClick={() => setActiveTab('editor')}
                      className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === 'editor'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === 'preview'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                  {activeTab === 'editor' && !isFullscreen && (
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="px-4 py-2 mr-4 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      title="Enter fullscreen (ESC to exit)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span>Fullscreen</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'split' ? (
                  <div className="h-full flex split-container relative">
                    {/* Editor - Left Half */}
                    <div 
                      className="flex flex-col h-full border-r border-gray-200"
                      style={{ width: `${splitPosition}%` }}
                    >
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                        <span className="text-sm font-medium text-gray-700">Editor</span>
                        <button
                          onClick={() => setActiveTab('editor')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                          title="Expand editor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1 overflow-hidden min-h-0">
                        <HTMLEditor
                          value={html}
                          onChange={(value) => setHtml(value || '')}
                          isFullscreen={false}
                          onFullscreenChange={setIsFullscreen}
                        />
                      </div>
                    </div>
                    {/* Resizer */}
                    <div
                      className="w-1 bg-gray-200 hover:bg-indigo-500 cursor-col-resize transition-colors flex-shrink-0 relative group z-10"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing(true);
                      }}
                      style={{ minWidth: '4px', width: '4px' }}
                    >
                      <div className="absolute inset-y-0 -left-1 -right-1 bg-transparent group-hover:bg-indigo-100/50 transition-colors"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-0.5">
                          <div className="w-0.5 h-8 bg-indigo-500 rounded"></div>
                          <div className="w-0.5 h-8 bg-indigo-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                    {/* Preview - Right Half */}
                    <div 
                      className="flex flex-col flex-1 h-full min-w-0"
                      style={{ width: `${100 - splitPosition}%` }}
                    >
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                        <span className="text-sm font-medium text-gray-700">Preview</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 bg-white rounded border border-gray-300 p-1">
                            <button
                              onClick={() => setPreviewMode('mobile')}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                previewMode === 'mobile'
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              title="Mobile view (375px)"
                            >
                              📱
                            </button>
                            <button
                              onClick={() => setPreviewMode('tablet')}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                previewMode === 'tablet'
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              title="Tablet view (768px)"
                            >
                              📱
                            </button>
                            <button
                              onClick={() => setPreviewMode('desktop')}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                previewMode === 'desktop'
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              title="Desktop view (100%)"
                            >
                              💻
                            </button>
                          </div>
                          <div className="flex items-center space-x-1 bg-white rounded border border-gray-300 p-1">
                            <button
                              onClick={() => setPreviewZoom(prev => Math.max(25, prev - 25))}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Zoom out"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                              </svg>
                            </button>
                            <span className="px-2 py-1 text-xs text-gray-600 font-medium min-w-[3rem] text-center">
                              {previewZoom}%
                            </span>
                            <button
                              onClick={() => setPreviewZoom(prev => Math.min(200, prev + 25))}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Zoom in"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setPreviewZoom(100)}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Reset zoom"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={handleShare}
                            disabled={creatingShareLink || !html || !html.trim()}
                            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Share preview"
                          >
                            {creatingShareLink ? (
                              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveTab('preview')}
                            className="text-xs text-gray-500 hover:text-gray-700"
                            title="Expand preview"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto bg-gray-100 min-h-0">
                        <div className="h-full flex items-center justify-center p-2">
                          <div
                            className={`bg-white shadow-lg transition-all duration-300 ${
                              previewMode === 'mobile' ? 'w-[375px]' :
                              previewMode === 'tablet' ? 'w-[768px]' :
                              'w-full max-w-full'
                            }`}
                            style={{
                              height: '100%',
                              minHeight: previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : '100%',
                              transform: `scale(${previewZoom / 100})`,
                              transformOrigin: 'center center',
                            }}
                          >
                            <iframe
                              srcDoc={html}
                              className="w-full h-full border-0"
                              title="Email Preview"
                              style={{
                                height: '100%',
                                minHeight: previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : '100%',
                                pointerEvents: 'auto',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'editor' ? (
                  <HTMLEditor
                    value={html}
                    onChange={(value) => setHtml(value || '')}
                    isFullscreen={isFullscreen}
                    onFullscreenChange={setIsFullscreen}
                  />
                ) : (
                  <div className="flex-1 flex flex-col h-full min-h-0">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">Preview</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-white rounded border border-gray-300 p-1">
                          <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${
                              previewMode === 'mobile'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Mobile view (375px)"
                          >
                            📱 Mobile
                          </button>
                          <button
                            onClick={() => setPreviewMode('tablet')}
                            className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${
                              previewMode === 'tablet'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Tablet view (768px)"
                          >
                            📱 Tablet
                          </button>
                          <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${
                              previewMode === 'desktop'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Desktop view (100%)"
                          >
                            💻 Desktop
                          </button>
                        </div>
                        <div className="flex items-center space-x-1 bg-white rounded border border-gray-300 p-1">
                          <button
                            onClick={() => setPreviewZoom(prev => Math.max(25, prev - 25))}
                            className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Zoom out"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                            </svg>
                          </button>
                          <span className="px-2 py-1.5 text-xs text-gray-600 font-medium min-w-[3rem] text-center">
                            {previewZoom}%
                          </span>
                          <button
                            onClick={() => setPreviewZoom(prev => Math.min(200, prev + 25))}
                            className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Zoom in"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setPreviewZoom(100)}
                            className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Reset zoom"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={handleShare}
                          disabled={creatingShareLink || !html || !html.trim()}
                          className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Share preview"
                        >
                          {creatingShareLink ? (
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-gray-100 min-h-0">
                      <div className="h-full flex items-center justify-center p-4">
                        <div
                          className={`bg-white shadow-lg transition-all duration-300 ${
                            previewMode === 'mobile' ? 'w-[375px]' :
                            previewMode === 'tablet' ? 'w-[768px]' :
                            'w-full max-w-full'
                          }`}
                          style={{
                            height: '100%',
                            minHeight: previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : '100%',
                            transform: `scale(${previewZoom / 100})`,
                            transformOrigin: 'center center',
                          }}
                        >
                          <iframe
                            srcDoc={html}
                            className="w-full h-full border-0"
                            title="Email Preview"
                            style={{
                              height: '100%',
                              minHeight: previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : '100%',
                              pointerEvents: 'auto',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Send Email Button - Fixed at center bottom */}
      <button
        onClick={() => {
          setShowSendEmailModal(true);
          setEmailSubject(`Email from ${templateName || 'Template'}`);
        }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Send Email</span>
      </button>

      {/* Send Email Side Panel */}
      {showSendEmailModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
            onClick={() => {
              setShowSendEmailModal(false);
              setRecipientSearch('');
              setExpandedRecipientFolders(new Set());
              setTemplateSearch('');
              setShowTemplateSuggestions(false);
              setShowTemplateDropdown(false);
            }}
          ></div>
          
          {/* Side Panel */}
          <div className="fixed top-0 right-0 h-full w-1/2 z-50 transform transition-transform duration-300 ease-in-out">
            <div className="bg-white h-full shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-2xl font-bold text-gray-900">Send Email</h2>
                <button
                      onClick={() => {
                        setShowSendEmailModal(false);
                        setRecipientSearch('');
                        setExpandedRecipientFolders(new Set());
                        setSelectedRecipients([]);
                        setSelectedFolders([]);
                        setTemplateSearch('');
                        setShowTemplateSuggestions(false);
                        setShowTemplateDropdown(false);
                      }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Close panel"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSendEmails} className="h-full flex flex-col">
                  {/* Template Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Template <span className="text-red-500">*</span>
                    </label>
                    <div 
                      className="relative"
                      onBlur={(e) => {
                        // Close dropdown if clicking outside
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setTimeout(() => setShowTemplateDropdown(false), 200);
                        }
                      }}
                    >
                      {/* Custom Select Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowTemplateDropdown(!showTemplateDropdown);
                          setTemplateSearch('');
                        }}
                        className={`w-full px-4 py-3 pr-10 text-left border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                          showTemplateDropdown ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'
                        } ${!selectedTemplate ? 'text-gray-500' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">
                            {selectedTemplate 
                              ? templates.find(t => t._id === selectedTemplate)?.name || 'Select a template...'
                              : 'Select a template...'}
                          </span>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${showTemplateDropdown ? 'transform rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      {showTemplateDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col">
                          {/* Search Input */}
                          <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              value={templateSearch}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setTemplateSearch(e.target.value);
                                setHighlightedTemplateIndex(-1);
                              }}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                const searchLower = templateSearch.toLowerCase();
                                const filtered = templates.filter(t => 
                                  t.name.toLowerCase().includes(searchLower) ||
                                  (t.folder || '').toLowerCase().includes(searchLower)
                                );
                                
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setHighlightedTemplateIndex(prev => 
                                    prev < filtered.length - 1 ? prev + 1 : prev
                                  );
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setHighlightedTemplateIndex(prev => prev > 0 ? prev - 1 : -1);
                                } else if (e.key === 'Enter' && highlightedTemplateIndex >= 0) {
                                  e.preventDefault();
                                  handleSelectTemplateSuggestion(filtered[highlightedTemplateIndex]);
                                }
                              }}
                              placeholder="Search templates..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                              autoFocus
                            />
                          </div>

                          {/* Template List */}
                          <div className="overflow-y-auto max-h-80">
                            {(() => {
                              const searchLower = templateSearch.toLowerCase();
                              const filteredTemplates = templates.filter(t => 
                                !templateSearch.trim() ||
                                t.name.toLowerCase().includes(searchLower) ||
                                (t.folder || '').toLowerCase().includes(searchLower)
                              );

                              // Group by folder
                              const grouped: Record<string, typeof templates> = {};
                              const rootTemplates: typeof templates = [];

                              filteredTemplates.forEach(t => {
                                const folder = (t.folder || '').trim();
                                if (folder) {
                                  if (!grouped[folder]) {
                                    grouped[folder] = [];
                                  }
                                  grouped[folder].push(t);
                                } else {
                                  rootTemplates.push(t);
                                }
                              });

                              const folderNames = Object.keys(grouped).sort();

                              if (filteredTemplates.length === 0) {
                                return (
                                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                    No templates found
                                  </div>
                                );
                              }

                              return (
                                <div>
                                  {/* Root Templates (No Folder) */}
                                  {rootTemplates.length > 0 && (
                                    <div className="py-2">
                                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        No Folder
                                      </div>
                                      {rootTemplates.map((template, index) => (
                                        <div
                                          key={template._id}
                                          onClick={() => handleSelectTemplateSuggestion(template)}
                                          onMouseEnter={() => {
                                            const globalIndex = rootTemplates.findIndex(t => t._id === template._id);
                                            setHighlightedTemplateIndex(globalIndex);
                                          }}
                                          className={`px-4 py-3 cursor-pointer transition-colors ${
                                            highlightedTemplateIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                                          } ${selectedTemplate === template._id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
                                        >
                                          <div className="flex items-center space-x-3">
                                            {selectedTemplate === template._id && (
                                              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-gray-900 truncate">
                                                {template.name}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Folders */}
                                  {folderNames.map((folderName) => {
                                    const folderTemplates = grouped[folderName];
                                    return (
                                      <div key={folderName} className="py-2 border-t border-gray-100">
                                        <div className="px-4 py-2 flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                          </svg>
                                          <span>{folderName}</span>
                                        </div>
                                        {folderTemplates.map((template) => {
                                          const globalIndex = rootTemplates.length + 
                                            folderNames.slice(0, folderNames.indexOf(folderName)).reduce((sum, f) => sum + grouped[f].length, 0) +
                                            folderTemplates.findIndex(t => t._id === template._id);
                                          
                                          return (
                                            <div
                                              key={template._id}
                                              onClick={() => handleSelectTemplateSuggestion(template)}
                                              onMouseEnter={() => setHighlightedTemplateIndex(globalIndex)}
                                              className={`px-4 py-3 cursor-pointer transition-colors ${
                                                highlightedTemplateIndex === globalIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                              } ${selectedTemplate === template._id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
                                            >
                                              <div className="flex items-center space-x-3">
                                                {selectedTemplate === template._id && (
                                                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <div className="text-sm font-medium text-gray-900 truncate">
                                                    {template.name}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedTemplate && (
                      <p className="mt-2 text-sm text-gray-500">
                        Selected: <strong>{templates.find(t => t._id === selectedTemplate)?.name}</strong>
                        {templates.find(t => t._id === selectedTemplate)?.folder && (
                          <span className="text-gray-400"> • {templates.find(t => t._id === selectedTemplate)?.folder}</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Email Subject */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter email subject"
                    />
                  </div>

                  {/* SMTP Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send From (SMTP) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSmtp}
                        onChange={(e) => setSelectedSmtp(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer hover:border-gray-400 shadow-sm"
                        required
                      >
                      <option value="">Select SMTP configuration...</option>
                      {smtpConfigs.map((smtp) => (
                        <option key={smtp._id} value={smtp._id}>
                          {smtp.isAdminSmtp ? '📧 ' : ''}{smtp.title || smtp.name || 'Default'} - {smtp.smtpFrom} {smtp.isActive && '(Active)'} {smtp.isDefault && '(Default)'}
                        </option>
                      ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Recipients Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Recipients <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Search Filter with Suggestions */}
                    <div className="mb-4 relative">
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) => {
                          setRecipientSearch(e.target.value);
                          setShowSearchSuggestions(e.target.value.trim().length > 0);
                          setHighlightedSuggestionIndex(-1);
                        }}
                        onFocus={() => {
                          if (recipientSearch.trim().length > 0) {
                            setShowSearchSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay to allow click on suggestion
                          setTimeout(() => setShowSearchSuggestions(false), 200);
                        }}
                        onKeyDown={(e) => {
                          if (!showSearchSuggestions) return;
                          
                          const searchLower = recipientSearch.toLowerCase();
                          const filteredSuggestions = recipients
                            .filter(r => 
                              r.name.toLowerCase().includes(searchLower) ||
                              r.email.toLowerCase().includes(searchLower) ||
                              (r.folder || '').toLowerCase().includes(searchLower)
                            )
                            .slice(0, 10);
                          
                          if (filteredSuggestions.length === 0) return;
                          
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setHighlightedSuggestionIndex(prev => 
                              prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                            );
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setHighlightedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
                          } else if (e.key === 'Enter' && highlightedSuggestionIndex >= 0) {
                            e.preventDefault();
                            const suggestion = filteredSuggestions[highlightedSuggestionIndex];
                            handleSelectSuggestion(suggestion);
                          } else if (e.key === 'Escape') {
                            setShowSearchSuggestions(false);
                          }
                        }}
                        placeholder="Search recipients by name or email..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      
                      {/* Search Suggestions Dropdown */}
                      {showSearchSuggestions && recipientSearch.trim().length > 0 && (() => {
                        const searchLower = recipientSearch.toLowerCase();
                        const filteredSuggestions = recipients
                          .filter(r => 
                            r.name.toLowerCase().includes(searchLower) ||
                            r.email.toLowerCase().includes(searchLower) ||
                            (r.folder || '').toLowerCase().includes(searchLower)
                          )
                          .slice(0, 10) // Limit to 10 suggestions
                          .map(r => ({
                            ...r,
                            matchType: r.name.toLowerCase().includes(searchLower) ? 'name' :
                                      r.email.toLowerCase().includes(searchLower) ? 'email' : 'folder'
                          }));

                        return filteredSuggestions.length > 0 ? (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            {filteredSuggestions.map((recipient, index) => (
                              <div
                                key={recipient._id}
                                onClick={() => handleSelectSuggestion(recipient)}
                                onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                                  highlightedSuggestionIndex === index ? 'bg-blue-50' : ''
                                } ${selectedRecipients.includes(recipient._id) ? 'bg-green-50' : ''}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      {selectedRecipients.includes(recipient._id) && (
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      <span className="text-sm font-medium text-gray-900">
                                        {recipient.name}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {recipient.email}
                                    </div>
                                    {recipient.folder && (
                                      <div className="text-xs text-gray-400 mt-0.5 flex items-center space-x-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        <span>{recipient.folder}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-2">
                                    {recipient.matchType === 'name' && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Name</span>
                                    )}
                                    {recipient.matchType === 'email' && (
                                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Email</span>
                                    )}
                                    {recipient.matchType === 'folder' && (
                                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">Folder</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Accordion-style Folder View */}
                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                      {/* Group recipients by folder */}
                      {(() => {
                        // Filter recipients based on search
                        const filteredRecipients = recipients.filter(r => {
                          if (!recipientSearch.trim()) return true;
                          const search = recipientSearch.toLowerCase();
                          return (
                            r.name.toLowerCase().includes(search) ||
                            r.email.toLowerCase().includes(search) ||
                            (r.folder || '').toLowerCase().includes(search)
                          );
                        });

                        // Group by folder
                        const grouped: Record<string, typeof recipients> = {};
                        const rootRecipients: typeof recipients = [];

                        filteredRecipients.forEach(r => {
                          // Handle empty string folders properly
                          const folder = (r.folder || '').trim();
                          if (folder) {
                            if (!grouped[folder]) {
                              grouped[folder] = [];
                            }
                            grouped[folder].push(r);
                          } else {
                            rootRecipients.push(r);
                          }
                        });

                        // Sort folders with Team Members first
                        const folderNames = Object.keys(grouped).sort((a, b) => {
                          if (a === 'Team Members') return -1;
                          if (b === 'Team Members') return 1;
                          return a.localeCompare(b);
                        });

                        return (
                          <div className="divide-y divide-gray-200">
                            {/* Root Recipients (No Folder) */}
                            {rootRecipients.length > 0 && (
                              <div className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={rootRecipients.every(r => selectedRecipients.includes(r._id))}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          const rootIds = rootRecipients.map(r => r._id);
                                          setSelectedRecipients([...selectedRecipients, ...rootIds.filter(id => !selectedRecipients.includes(id))]);
                                        } else {
                                          setSelectedRecipients(selectedRecipients.filter(id => !rootRecipients.some(r => r._id === id)));
                                        }
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">Root (No Folder)</span>
                                    <span className="text-xs text-gray-500">({rootRecipients.length})</span>
                                  </label>
                                </div>
                                <div className="ml-6 space-y-1">
                                  {rootRecipients.map((recipient) => (
                                    <label key={recipient._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                      <input
                                        type="checkbox"
                                        checked={selectedRecipients.includes(recipient._id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedRecipients([...selectedRecipients, recipient._id]);
                                          } else {
                                            setSelectedRecipients(selectedRecipients.filter(id => id !== recipient._id));
                                          }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-gray-700">{recipient.name} <span className="text-gray-500">({recipient.email})</span></span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Folders */}
                            {folderNames.map((folderName) => {
                              const folderRecipients = grouped[folderName];
                              const isExpanded = expandedRecipientFolders.has(folderName);
                              const allSelected = folderRecipients.every(r => selectedRecipients.includes(r._id));
                              const someSelected = folderRecipients.some(r => selectedRecipients.includes(r._id));

                              return (
                                <div key={folderName} className="border-b border-gray-200 last:border-b-0">
                                  {/* Folder Header */}
                                  <div
                                    className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      const newExpanded = new Set(expandedRecipientFolders);
                                      if (newExpanded.has(folderName)) {
                                        newExpanded.delete(folderName);
                                      } else {
                                        newExpanded.add(folderName);
                                      }
                                      setExpandedRecipientFolders(newExpanded);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2 flex-1">
                                        <svg
                                          className={`w-4 h-4 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        <label
                                          className="flex items-center space-x-2 cursor-pointer flex-1"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={(input) => {
                                              if (input) input.indeterminate = someSelected && !allSelected;
                                            }}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                // Select all recipients in folder
                                                const folderIds = folderRecipients.map(r => r._id);
                                                setSelectedRecipients([...selectedRecipients, ...folderIds.filter(id => !selectedRecipients.includes(id))]);
                                                // Also select folder
                                                if (!selectedFolders.includes(folderName)) {
                                                  setSelectedFolders([...selectedFolders, folderName]);
                                                }
                                              } else {
                                                // Deselect all recipients in folder
                                                setSelectedRecipients(selectedRecipients.filter(id => !folderRecipients.some(r => r._id === id)));
                                                // Deselect folder
                                                setSelectedFolders(selectedFolders.filter(f => f !== folderName));
                                              }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                          />
                                          <span className="text-sm font-semibold text-gray-700">{folderName}</span>
                                          <span className="text-xs text-gray-500">({folderRecipients.length})</span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Folder Recipients */}
                                  {isExpanded && (
                                    <div className="bg-white p-3">
                                      <div className="ml-6 space-y-1">
                                        {folderRecipients.map((recipient) => (
                                          <label key={recipient._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input
                                              type="checkbox"
                                              checked={selectedRecipients.includes(recipient._id)}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setSelectedRecipients([...selectedRecipients, recipient._id]);
                                                } else {
                                                  setSelectedRecipients(selectedRecipients.filter(id => id !== recipient._id));
                                                  // If deselecting individual, also deselect folder if it was selected
                                                  if (selectedFolders.includes(folderName)) {
                                                    setSelectedFolders(selectedFolders.filter(f => f !== folderName));
                                                  }
                                                }
                                              }}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{recipient.name} <span className="text-gray-500">({recipient.email})</span></span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Selection Summary */}
                    {(selectedRecipients.length > 0 || selectedFolders.length > 0) && (
                      <p className="mt-3 text-sm text-blue-600 font-medium">
                        Selected: {selectedRecipients.length} recipient(s) {selectedFolders.length > 0 && `+ ${selectedFolders.length} folder(s)`}
                      </p>
                    )}
                  </div>
                  
                  {/* Footer - Sticky at bottom of form */}
                  <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSendEmailModal(false);
                          setSelectedRecipients([]);
                          setSelectedFolders([]);
                          setRecipientSearch('');
                          setExpandedRecipientFolders(new Set());
                          setTemplateSearch('');
                          setShowTemplateSuggestions(false);
                          setShowTemplateDropdown(false);
                        }}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sendingEmails || !selectedSmtp || (selectedRecipients.length === 0 && selectedFolders.length === 0)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingEmails ? 'Sending...' : 'Confirm & Send'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Progress Modal - Fixed at right bottom */}
      {showProgressModal && (
        <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-80">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Sending Emails</h3>
              <button
                onClick={() => {
                  if (emailProgress.sent + emailProgress.failed >= emailProgress.total) {
                    setShowProgressModal(false);
                    setEmailProgress({ sent: 0, pending: 0, failed: 0, total: 0 });
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{emailProgress.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Sent:</span>
                <span className="font-semibold text-green-600">{emailProgress.sent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Pending:</span>
                <span className="font-semibold text-yellow-600">{emailProgress.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Failed:</span>
                <span className="font-semibold text-red-600">{emailProgress.failed}</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((emailProgress.sent + emailProgress.failed) / emailProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              {emailProgress.sent + emailProgress.failed >= emailProgress.total && (
                <p className="text-sm text-center text-green-600 font-semibold mt-2">
                  All emails processed!
                </p>
              )}
            </div>
          </div>
        </div>
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Share Preview</h2>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareUrl('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Share this link with others to let them preview your email template. Anyone with this link can view the preview.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Copy Link
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setShareUrl('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


