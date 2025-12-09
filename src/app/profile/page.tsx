'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: string;
  isBlacklisted: boolean;
  createdAt: string;
}

interface ProfileProps {
  auth: {
    token: string | null;
    role: string | null;
    isLoggedIn: boolean;
  };
}

export default function UserProfile({ auth }: ProfileProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchUserProfile();
  }, [auth.isLoggedIn, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const users = await response.json();
      const currentUserEmail = localStorage.getItem('userEmail');
      const currentUser = users.find((u: User) => u.email === currentUserEmail);

      if (currentUser) {
        setUser(currentUser);
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters');
      return;
    }

    // TODO: Implement actual password change API call
    setPasswordMessage('Password change functionality needs backend implementation');
    
    // Clear form
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center bg-white rounded-lg shadow-md">
          <div className="mb-4 text-5xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Error</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/books')}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container max-w-4xl px-4 mx-auto">
        {/* Profile Header */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center space-x-6">
            <div className="p-6 bg-blue-100 rounded-full">
              <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">{user.email}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'LIBRARIAN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'LIBRARIAN' ? '👨‍💼 Librarian' : '👤 Member'}
                </span>
                {user.isBlacklisted && (
                  <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                    ⚠️ Blacklisted
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-md">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Activity
            </button>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Account Type</label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Account Status</label>
                  <input
                    type="text"
                    value={user.isBlacklisted ? 'Blacklisted' : 'Active'}
                    disabled
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                      user.isBlacklisted ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Member Since</label>
                  <input
                    type="text"
                    value={new Date(user.createdAt).toLocaleString()}
                    disabled
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {passwordMessage && (
                    <div className={`p-3 rounded-lg ${
                      passwordMessage.includes('success') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {passwordMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Change Password
                  </button>
                </form>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Account Activity</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Account Created</p>
                        <p className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-green-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-center text-gray-600">
                      📚 Borrowing history and activity logs will be displayed here
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}