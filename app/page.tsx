'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccess(true);
      setUserEmail(searchParams.get('email') || '');
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('email profile')}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle>MeetFlow - Google OAuth Test 🔐</CardTitle>
          <CardDescription>Test backend Google authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full"
          >
            🚀 Login with Google
          </Button>

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800">✅ Login Successful!</p>
              <p className="text-sm text-green-700 mt-2">Logged in as: {userEmail}</p>
              <p className="text-xs text-green-600 mt-2">Check browser console for token</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}