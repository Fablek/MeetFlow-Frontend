'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AuthService } from '@/lib/auth';
import { Availability, DayAvailability } from '@/types';
import { Clock, Save, Copy } from 'lucide-react';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  { value: 1, name: 'Monday', short: 'Mon' },
  { value: 2, name: 'Tuesday', short: 'Tue' },
  { value: 3, name: 'Wednesday', short: 'Wed' },
  { value: 4, name: 'Thursday', short: 'Thu' },
  { value: 5, name: 'Friday', short: 'Fri' },
  { value: 6, name: 'Saturday', short: 'Sat' },
  { value: 0, name: 'Sunday', short: 'Sun' },
];

const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

export default function AvailabilityPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [availability, setAvailability] = useState<DayAvailability[]>(
        DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day.value,
        dayName: day.name,
        enabled: false,
        startTime: DEFAULT_START,
        endTime: DEFAULT_END
        }))
    );

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const token = AuthService.getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data: Availability[] = await response.json();

                // Merge with existing state
                setAvailability(prev => prev.map(day => {
                    const existing = data.find(a => a.dayOfWeek === day.dayOfWeek);
                    if (existing) {
                        return {
                            ...day,
                            enabled: true,
                            startTime: existing.startTime.substring(0, 5), // "09:00:00" -> "09:00"
                            endTime: existing.endTime.substring(0, 5)
                        };
                    }
                    return day;
                }))
            }
        } catch (err) {
            toast.error('Failed to load availability');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDay = (dayOfWeek: number) => {
        setAvailability(prev => prev.map(day =>
            day.dayOfWeek === dayOfWeek
                ? { ...day, enabled: !day.enabled }
                : day
        ));
    };

    const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
        setAvailability(prev => prev.map(day => 
            day.dayOfWeek === dayOfWeek
                ? { ...day, [field]: value }
                : day
        ));
    };

    const copyToAll = (dayOfWeek: number) => {
        const sourceDay = availability.find(d => d.dayOfWeek === dayOfWeek);
        if (!sourceDay) return;

        setAvailability(prev => prev.map(day => ({
            ...day,
            startTime: sourceDay.startTime,
            endTime: sourceDay.endTime
        })));

        toast.success('Times copied to all days');
    };

    const setBusinessHours = () => {
        setAvailability(prev => prev.map(day => ({
            ...day,
            enabled: day.dayOfWeek >= 1 && day.dayOfWeek <= 5, // Mon-Fri
            startTime: '09:00',
            endTime: '17:00'
        })));
        toast.success('Set to business hours (Mon-Fri, 9am-5pm)');
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const token = AuthService.getToken();

            // Prepare data - only enabled days
            const availabilityData = availability
                .filter(day => day.enabled)
                .map(day => ({
                dayOfWeek: day.dayOfWeek,
                startTime: `${day.startTime}:00`,
                endTime: `${day.endTime}:00`
            }));

            // Validate times
            for (const day of availabilityData) {
                if (day.startTime >= day.endTime) {
                toast.error(`Invalid time range for ${DAYS_OF_WEEK.find(d => d.value === day.dayOfWeek)?.name}`);
                setSaving(false);
                return;
                }
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(availabilityData)
            });

            if (response.ok) {
                toast.success('Availability saved!', {
                    description: `Set availability for ${availabilityData.length} days`
                });
            } else {
                const error = await response.json();
                toast.error('Failed to save availability', {
                    description: error.error || 'Please try again'
                });
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Availability</h1>
                        <p className="text-gray-600 mt-2">Set your weekly working hours</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-6 flex gap-3">
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={setBusinessHours}
                        disabled={loading || saving}
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            Set Business Hours
                        </Button>
                    </div>

                    {/* Days List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>
                                Enable days and set your available hours. Times are in 24-hour format.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                        <div key={i} className="h-16 bg-gray-100 animate-pulse rounded"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {availability.map((day) => (
                                        <div
                                            key={day.dayOfWeek}
                                            className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                                                day.enabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            {/* Day Toggle */}
                                            <div className="flex items-center gap-3 w-32">
                                                <Switch
                                                    checked={day.enabled}
                                                    onCheckedChange={() => handleToggleDay(day.dayOfWeek)}
                                                    disabled={saving}
                                                />
                                                <Label className="font-medium cursor-pointer" onClick={() => handleToggleDay(day.dayOfWeek)}>
                                                    {day.dayName}
                                                </Label>
                                            </div>

                                            {/* Time Inputs */}
                                            <div className="flex-1 flex items-center gap-3">
                                                <Input
                                                    type="time"
                                                    value={day.startTime}
                                                    onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                                                    disabled={!day.enabled || saving}
                                                    className="w-32"
                                                />
                                                <span className="text-gray-500">to</span>
                                                <Input
                                                    type="time"
                                                    value={day.endTime}
                                                    onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                                                    disabled={!day.enabled || saving}
                                                    className="w-32"
                                                />
                                            </div>

                                            {/* Copy Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToAll(day.dayOfWeek)}
                                                disabled={!day.enabled || saving}
                                                title="Copy these times to all days"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="mt-6 pt-6 border-t flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={loading || saving}
                                    size="lg"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {saving ? 'Saving...' : 'Save Availability'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="mt-6 bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex gap-3">
                                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium mb-1">How it works:</p>
                                    <ul className="space-y-1 text-blue-800">
                                        <li>• Enable the days you're available</li>
                                        <li>• Set your working hours for each day</li>
                                        <li>• Use "Copy" to apply times to all days</li>
                                        <li>• Click "Save" to update your availability</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}