'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ConfirmDialog from '../../components/ConfirmDialog';
import Alert from '../../components/Alert';
import Footer from '../../components/Footer';
import AuthHeader from '../../components/AuthHeader';

const API_URL = '/api';

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  role: 'owner' | 'ProjectAdmin' | 'emailDeveloper';
  createdAt: string;
  updatedAt: string;
}

interface ProjectMember {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  role: 'emailDeveloper' | 'ProjectAdmin' | 'owner';
  addedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function ProjectsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ email: '', role: 'emailDeveloper' as 'emailDeveloper' | 'ProjectAdmin' });
  const [addingMember, setAddingMember] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning' as 'warning' | 'danger' | 'info',
    onConfirm: () => {},
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

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data.projects);
    } catch (error: any) {
      console.error('Fetch projects error:', error);
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to load projects',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token, fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      setAlert({
        isOpen: true,
        message: 'Project name is required',
        type: 'error',
      });
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(
        `${API_URL}/projects`,
        newProject,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects([response.data.project, ...projects]);
      setNewProject({ name: '', description: '' });
      setShowCreateModal(false);
      setAlert({
        isOpen: true,
        message: 'Project created successfully',
        type: 'success',
      });
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to create project',
        type: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleOpenProject = (project: Project) => {
    // Store project in localStorage and redirect to tool
    localStorage.setItem('selectedProjectId', project._id);
    router.push(`/tool?projectId=${project._id}`);
  };

  const handleViewMembers = async (project: Project) => {
    setSelectedProject(project);
    setLoadingMembers(true);
    try {
      const response = await axios.get(
        `${API_URL}/projects/${project._id}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(response.data.members);
      setShowMembersModal(true);
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to load members',
        type: 'error',
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (!newMember.email || !newMember.email.trim()) {
      setAlert({
        isOpen: true,
        message: 'User email is required',
        type: 'error',
      });
      return;
    }

    setAddingMember(true);
    try {
      const response = await axios.post(
        `${API_URL}/projects/${selectedProject._id}/members`,
        {
          userEmail: newMember.email.trim(),
          role: newMember.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.isPending) {
        // Invitation sent to unregistered user
        setNewMember({ email: '', role: 'emailDeveloper' });
        setShowAddMemberModal(false);
        setAlert({
          isOpen: true,
          message: `Invitation sent successfully! ${newMember.email.trim()} will be added to the project once they sign up on PRZIO.`,
          type: 'success',
        });
      } else {
        // User already exists, added as member
        setMembers([...members, response.data.member]);
        setNewMember({ email: '', role: 'emailDeveloper' });
        setShowAddMemberModal(false);
        setAlert({
          isOpen: true,
          message: 'Member added successfully',
          type: 'success',
        });
      }
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to add member',
        type: 'error',
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleDeleteMember = (member: ProjectMember) => {
    if (!selectedProject) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Remove Member',
      message: `Are you sure you want to remove ${member.userId.name} from this project?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await axios.delete(
            `${API_URL}/projects/${selectedProject._id}/members/${member._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMembers(members.filter(m => m._id !== member._id));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setAlert({
            isOpen: true,
            message: 'Member removed successfully',
            type: 'success',
          });
        } catch (error: any) {
          setAlert({
            isOpen: true,
            message: error.response?.data?.error || 'Failed to remove member',
            type: 'error',
          });
        }
      },
    });
  };

  const handleUpdateMemberRole = async (member: ProjectMember, newRole: 'emailDeveloper' | 'ProjectAdmin') => {
    if (!selectedProject) return;

    try {
      const response = await axios.put(
        `${API_URL}/projects/${selectedProject._id}/members/${member._id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(members.map(m => m._id === member._id ? response.data.member : m));
      setAlert({
        isOpen: true,
        message: 'Member role updated successfully',
        type: 'success',
      });
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to update member role',
        type: 'error',
      });
    }
  };

  const handleDeleteProject = (project: Project) => {
    if (project.role !== 'owner') {
      setAlert({
        isOpen: true,
        message: 'Only project owner can delete the project',
        type: 'error',
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(
            `${API_URL}/projects/${project._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProjects(projects.filter(p => p._id !== project._id));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setAlert({
            isOpen: true,
            message: 'Project deleted successfully',
            type: 'success',
          });
        } catch (error: any) {
          setAlert({
            isOpen: true,
            message: error.response?.data?.error || 'Failed to delete project',
            type: 'error',
          });
        }
      },
    });
  };

  const canManageMembers = (project: Project) => {
    return project.role === 'owner' || project.role === 'ProjectAdmin';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader hideEmailSettings={true} hideUsers={true} />

      <div className="min-h-[700px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-6">
          {/* Create Project Tile - Always shown first */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300 rounded-xl p-8 hover:border-indigo-500 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center text-center w-[280px]"
          >
            <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Create Project</h3>
            <p className="text-sm text-gray-500 mb-2">New Project</p>
            <p className="text-xs text-gray-600 max-w-[180px]">Start a new project to organize your email templates and collaborate with your team</p>
          </button>

          {/* Existing Projects */}
          {projects.map((project) => (
            <div
              key={project._id}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 w-[280px]"
            >
              {/* Folder-like design with tab */}
              <div className="absolute top-0 left-0 w-12 h-3 bg-gray-300 rounded-tl-xl"></div>
              
              <div className="p-6 pt-8">
                {/* Project Icon/Folder */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  {project.role === 'owner' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project);
                      }}
                      className="text-red-600 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete project"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Project Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
                  )}
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    project.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                    project.role === 'ProjectAdmin' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {project.role === 'owner' ? 'Owner' :
                     project.role === 'ProjectAdmin' ? 'Project Admin' :
                     'Email Developer'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenProject(project)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                  >
                    Open
                  </button>
                  {canManageMembers(project) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMembers(project);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      title="Manage members"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
            </div>
            <form onSubmit={handleCreateProject} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  rows={3}
                  placeholder="Enter project description (optional)"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProject({ name: '', description: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Project Members - {selectedProject.name}</h2>
              <button
                onClick={() => {
                  setShowMembersModal(false);
                  setSelectedProject(null);
                  setMembers([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              {canManageMembers(selectedProject) && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  + Add Member
                </button>
              )}
              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member._id || member.userId._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{member.userId.name}</p>
                        <p className="text-sm text-gray-600">{member.userId.email}</p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                          member.role === 'ProjectAdmin' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {member.role === 'owner' ? 'Owner' :
                           member.role === 'ProjectAdmin' ? 'Project Admin' :
                           'Email Developer'}
                        </span>
                      </div>
                      {canManageMembers(selectedProject) && member.role !== 'owner' && (
                        <div className="flex items-center space-x-2">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateMemberRole(member, e.target.value as 'emailDeveloper' | 'ProjectAdmin')}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          >
                            <option value="emailDeveloper">Email Developer</option>
                            <option value="ProjectAdmin">Project Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteMember(member)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Remove member"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Member</h2>
            </div>
            <form onSubmit={handleAddMember} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Email *
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as 'emailDeveloper' | 'ProjectAdmin' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="emailDeveloper">Email Developer</option>
                  <option value="ProjectAdmin">Project Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setNewMember({ email: '', role: 'emailDeveloper' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {addingMember ? 'Adding...' : 'Add'}
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

      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      <Footer />
    </div>
  );
}

