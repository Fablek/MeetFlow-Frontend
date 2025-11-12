'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { User } from '@/types';

export default function SettingsProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations'>('profile');
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: ''
  });

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'integrations') {
      setActiveTab('integrations');
    }
  }, [searchParams]);

  useEffect(() => {
    const userData = AuthService.getUser();
    if (userData) {
      setUser(userData);
      setFormData({
        fullName: userData.fullName,
        username: userData.username
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const token = AuthService.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username
        }),
      });

      const data = await response.json();

      if (response.ok) {
        AuthService.setAuth(token!, data);
        setUser(data);
        setSuccess(true);
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button 
                onClick={() => setActiveTab('integrations')}
                className={`${
                  activeTab === 'integrations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Integrations
              </button>
              <button 
                disabled
                className="border-transparent text-gray-300 cursor-not-allowed whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Security (Coming Soon)
              </button>
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'profile' ? (
            <ProfileTab 
              user={user}
              formData={formData}
              loading={loading}
              success={success}
              error={error}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />
          ) : (
            <IntegrationsTab />
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

// Profile Tab Component
function ProfileTab({ user, formData, loading, success, error, handleChange, handleSubmit }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left - Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your account's profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>Profile updated successfully!</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="john-doe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers and hyphens"
                />
                <p className="text-xs text-gray-500">
                  Your public profile URL: meetflow.com/{formData.username}
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right - Account Info */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium">
                {user.profileImageUrl ? 'Google Account' : 'Email Account'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-mono text-xs break-all">{user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Integrations Tab Component
function IntegrationsTab() {
  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); 

  useEffect(() => {
    // Check if we just connected successfully
    const oauthSuccess = localStorage.getItem('google_oauth_success');
    if (oauthSuccess === 'true') {
      localStorage.removeItem('google_oauth_success');
      setShowSuccessMessage(true);
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = AuthService.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/google/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch integration status');

      const data = await response.json();
      setIntegration(data);
    } catch (err) {
      setError('Failed to load integration status');
      setIntegration({ isConnected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/google/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to get authorization URL');

      const data = await response.json();
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError('Failed to initiate Google connection');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) return;

    setDisconnecting(true);
    setError(null);

    try {
      const token = AuthService.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/google/disconnect`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to disconnect');

      setIntegration({ isConnected: false });
    } catch (err) {
      setError('Failed to disconnect Google Calendar');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* SUCCESS MESSAGE */}
      {showSuccessMessage && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Google Calendar connected successfully! Your bookings will now automatically sync.
          </AlertDescription>
        </Alert>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>Sync your bookings with Google Calendar</CardDescription>
              </div>
            </div>
            {integration?.isConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Not connected</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {integration?.isConnected ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Connection Details</h4>
                <dl className="space-y-2 text-sm">
                  {integration.email && (
                    <div className="flex justify-between">
                      <dt className="text-green-700">Account:</dt>
                      <dd className="font-medium text-green-900">{integration.email}</dd>
                    </div>
                  )}
                  {integration.calendarName && (
                    <div className="flex justify-between">
                      <dt className="text-green-700">Calendar:</dt>
                      <dd className="font-medium text-green-900">{integration.calendarName}</dd>
                    </div>
                  )}
                  {integration.connectedAt && (
                    <div className="flex justify-between">
                      <dt className="text-green-700">Connected:</dt>
                      <dd className="font-medium text-green-900">
                        {new Date(integration.connectedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  New bookings will automatically be added to your Google Calendar and guests
                  will receive calendar invites.
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect Google Calendar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Benefits</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Automatically sync bookings to your calendar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Send calendar invites to guests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Check for conflicts with existing events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Automatic reminders for meetings</span>
                  </li>
                </ul>
              </div>

              <Button onClick={handleConnect} size="lg" className="w-full sm:w-auto">
                <Calendar className="h-5 w-5 mr-2" />
                Connect Google Calendar
              </Button>

              <p className="text-xs text-gray-500">
                By connecting, you'll be redirected to Google to authorize MeetFlow to access
                your calendar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}