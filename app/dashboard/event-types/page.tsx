'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthService } from '@/lib/auth';
import { EventType } from '@/types';
import { Plus, Clock, MapPin, Edit, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function EventTypesPage() {
    const router = useRouter();
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEventTypes();
    }, []);

    const fetchEventTypes = async () => {
        try {
            const token = AuthService.getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event-types`, {
                headers: {
                'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEventTypes(data);
            } else {
                setError('Failed to load event types');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        // Confirmation toast with action buttons
        toast.warning(`Delete "${name}"?`, {
            description: 'This action cannot be undone.',
            action: {
            label: 'Delete',
            onClick: async () => {
                try {
                const token = AuthService.getToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event-types/${id}`, {
                    method: 'DELETE',
                    headers: {
                    'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setEventTypes(eventTypes.filter(et => et.id !== id));
                    toast.success('Event type deleted successfully');
                } else {
                    toast.error('Failed to delete event type');
                }
                } catch (err) {
                toast.error('Network error. Please try again.');
                }
            }
            },
            cancel: {
            label: 'Cancel',
            onClick: () => {}
            }
        });
    };

    const getPublicLink = (slug: string) => {
        const user = AuthService.getUser();
        return `${window.location.origin}/${user?.username}/${slug}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Link copied to clipboard!', {
            description: text,
            duration: 3000
        });
    };

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Event Types</h1>
                            <p className="text-gray-600 mt-2">Manage your meeting types</p>
                        </div>
                        <Link href="/dashboard/event-types/new">
                            <Button size="lg">
                                <Plus className="mr-2 h-4 w-4" />
                                New Event Type
                            </Button>
                        </Link>
                    </div>

                    {/* Error */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && eventTypes.length === 0 && (
                        <Card className="text-center py-12">
                            <CardContent>
                                <div className="text-6xl mb-4">📅</div>
                                <h3 className="text-xl font-semibold mb-2">No event types yet</h3>
                                <p className="text-gray-600 mb-6">
                                Create your first event type to start accepting bookings
                                </p>
                                <Link href="/dashboard/event-types/new">
                                <Button size="lg">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Event Type
                                </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Event Types Grid */}
                    {!loading && eventTypes.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {eventTypes.map((eventType) => (
                                <Card key={eventType.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div
                                                        className="w-4 h-4 rounded"
                                                        style={{ backgroundColor: eventType.color }}
                                                    />
                                                    <CardTitle className="text-lg">{eventType.name}</CardTitle>
                                                </div>
                                                <CardDescription className="line-clamp-2">
                                                    {eventType.description || 'No description'}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={eventType.isActive ? 'default' : 'secondary'}>
                                                {eventType.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Details */}
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{eventType.durationMinutes} minutes</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{eventType.location}</span>
                                            </div>
                                        </div>

                                        {/* Public Link */}
                                        <div className="pt-4 border-t">
                                            <div className="flex items-center gap-2 text-sm">
                                                <input
                                                type="text"
                                                value={`/${AuthService.getUser()?.username}/${eventType.slug}`}
                                                readOnly
                                                className="flex-1 px-2 py-1 bg-gray-50 border rounded text-gray-600 text-xs"
                                                />
                                                <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(getPublicLink(eventType.slug))}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4">
                                             <Link href={`/dashboard/event-types/${eventType.id}/edit`} className="flex-1">
                                                <Button variant="outline" className="w-full">
                                                <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(eventType.id, eventType.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </AppLayout>
        </ProtectedRoute>
    )
}