'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthService } from '@/lib/auth';
import { User } from '@/types';

export default function SettingsProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        username: ''
    });

    // Load user data
    useEffect(() => {
        const token = AuthService.getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        const userData = AuthService.getUser();
        if (userData) {
            setUser(userData);
            setFormData({
                fullName: userData.fullName,
                username: userData.username
            });
        }
    }, [router]);

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
                // Update local user data
                AuthService.setAuth(token!, data);
                setUser(user);
                setSuccess(true);

                // Refresh page after 1 second to update navbar
                setTimeout(() => {
                    window.location.reload();
                }, 1000)
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
        return (
            <AppLayout>
                <div className="min-h-screen flex items-center justify-center">Loading...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
                </div>

                {/* Tabs (for future: profile, security, notifications) */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        <button className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Profile
                        </button>
                        <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Security
                        </button>
                    </nav>
                </div>

                {/* Profile Form */}
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
            </div>
        </AppLayout>
    )
}