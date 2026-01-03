'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../../components/AuthHeader';
import Alert from '../../../components/Alert';
import Footer from '../../../components/Footer';
import { Mail, Layout, FileText, ArrowLeft, Settings, Users } from 'lucide-react';

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

export default function ProjectDetailsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
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
    const fetchProject = async () => {
      if (!token || !projectId) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProject(response.data.project);
        localStorage.setItem('selectedProjectId', projectId);
      } catch (error: any) {
        console.error('Fetch project error:', error);
        setAlert({
          isOpen: true,
          message: error.response?.data?.error || 'Failed to load project',
          type: 'error',
        });
        router.push('/projects');
      } finally {
        setLoading(false);
      }
    };

    if (token && projectId) {
      fetchProject();
    }
  }, [token, projectId, router]);

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

  if (!project) {
    return null;
  }

  const services = [
    {
      id: 'email',
      name: 'Email Services',
      description: 'Create, test, and send HTML email templates. Manage your email campaigns and track email history.',
      icon: Mail,
      href: `/tool?projectId=${projectId}`,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
    },
    {
      id: 'popup',
      name: 'Popup Builder',
      description: 'Design engaging popups with drag-and-drop editor. Create exit intent popups, scroll triggers, and more.',
      icon: Layout,
      href: `/popups?projectId=${projectId}`,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
    },
    {
      id: 'form',
      name: 'Form Builder',
      description: 'Build custom forms for lead generation, surveys, contact forms, and more. Embed forms in your popups.',
      icon: FileText,
      href: `/forms?projectId=${projectId}`,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader hideEmailSettings={true} hideUsers={true} />

      <div className="min-h-[700px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Projects
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-600 mb-4">{project.description}</p>
                )}
                <div className="flex items-center gap-4">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    project.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                    project.role === 'ProjectAdmin' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {project.role === 'owner' ? 'Owner' :
                     project.role === 'ProjectAdmin' ? 'Project Admin' :
                     'Email Developer'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {(project.role === 'owner' || project.role === 'ProjectAdmin') && (
                  <button
                    onClick={() => router.push(`/projects/${projectId}/users`)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Members
                  </button>
                )}
                <button
                  onClick={() => router.push(`/projects/${projectId}/emails`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Email History
                </button>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
                  
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className={`w-16 h-16 ${service.iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-900">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform">
                      <span>Get Started</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover effect border */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`}></div>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats or Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Project ID</p>
                  <p className="text-xs font-mono text-gray-900 break-all">{project._id}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created By</p>
                  <p className="text-sm font-medium text-gray-900">{project.createdBy.name}</p>
                  <p className="text-xs text-gray-500">{project.createdBy.email}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(project.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
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

      <Footer />
    </div>
  );
}

