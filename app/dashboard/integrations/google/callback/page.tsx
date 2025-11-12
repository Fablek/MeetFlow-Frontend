'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

// Helper function to get user-friendly error messages
const getErrorMessage = (error: string) => {
  const errorMessages: Record<string, string> = {
    'access_denied': 'You denied access to your Google Calendar. To use calendar integration, please try again and grant the necessary permissions.',
    'invalid_request': 'Invalid authorization request. Please try connecting again.',
    'unauthorized_client': 'This application is not authorized. Please contact support.',
    'invalid_scope': 'Invalid permissions requested. Please contact support.',
    'server_error': 'Google server error occurred. Please try again in a few moments.',
    'temporarily_unavailable': 'Google services are temporarily unavailable. Please try again later.',
    'invalid_grant': 'Authorization expired or was revoked. Please try connecting again.',
  };
  
  return errorMessages[error] || `Authorization failed: ${error}. Please try again.`;
};

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Google Calendar...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for errors from Google OAuth
      if (error) {
        setStatus('error');
        setMessage(getErrorMessage(error));
        if (errorDescription) {
          setErrorDetails(errorDescription);
        }
        setTimeout(() => router.push('/settings/profile?tab=integrations'), 5000);
        return;
      }

      // Validate required parameters
      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from Google. Please try connecting again.');
        setTimeout(() => router.push('/settings/profile?tab=integrations'), 4000);
        return;
      }

      if (!state) {
        setStatus('error');
        setMessage('Invalid request - missing security token. This might be a security issue. Please try again.');
        setTimeout(() => router.push('/settings/profile?tab=integrations'), 4000);
        return;
      }

      // Exchange code for tokens
      try {
        setMessage('Exchanging authorization code...');
        
        const token = AuthService.getToken();
        if (!token) {
          throw new Error('You are not logged in. Please log in and try again.');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle specific HTTP errors
          if (response.status === 401) {
            throw new Error('Your session expired. Please log in again and try connecting.');
          } else if (response.status === 400) {
            throw new Error(data.error || 'Invalid authorization code. Please try connecting again.');
          } else if (response.status === 500) {
            throw new Error('Server error occurred. Please try again in a few moments.');
          } else {
            throw new Error(data.error || 'Failed to connect Google Calendar. Please try again.');
          }
        }

        // Success!
        setStatus('success');
        setMessage('Google Calendar connected successfully!');
        
        // Store flag for settings page to refresh
        localStorage.setItem('google_oauth_success', 'true');
        
        // Redirect to settings after 2 seconds
        setTimeout(() => {
          router.push('/settings/profile?tab=integrations');
        }, 2000);
      } catch (err) {
        setStatus('error');
        
        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage('An unexpected error occurred. Please try again.');
        }
        
        setTimeout(() => router.push('/settings/profile?tab=integrations'), 4000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connecting...
              </h2>
              <p className="text-gray-600">{message}</p>
              <div className="mt-6 text-sm text-gray-500">
                Please wait while we connect your Google Calendar
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Success!
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  Your bookings will now automatically sync with your Google Calendar.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Redirecting you back to settings...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connection Failed
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              
              {errorDetails && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-900 mb-1">
                        Technical Details:
                      </p>
                      <p className="text-sm text-red-800">
                        {errorDetails}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2 font-medium">
                  What you can do:
                </p>
                <ul className="text-sm text-gray-600 text-left space-y-1 list-disc list-inside">
                  <li>Try connecting again from Settings</li>
                  <li>Make sure you grant all requested permissions</li>
                  <li>Check your internet connection</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-500">
                Redirecting you back to settings...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}