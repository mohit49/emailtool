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
import { Mail, Layout, FileText, TrendingUp, Clock, Users, Activity } from 'lucide-react';

const API_URL = '/api';

interface Project {
  _id: string;
  name: string;
  description?: string;
  projectType?: 'email' | 'popup';
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

interface ProjectStats {
  projectId: string;
  emailsSent: number;
  emailsPending: number;
  popupsCreated: number;
  popupsActivated: number;
  formsCreated: number;
  recentActivity: Array<{
    type: 'email' | 'popup' | 'form' | 'member';
    message: string;
    timestamp: string;
  }>;
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
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});
  const [loadingStats, setLoadingStats] = useState(false);

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

  const fetchProjectStats = useCallback(async (projectId: string) => {
    if (!token) return;

    try {
      // Fetch email stats
      const emailResponse = await axios.get(`${API_URL}/projects/${projectId}/emails?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch popup activities
      const popupResponse = await axios.get(`${API_URL}/popup-activities?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch recent email history
      const recentEmails = emailResponse.data.emailHistory || [];
      const emailStats = emailResponse.data.stats || { sent: 0, pending: 0, failed: 0, success: 0 };
      
      const popups = popupResponse.data.activities || [];
      const activatedPopups = popups.filter((p: any) => p.status === 'activated').length;

      // Build recent activity
      const activities: ProjectStats['recentActivity'] = [];
      
      // Add recent email activities
      recentEmails.slice(0, 3).forEach((email: any) => {
        activities.push({
          type: 'email',
          message: `Email ${email.status === 'sent' || email.status === 'success' ? 'sent' : email.status} to ${email.recipients?.length || 0} recipient(s)`,
          timestamp: email.createdAt || email.sentAt,
        });
      });

      // Add recent popup activities
      popups.slice(0, 2).forEach((popup: any) => {
        activities.push({
          type: 'popup',
          message: `Popup "${popup.name}" ${popup.status === 'activated' ? 'activated' : 'created'}`,
          timestamp: popup.createdAt || popup.updatedAt,
        });
      });

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setProjectStats((prev) => ({
        ...prev,
        [projectId]: {
          projectId,
          emailsSent: emailStats.sent || emailStats.success || 0,
          emailsPending: emailStats.pending || 0,
          popupsCreated: popups.length,
          popupsActivated: activatedPopups,
          formsCreated: 0, // TODO: Add forms API when available
          recentActivity: activities.slice(0, 5),
        },
      }));
    } catch (error) {
      console.error('Error fetching project stats:', error);
      // Set default stats on error
      setProjectStats((prev) => ({
        ...prev,
        [projectId]: {
          projectId,
          emailsSent: 0,
          emailsPending: 0,
          popupsCreated: 0,
          popupsActivated: 0,
          formsCreated: 0,
          recentActivity: [],
        },
      }));
    }
  }, [token]);

  useEffect(() => {
    if (projects.length > 0 && token) {
      setLoadingStats(true);
      Promise.all(projects.map((project) => fetchProjectStats(project._id)))
        .finally(() => setLoadingStats(false));
    }
  }, [projects, token, fetchProjectStats]);

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
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
      setAlert({
        isOpen: true,
        message: 'Project created successfully',
        type: 'success',
      });
      // Redirect to project details page
      router.push(`/projects/${response.data.project._id}`);
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
    // Redirect to project details page
    router.push(`/projects/${project._id}`);
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
          {/* Info Message Section */}
          <div className="mb-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-indigo-200/50 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  Create Your First Project
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Get started by creating a new project to organize your email templates, popups, and forms. 
                  Projects help you manage your campaigns, collaborate with team members, and track performance metrics. 
                  Click the &quot;Create Project&quot; button below to begin organizing your work and start building amazing email campaigns, engaging popups, and powerful forms.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    <Mail className="w-3 h-3 mr-1" />
                    Email Templates
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    <Layout className="w-3 h-3 mr-1" />
                    Popup Builder
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                    <FileText className="w-3 h-3 mr-1" />
                    Form Builder
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <Users className="w-3 h-3 mr-1" />
                    Team Collaboration
                  </span>
                </div>
              </div>
            </div>
          </div>

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

          {/* Stats and Activity Cards */}
          {projects.length > 0 && (
            <div className="mt-16 w-full">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Project Statistics & Recent Activity</h2>
              <div className="grid grid-cols-1 gap-6">
                {projects.map((project, index) => {
                  const stats = projectStats[project._id];
                  const isLoading = !stats && loadingStats;

                  // Different gradients for each card
                  const gradients = [
                    { bg: 'from-slate-900 via-purple-900 to-slate-800', border: 'border-purple-500/20', hoverBorder: 'hover:border-purple-500/40', icon: 'from-purple-500 to-pink-500' },
                    { bg: 'from-slate-900 via-blue-900 to-slate-800', border: 'border-blue-500/20', hoverBorder: 'hover:border-blue-500/40', icon: 'from-blue-500 to-cyan-500' },
                    { bg: 'from-slate-900 via-indigo-900 to-slate-800', border: 'border-indigo-500/20', hoverBorder: 'hover:border-indigo-500/40', icon: 'from-indigo-500 to-purple-500' },
                    { bg: 'from-slate-900 via-pink-900 to-slate-800', border: 'border-pink-500/20', hoverBorder: 'hover:border-pink-500/40', icon: 'from-pink-500 to-rose-500' },
                    { bg: 'from-slate-900 via-emerald-900 to-slate-800', border: 'border-emerald-500/20', hoverBorder: 'hover:border-emerald-500/40', icon: 'from-emerald-500 to-teal-500' },
                    { bg: 'from-slate-900 via-orange-900 to-slate-800', border: 'border-orange-500/20', hoverBorder: 'hover:border-orange-500/40', icon: 'from-orange-500 to-red-500' },
                    { bg: 'from-slate-900 via-cyan-900 to-slate-800', border: 'border-cyan-500/20', hoverBorder: 'hover:border-cyan-500/40', icon: 'from-cyan-500 to-blue-500' },
                    { bg: 'from-slate-900 via-violet-900 to-slate-800', border: 'border-violet-500/20', hoverBorder: 'hover:border-violet-500/40', icon: 'from-violet-500 to-purple-500' },
                  ];

                  const gradient = gradients[index % gradients.length];

                  return (
                    <div
                      key={project._id}
                      className={`bg-gradient-to-br ${gradient.bg} rounded-2xl p-6 shadow-2xl border ${gradient.border} ${gradient.hoverBorder} transition-all duration-300`}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Section - Project Header & Stats */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white truncate">{project.name}</h3>
                            <div className={`w-10 h-10 bg-gradient-to-br ${gradient.icon} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Activity className="w-5 h-5 text-white" />
                            </div>
                          </div>

                          {isLoading ? (
                            <div className="text-center py-8">
                              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${gradient.border.replace('border-', 'border-').replace('/20', '-400')} mx-auto`}></div>
                              <p className={`mt-2 text-sm ${gradient.border.includes('purple') ? 'text-purple-300' : gradient.border.includes('blue') ? 'text-blue-300' : gradient.border.includes('indigo') ? 'text-indigo-300' : gradient.border.includes('pink') ? 'text-pink-300' : gradient.border.includes('emerald') ? 'text-emerald-300' : gradient.border.includes('orange') ? 'text-orange-300' : gradient.border.includes('cyan') ? 'text-cyan-300' : 'text-violet-300'}`}>Loading stats...</p>
                            </div>
                          ) : (
                            <>
                              {/* Stats Grid - Horizontal Layout */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <Link
                                  href={`/projects/${project._id}/emails`}
                                  className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-4 border border-blue-500/30 hover:border-blue-500/60 hover:from-blue-600/30 hover:to-blue-800/30 transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Mail className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs text-blue-300 font-medium">Emails Sent</span>
                                  </div>
                                  <p className="text-2xl font-bold text-white">{stats?.emailsSent || 0}</p>
                                  <p className="text-xs text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View →</p>
                                </Link>

                                <Link
                                  href={`/popups?projectId=${project._id}`}
                                  className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/60 hover:from-purple-600/30 hover:to-purple-800/30 transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Layout className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs text-purple-300 font-medium">Popups</span>
                                  </div>
                                  <p className="text-2xl font-bold text-white">{stats?.popupsCreated || 0}</p>
                                  <p className="text-xs text-purple-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View →</p>
                                </Link>

                                <Link
                                  href={`/forms?projectId=${project._id}`}
                                  className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 rounded-xl p-4 border border-pink-500/30 hover:border-pink-500/60 hover:from-pink-600/30 hover:to-pink-800/30 transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center space-x-2 mb-2">
                                    <FileText className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs text-pink-300 font-medium">Forms</span>
                                  </div>
                                  <p className="text-2xl font-bold text-white">{stats?.formsCreated || 0}</p>
                                  <p className="text-xs text-pink-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View →</p>
                                </Link>

                                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-4 border border-green-500/30">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-green-300 font-medium">Active</span>
                                  </div>
                                  <p className="text-2xl font-bold text-white">{stats?.popupsActivated || 0}</p>
                                </div>
                              </div>

                              {/* Quick Access Links */}
                              <div className="flex flex-wrap gap-3 mb-6">
                                <Link
                                  href={`/projects/${project._id}`}
                                  className="px-4 py-2 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 rounded-lg text-sm font-medium text-white hover:from-indigo-600/50 hover:to-purple-600/50 hover:border-indigo-500/60 transition-all"
                                >
                                  Project Dashboard
                                </Link>
                                <Link
                                  href={`/projects/${project._id}/emails`}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600/30 to-blue-800/30 border border-blue-500/40 rounded-lg text-sm font-medium text-white hover:from-blue-600/50 hover:to-blue-800/50 hover:border-blue-500/60 transition-all"
                                >
                                  Email History
                                </Link>
                                <Link
                                  href={`/popups?projectId=${project._id}`}
                                  className="px-4 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/40 rounded-lg text-sm font-medium text-white hover:from-purple-600/50 hover:to-pink-600/50 hover:border-purple-500/60 transition-all"
                                >
                                  Popups
                                </Link>
                                <Link
                                  href={`/tool?projectId=${project._id}`}
                                  className="px-4 py-2 bg-gradient-to-r from-orange-600/30 to-red-600/30 border border-orange-500/40 rounded-lg text-sm font-medium text-white hover:from-orange-600/50 hover:to-red-600/50 hover:border-orange-500/60 transition-all"
                                >
                                  Email Editor
                                </Link>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Right Section - Recent Activity */}
                        <div className="md:w-80 flex-shrink-0">
                          <div className="flex items-center space-x-2 mb-4">
                            <Clock className={`w-4 h-4 ${gradient.border.includes('purple') ? 'text-purple-400' : gradient.border.includes('blue') ? 'text-blue-400' : gradient.border.includes('indigo') ? 'text-indigo-400' : gradient.border.includes('pink') ? 'text-pink-400' : gradient.border.includes('emerald') ? 'text-emerald-400' : gradient.border.includes('orange') ? 'text-orange-400' : gradient.border.includes('cyan') ? 'text-cyan-400' : 'text-violet-400'}`} />
                            <h4 className={`text-sm font-semibold ${gradient.border.includes('purple') ? 'text-purple-300' : gradient.border.includes('blue') ? 'text-blue-300' : gradient.border.includes('indigo') ? 'text-indigo-300' : gradient.border.includes('pink') ? 'text-pink-300' : gradient.border.includes('emerald') ? 'text-emerald-300' : gradient.border.includes('orange') ? 'text-orange-300' : gradient.border.includes('cyan') ? 'text-cyan-300' : 'text-violet-300'}`}>Recent Activity</h4>
                          </div>
                          <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                              stats.recentActivity.map((activity, idx) => (
                                <div
                                  key={idx}
                                  className="bg-black/30 rounded-lg p-3 border border-purple-500/10 hover:border-purple-500/30 transition-colors"
                                >
                                  <div className="flex items-start space-x-2">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                      activity.type === 'email' ? 'bg-blue-400' :
                                      activity.type === 'popup' ? 'bg-purple-400' :
                                      activity.type === 'form' ? 'bg-pink-400' :
                                      'bg-green-400'
                                    }`}></div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-300 leading-relaxed">{activity.message}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-sm text-gray-400">No recent activity</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

