'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

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
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', folder: '' });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  useEffect(() => {
    if (user && token) {
      fetchRecipients();
    }
  }, [user, token]);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/recipients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recipientsData = response.data.recipients || [];
      setRecipients(recipientsData);
      
      // Extract unique folders
      const uniqueFolders = Array.from(
        new Set(recipientsData.map((r: Recipient) => r.folder || '').filter((f: string) => f))
      ) as string[];
      setFolders(uniqueFolders.sort());
    } catch (error: any) {
      console.error('Error fetching recipients:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to fetch recipients' });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomFields(updated);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      const newFolders = [...folders, newFolderName.trim()].sort();
      setFolders(newFolders);
      setExpandedFolders(new Set([...expandedFolders, newFolderName.trim()])); // Auto-expand new folder
      setNewFolderName('');
      setShowNewFolderInput(false);
      setMessage({ type: 'success', text: `Folder "${newFolderName.trim()}" created successfully` });
    } else if (folders.includes(newFolderName.trim())) {
      setMessage({ type: 'error', text: 'Folder already exists' });
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    // Count recipients in this folder
    const folderRecipients = groupedRecipients[folderName] || [];
    const recipientCount = folderRecipients.length;
    
    if (!confirm(`Are you sure you want to delete the folder "${folderName}"? This will permanently delete ${recipientCount} recipient(s) inside this folder. This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete all recipients in this folder
      await axios.delete(
        `/api/user/recipients/folder/${encodeURIComponent(folderName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFolders(folders.filter(f => f !== folderName));
      fetchRecipients();
      setMessage({ type: 'success', text: `Folder "${folderName}" and ${recipientCount} recipient(s) deleted successfully` });
    } catch (error: any) {
      console.error('Error deleting folder:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to delete folder' });
    }
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

  // Group recipients by folder
  const groupedRecipients: Record<string, Recipient[]> = {};
  const rootRecipients: Recipient[] = [];

  recipients.forEach(recipient => {
    if (recipient.folder && recipient.folder.trim()) {
      if (!groupedRecipients[recipient.folder]) {
        groupedRecipients[recipient.folder] = [];
      }
      groupedRecipients[recipient.folder].push(recipient);
    } else {
      rootRecipients.push(recipient);
    }
  });

  // Show all folders, even if empty
  const folderOrder = folders;

  const handleDeleteRecipient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipient?')) {
      return;
    }

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
  };

  const handleDownloadSample = async () => {
    try {
      const response = await axios.get('/api/user/recipients/sample-excel', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample-recipients.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage({ type: 'success', text: 'Sample Excel file downloaded' });
    } catch (error: any) {
      console.error('Error downloading sample:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to download sample file' });
    }
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/tool"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Tool
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Manage Recipients</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add User</span>
          </button>
          <button
            onClick={() => setShowNewFolderInput(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>New Folder</span>
          </button>
          {showNewFolderInput && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="Folder name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          <button
            onClick={handleDownloadSample}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Sample Excel</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Excel</span>
          </button>
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
                              <button onClick={() => handleDeleteRecipient(recipient._id)} className="text-red-600 hover:text-red-900">Delete</button>
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
                                    <button onClick={() => handleDeleteRecipient(recipient._id)} className="text-red-600 hover:text-red-900">Delete</button>
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

      {/* Add User Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowAddModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Recipient</h2>
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
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Enter name"
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
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Enter email"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-2">
                    Folder (Optional)
                  </label>
                  <div className="relative">
                    <select
                      id="folder"
                      value={formData.folder}
                      onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:border-gray-400 shadow-sm"
                    >
                      <option value="">Root (No Folder)</option>
                      {folders.map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
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

                {/* Custom Fields Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Custom Fields
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Field</span>
                    </button>
                  </div>
                  {customFields.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No custom fields added</p>
                  ) : (
                    <div className="space-y-2">
                      {customFields.map((field, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={field.key}
                            onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                            placeholder="Field name (e.g., Phone, Company)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                          />
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                            placeholder="Value"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove field"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setCustomFields([]);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Adding...' : 'Add Recipient'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Upload Excel Modal */}
      {showUploadModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowUploadModal(false);
              setFile(null);
              setSelectedFolder('');
            }}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Excel File</h2>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    File must contain columns: <strong>Name</strong> and <strong>Email</strong> (required).<br />
                    Additional columns will be saved as custom fields.
                  </p>
                </div>
                <div className="mb-4">
                  <label htmlFor="uploadFolder" className="block text-sm font-medium text-gray-700 mb-2">
                    Folder (Optional)
                  </label>
                  <div className="relative">
                    <select
                      id="uploadFolder"
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:border-gray-400 shadow-sm"
                    >
                      <option value="">Root (No Folder)</option>
                      {folders.map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
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
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setFile(null);
                      setSelectedFolder('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !file}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

