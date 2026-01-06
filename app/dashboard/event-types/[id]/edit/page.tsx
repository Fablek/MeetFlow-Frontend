'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AuthService } from '@/lib/auth';
import { EventType } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const LOCATION_OPTIONS = ['Online', 'In-person', 'Phone'];
const COLOR_PRESETS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export default function EditEventTypePage() {
    const router = useRouter();
    const params = useParams();
    const eventTypeId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [eventType, setEventType] = useState<EventType | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        durationMinutes: 30,
        description: '',
        location: 'Online',
        locationDetails: '',
        color: '#3b82f6',
        isActive: true,
        bufferMinutes: 0,
        minNoticeHours: 24,
        maxDaysInAdvance: 60
    });

    const fetchEventType = useCallback(async () => {
        try {
            const token = AuthService.getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event-types/${eventTypeId}`, {
                headers: {
                'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data: EventType = await response.json();
                setEventType(data);
                setFormData({
                    name: data.name,
                    slug: data.slug,
                    durationMinutes: data.durationMinutes,
                    description: data.description || '',
                    location: data.location,
                    locationDetails: data.locationDetails || '',
                    color: data.color,
                    isActive: data.isActive,
                    bufferMinutes: data.bufferMinutes,
                    minNoticeHours: data.minNoticeHours,
                    maxDaysInAdvance: data.maxDaysInAdvance
                });
            } else if (response.status === 404) {
                toast.error('Event type not found');
                router.push('/dashboard/event-types');
            } else {
                toast.error('Failed to load event type');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    }, [eventTypeId, router]);

    // Fetch event type
    useEffect(() => {
        fetchEventType();
    }, [fetchEventType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: name.includes('Minutes') || name.includes('Hours') || name.includes('Days')
            ? parseInt(value) || 0
            : value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: name === 'durationMinutes' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = AuthService.getToken();

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event-types/${eventTypeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                toast.success('Event type updated!', {
                    description: `Updated "${result.name}"`
                });
                router.push('/dashboard/event-types');
            } else {
                const error = await response.json();
                toast.error('Failed to update event type', {
                    description: error.error || 'Please try again'
                });
            }
        } catch (err) {
            toast.error('Network error', {
                description: 'Please check your connection and try again'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
        <ProtectedRoute>
            <AppLayout>
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            </AppLayout>
        </ProtectedRoute>
        );
    }

    if (!eventType) {
        return null;
    }

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/dashboard/event-types">
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Event Types
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Event Type</h1>
                        <p className="text-gray-600 mt-2">Update your meeting settings</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>The main details about your event type</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Event Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="30 Minute Meeting"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">URL Slug *</Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            placeholder="30min-meeting"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            required
                                            disabled={saving}
                                            pattern="[a-z0-9-]+"
                                            title="Only lowercase letters, numbers and hyphens"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Your public link: /{AuthService.getUser()?.username}/{formData.slug}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="A quick meeting to discuss your project"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="durationMinutes">Duration *</Label>
                                            <Select
                                                value={formData.durationMinutes.toString()}
                                                onValueChange={(value) => handleSelectChange('durationMinutes', value)}
                                                disabled={saving}
                                            >
                                                <SelectTrigger>
                                                <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                {DURATION_OPTIONS.map(duration => (
                                                    <SelectItem key={duration} value={duration.toString()}>
                                                    {duration} minutes
                                                    </SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="color">Color</Label>
                                            <div className="flex gap-2 items-center">
                                                {COLOR_PRESETS.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`w-8 h-8 rounded border-2 transition-all ${
                                                    formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                    disabled={saving}
                                                />
                                                ))}
                                                <Input
                                                    type="color"
                                                    value={formData.color}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                                    className="w-16 h-8 p-1"
                                                    disabled={saving}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Toggle */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="isActive">Active Status</Label>
                                            <p className="text-sm text-gray-500">
                                                {formData.isActive ? 'Accepting bookings' : 'Not accepting bookings'}
                                            </p>
                                        </div>
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                            disabled={saving}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Location</CardTitle>
                                    <CardDescription>Where will this meeting take place?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location Type *</Label>
                                        <Select
                                            value={formData.location}
                                            onValueChange={(value) => handleSelectChange('location', value)}
                                            disabled={saving}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LOCATION_OPTIONS.map(location => (
                                                <SelectItem key={location} value={location}>
                                                    {location}
                                                </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="locationDetails">Location Details</Label>
                                        <Input
                                            id="locationDetails"
                                            name="locationDetails"
                                            placeholder="Zoom link will be provided"
                                            value={formData.locationDetails}
                                            onChange={handleChange}
                                            disabled={saving}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Advanced Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Advanced Settings</CardTitle>
                                    <CardDescription>Fine-tune your scheduling preferences</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bufferMinutes">Buffer Time (minutes)</Label>
                                            <Input
                                                id="bufferMinutes"
                                                name="bufferMinutes"
                                                type="number"
                                                min="0"
                                                max="120"
                                                value={formData.bufferMinutes}
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                            <p className="text-xs text-gray-500">Time before/after meeting</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="minNoticeHours">Min. Notice (hours)</Label>
                                            <Input
                                                id="minNoticeHours"
                                                name="minNoticeHours"
                                                type="number"
                                                min="0"
                                                max="168"
                                                value={formData.minNoticeHours}
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                            <p className="text-xs text-gray-500">Advance booking required</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="maxDaysInAdvance">Max Days Ahead</Label>
                                            <Input
                                                id="maxDaysInAdvance"
                                                name="maxDaysInAdvance"
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={formData.maxDaysInAdvance}
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                            <p className="text-xs text-gray-500">How far can book</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <Link href="/dashboard/event-types">
                                    <Button type="button" variant="outline" disabled={saving}>
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </AppLayout>
        </ProtectedRoute>
    )
}