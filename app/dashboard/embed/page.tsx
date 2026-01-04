'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthService } from '@/lib/auth';
import { EventType } from '@/types';
import { Code, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmbedPage() {
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
    const [copied, setCopied] = useState(false);

    // Customization options
    const [buttonText, setButtonText] = useState('Book a meeting');
    const [buttonColor, setButtonColor] = useState('#006BFF');

    useEffect(() => {
        fetchEventTypes();
    }, []);

    const fetchEventTypes = async () => {
        try {
            const token = AuthService.getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event-types`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setEventTypes(data);
                if (data.length > 0) {
                    setSelectedEventType(data[0]);
                }
            }
        } catch (err) {
            toast.error('Failed to load event types');
        } finally {
            setLoading(false);
        }
    };

    const generateEmbedCode = () => {
        if (!selectedEventType) return '';

        const user = AuthService.getUser();
        const bookingUrl = `${user?.username}/${selectedEventType.slug}`;

        return `<!-- MeetFlow Booking Widget -->
<script
  src="${window.location.origin}/widget.js"
  data-url="${bookingUrl}"
  data-button-text="${buttonText}"
  data-button-color="${buttonColor}"
></script>`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        setCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <AppLayout>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </AppLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Embed Widget</h1>
                        <p className="text-muted-foreground mt-1">
                            Generate code to embed booking widget on your website
                        </p>
                    </div>

                    {eventTypes.length === 0 ? (
                        <Alert>
                            <AlertDescription>
                                You need to create an event type first before generating embed code.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left - Configuration */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Widget Configuration</CardTitle>
                                        <CardDescription>
                                            Customize how your booking widget looks
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Event Type Selector */}
                                        <div className="space-y-2">
                                            <Label>Event Type</Label>
                                            <Select
                                                value={selectedEventType?.id || ''}
                                                onValueChange={(value) => {
                                                    const et = eventTypes.find(et => et.id === value);
                                                    setSelectedEventType(et || null);
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select event type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {eventTypes.map(et => (
                                                        <SelectItem key={et.id} value={et.id}>
                                                            {et.name} ({et.durationMinutes} min)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Button Text */}
                                        <div className="space-y-2">
                                            <Label htmlFor="buttonText">Button Text</Label>
                                            <Input
                                                id="buttonText"
                                                value={buttonText}
                                                onChange={(e) => setButtonText(e.target.value)}
                                                placeholder="Book a meeting"
                                            />
                                        </div>

                                        {/* Button Color */}
                                        <div className="space-y-2">
                                            <Label htmlFor="buttonColor">Button Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="buttonColor"
                                                    type="color"
                                                    value={buttonColor}
                                                    onChange={(e) => setButtonColor(e.target.value)}
                                                    className="w-20 h-10"
                                                />
                                                <Input
                                                    type="text"
                                                    value={buttonColor}
                                                    onChange={(e) => setButtonColor(e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Generated Code */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Code className="h-5 w-5" />
                                            Embed Code
                                        </CardTitle>
                                        <CardDescription>
                                            Copy and paste this code into your website
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative">
                                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                                <code>{generateEmbedCode()}</code>
                                            </pre>
                                            <Button
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={copyToClipboard}
                                            >
                                                {copied ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right - Preview */}
                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Preview</CardTitle>
                                        <CardDescription>
                                            How the button will look on your website
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border rounded-lg p-8 bg-muted/30 min-h-[200px] flex items-center justify-center">
                                            <button
                                                style={{
                                                    backgroundColor: buttonColor,
                                                    color: 'white',
                                                    padding: '12px 24px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'opacity 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                                                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                            >
                                                {buttonText}
                                            </button>
                                        </div>

                                        <div className="mt-4 p-4 bg-accent/30 rounded-lg">
                                            <p className="text-sm font-medium mb-2">How it works:</p>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Add the code to your website</li>
                                                <li>• A button will appear on your page</li>
                                                <li>• Clicking opens a booking modal</li>
                                                <li>• Visitors can book meetings directly</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
