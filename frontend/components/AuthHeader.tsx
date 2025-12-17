'use client';

import { useState } from 'react';
import { useAuth } from '../app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthHeaderProps {
  showProjectInfo?: {
    name: string;
    role: 'owner' | 'ProjectAdmin' | 'emailDeveloper';
  };
  projectId?: string;
  hideEmailSettings?: boolean;
  hideUsers?: boolean;
}

export default function AuthHeader({ showProjectInfo, projectId, hideEmailSettings = false, hideUsers = false }: AuthHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              PRZIO
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/projects" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              Projects
            </Link>
            {showProjectInfo && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-sm font-medium text-gray-900">{showProjectInfo.name}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  showProjectInfo.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                  showProjectInfo.role === 'ProjectAdmin' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {showProjectInfo.role === 'owner' ? 'Owner' :
                   showProjectInfo.role === 'ProjectAdmin' ? 'Project Admin' :
                   'Email Developer'}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <div className="relative">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {showSettingsDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {!hideEmailSettings && (
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowSettingsDropdown(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Email Settings</span>
                      </div>
                    </Link>
                  )}
                  {!hideUsers && showProjectInfo && (projectId || typeof window !== 'undefined') && (
                    <Link
                      href={`/projects/${projectId || (typeof window !== 'undefined' ? localStorage.getItem('selectedProjectId') : '') || ''}/users`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowSettingsDropdown(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>Users</span>
                      </div>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showSettingsDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettingsDropdown(false)}
        />
      )}
    </header>
  );
}

