'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import AuthHeader from '../../../../components/AuthHeader';
import Footer from '../../../../components/Footer';

interface Recipient {
  _id: string;
  name: string;
  email: string;
  folder?: string;
  customFields?: Record<string, any>;
  createdAt: string;
}

interface CustomField {
  key: string;
  value: string;
}

export default function UsersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [checkingProject, setCheckingProject] = useState(true);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', folder: '' });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [draggedRecipient, setDraggedRecipient] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

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
        // Verify user has access to this project
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

  const fetchRecipients = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/user/recipients?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recipientsData = response.data.recipients || [];
      setRecipients(recipientsData);
      
      // Extract unique folders
      const uniqueFolders = Array.from(
        new Set(recipientsData.map((r: Recipient) => r.folder || '').filter((f: string) => f))
      ) as string[];
      
      // Debug logging
      console.log('Recipients fetched:', recipientsData.length);
      console.log('Folders found:', uniqueFolders);
      const teamMembers = recipientsData.filter((r: Recipient) => r.folder === 'Team Members');
      console.log('Team Members count:', teamMembers.length);
      
      setFolders(uniqueFolders.sort());
    } catch (error: any) {
      console.error('Error fetching recipients:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to fetch recipients' });
    } finally {
      setLoading(false);
    }
  }, [token, projectId]);

  useEffect(() => {
    if (user && token && projectId && !checkingProject) {
      fetchRecipients();
    }
  }, [user, token, projectId, checkingProject, fetchRecipients]);

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage({ type: 'error', text: 'Name and Email are required' });
      return;
    }

    try {
      setSaving(true);
      // Convert custom fields array to object
      const customFieldsObj: Record<string, any> = {};
      customFields.forEach(field => {
        if (field.key.trim() && field.value.trim()) {
          customFieldsObj[field.key.trim()] = field.value.trim();
        }
      });

      const payload = {
        ...formData,
        customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined,
        projectId: projectId || undefined,
      };

      await axios.post(
        '/api/user/recipients',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Recipient added successfully' });
      setFormData({ name: '', email: '', folder: '' });
      setCustomFields([]);
      setShowAddModal(false);
      fetchRecipients();
    } catch (error: any) {
      console.error('Error adding recipient:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add recipient' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipient = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Recipient',
      message: 'Are you sure you want to delete this recipient?',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await axios.delete(`/api/user/recipients/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessage({ type: 'success', text: 'Recipient deleted successfully' });
          fetchRecipients();
        } catch (error: any) {
          console.error('Error deleting recipient:', error);
          setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to delete recipient' });
        }
      },
    });
  };

  const handleDeleteFolder = (folderName: string) => {
    const folderRecipients = recipients.filter(r => r.folder === folderName);
    const recipientCount = folderRecipients.length;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Folder',
      message: `Are you sure you want to delete the folder "${folderName}"? This will permanently delete ${recipientCount} recipient(s) inside this folder. This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          // Delete all recipients in this folder
          await axios.delete(
            `/api/user/recipients/folder/${folderName}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMessage({ type: 'success', text: `Folder "${folderName}" and ${recipientCount} recipient(s) deleted successfully` });
          fetchRecipients();
        } catch (error: any) {
          console.error('Error deleting folder:', error);
          setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to delete folder' });
        }
      },
    });
  };

  const handleDragStart = (recipientId: string) => {
    setDraggedRecipient(recipientId);
  };

  const handleDragOver = (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    setDragOverFolder(folderName);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    if (!draggedRecipient) return;

    try {
      await axios.put(
        `/api/user/recipients/${draggedRecipient}/folder`,
        { folder: targetFolder || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Recipient moved successfully' });
      fetchRecipients();
    } catch (error: any) {
      console.error('Error moving recipient:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to move recipient' });
    } finally {
      setDraggedRecipient(null);
      setDragOverFolder(null);
    }
  };

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setMessage({ type: 'error', text: 'Folder name is required' });
      return;
    }

    if (folders.includes(newFolderName.trim())) {
      setMessage({ type: 'error', text: 'Folder already exists' });
      return;
    }

    setFolders([...folders, newFolderName.trim()].sort());
    setNewFolderName('');
    setShowNewFolderInput(false);
    setMessage({ type: 'success', text: 'Folder created successfully' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (selectedFolder) {
        formData.append('folder', selectedFolder);
      }
      if (projectId) {
        formData.append('projectId', projectId);
      }

      const response = await axios.post(
        '/api/user/recipients/upload-excel',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage({
        type: 'success',
        text: `Successfully imported ${response.data.added} recipient(s). ${response.data.errors.length > 0 ? `${response.data.errors.length} error(s) occurred.` : ''}`,
      });
      setFile(null);
      setSelectedFolder('');
      setShowUploadModal(false);
      fetchRecipients();
    } catch (error: any) {
      console.error('Error uploading Excel:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to upload Excel file' });
    } finally {
      setUploading(false);
    }
  };

  // Group recipients by folder
  const { groupedRecipients, rootRecipients, folderOrder } = useMemo(() => {
    const grouped: Record<string, Recipient[]> = {};
    const root: Recipient[] = [];

    recipients.forEach(recipient => {
      // Check if folder exists and is not empty string
      const folder = (recipient.folder || '').trim();
      if (folder) {
        if (!grouped[folder]) {
          grouped[folder] = [];
        }
        grouped[folder].push(recipient);
      } else {
        root.push(recipient);
      }
    });

    // Ensure Team Members folder appears first if it exists
    const sortedFolders = Object.keys(grouped).sort((a, b) => {
      if (a === 'Team Members') return -1;
      if (b === 'Team Members') return 1;
      return a.localeCompare(b);
    });

    return {
      groupedRecipients: grouped,
      rootRecipients: root,
      folderOrder: sortedFolders,
    };
  }, [recipients]);

  if (authLoading || loading || checkingProject) {
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

        {/* Actions */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add Recipient
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📤 Upload Excel
          </button>
          {!showNewFolderInput ? (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Folder
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  } else if (e.key === 'Escape') {
                    setShowNewFolderInput(false);
                    setNewFolderName('');
                  }
                }}
                placeholder="Folder name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Recipients List with Folders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recipients ({recipients.length})
            </h2>
          </div>
          {recipients.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recipients</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new recipient.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Root Recipients (No Folder) */}
              {rootRecipients.length > 0 && (
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Root</h3>
                    <span className="text-xs text-gray-500">{rootRecipients.length} recipient(s)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Custom Fields</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rootRecipients.map((recipient) => (
                          <tr
                            key={recipient._id}
                            draggable
                            onDragStart={() => handleDragStart(recipient._id)}
                            className="hover:bg-gray-50 cursor-move"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{recipient.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{recipient.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {recipient.customFields && Object.keys(recipient.customFields).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(recipient.customFields).map(([key, value]) => (
                                    <span key={key} className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs">
                                      <span className="font-medium">{key}:</span>
                                      <span className="ml-1">{String(value)}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-xs">No custom fields</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(recipient.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              {recipient.folder !== 'Team Members' && (
                                <button onClick={() => handleDeleteRecipient(recipient._id)} className="text-red-600 hover:text-red-900">Delete</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Folders */}
              {folderOrder.map((folderName) => {
                const folderRecipients = groupedRecipients[folderName] || [];
                const isExpanded = expandedFolders.has(folderName);
                const isDraggedOver = dragOverFolder === folderName;

                return (
                  <div
                    key={folderName}
                    className={`border-b border-gray-200 ${isDraggedOver ? 'bg-blue-50' : ''}`}
                    onDragOver={(e) => handleDragOver(e, folderName)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folderName)}
                  >
                    <div
                      className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      onClick={() => toggleFolder(folderName)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg
                            className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <h3 className="text-sm font-semibold text-gray-900">{folderName}</h3>
                          <span className="text-xs text-gray-500">({folderRecipients.length})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {folderName !== 'Team Members' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folderName);
                              }}
                              className="text-red-600 hover:text-red-800 text-xs"
                              title="Delete folder"
                            >
                              Delete Folder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="p-4">
                        {folderRecipients.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-sm">This folder is empty</p>
                            <p className="text-xs text-gray-400 mt-1">Add recipients to this folder or drag existing ones here</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Custom Fields</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {folderRecipients.map((recipient) => (
                                <tr
                                  key={recipient._id}
                                  draggable
                                  onDragStart={() => handleDragStart(recipient._id)}
                                  className="hover:bg-gray-50 cursor-move"
                                >
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{recipient.name}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{recipient.email}</td>
                                  <td className="px-4 py-3 text-sm text-gray-500">
                                    {recipient.customFields && Object.keys(recipient.customFields).length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {Object.entries(recipient.customFields).map(([key, value]) => (
                                          <span key={key} className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs">
                                            <span className="font-medium">{key}:</span>
                                            <span className="ml-1">{String(value)}</span>
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic text-xs">No custom fields</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(recipient.createdAt).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                    {folderName !== 'Team Members' && (
                                      <button onClick={() => handleDeleteRecipient(recipient._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Recipient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Recipient</h2>
            <form onSubmit={handleAddRecipient}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-2">
                  Folder
                </label>
                <select
                  id="folder"
                  value={formData.folder}
                  onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">None</option>
                  {folders.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Custom Fields</label>
                  <button
                    type="button"
                    onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    + Add Field
                  </button>
                </div>
                {customFields.map((field, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Key"
                      value={field.key}
                      onChange={(e) => {
                        const newFields = [...customFields];
                        newFields[index].key = e.target.value;
                        setCustomFields(newFields);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) => {
                        const newFields = [...customFields];
                        newFields[index].value = e.target.value;
                        setCustomFields(newFields);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                      className="px-3 py-2 text-red-600 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Recipient'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', email: '', folder: '' });
                    setCustomFields([]);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Excel Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Upload Excel File</h2>
            <form onSubmit={handleUploadExcel}>
              <div className="mb-4">
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="uploadFolder" className="block text-sm font-medium text-gray-700 mb-2">
                  Folder (Optional)
                </label>
                <select
                  id="uploadFolder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">None</option>
                  {folders.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setFile(null);
                    setSelectedFolder('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      <Footer />
    </div>
  );
}

