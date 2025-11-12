'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function GoogleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Connecting to Google Calendar...');

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');

            // Check for errors from Google
            if (error) {
                setStatus('error');
                setMessage(`Authorization failed: ${error}`);
                setTimeout(() => router.push('/settings/profile'), 3000);
                return;
            }

            if (!code) {
                setStatus('error');
                setMessage('No authorization code received');
                setTimeout(() => router.push('/settings/profile'), 3000);
                return;
            }

            try {
                const token = AuthService.getToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/google/callback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ code }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to connect Google Calendar');
                }

                const data = await response.json();
                
                setStatus('success');
                setMessage('Google Calendar connected successfully!');
                
                // Redirect to settings after 2 seconds
                setTimeout(() => {
                    router.push('/settings/profile?tab=integrations');
                }, 2000);
            } catch (err) {
                setStatus('error');
                setMessage(err instanceof Error ? err.message : 'Failed to connect Google Calendar');
                setTimeout(() => router.push('/settings/profile'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Connecting...
                            </h2>
                            <p className="text-gray-600">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Success!
                            </h2>
                            <p className="text-gray-600 mb-4">{message}</p>
                            <p className="text-sm text-gray-500">
                                Redirecting to settings...
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Connection Failed
                            </h2>
                            <p className="text-gray-600 mb-4">{message}</p>
                            <p className="text-sm text-gray-500">
                                Redirecting to settings...
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}