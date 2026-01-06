'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from '@/lib/auth';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Google OAuth error: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      return;
    }

    sendCodeToBackend(code);
  }, [searchParams]);

  const sendCodeToBackend = async (code: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirectUri: `${window.location.origin}/auth/callback`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Login successful!');
        
        // Zapisz token i user
        AuthService.setAuth(data.token, data.user);

        // Przekieruj na dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please try again.';
      setMessage(errorMessage);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'loading' && '⏳ Processing...'}
            {status === 'success' && '✅ Success!'}
            {status === 'error' && '❌ Error'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-700">{message}</p>
          {status === 'success' && (
            <p className="text-sm text-center text-gray-500 mt-4">
              Redirecting to dashboard...
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}