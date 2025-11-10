'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format, addDays, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, MapPin, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { DayAvailability, AvailableSlot, CreateBookingRequest, BookingConfirmation } from '@/types/booking';

export default function BookingPage() {
    const params = useParams();
    const username = params.username as string;
    const slug = params.slug as string;

    const [step, setStep] = useState<'date' | 'time' | 'details' | 'confirmed'>('date');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [availability, setAvailability] = useState<DayAvailability | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

    const [formData, setFormData] = useState({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        notes: ''
    });

    // Fetch availability when date is selected
    useEffect(() => {
        if (selectedDate) {
            fetchAvailability(selectedDate);
        }
    }, [selectedDate]);

    const fetchAvailability = async (date: Date) => {
        setLoading(true);
        setError(null);

        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/public/${username}/${slug}/availability?date=${dateStr}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Event type not found');
                } else {
                    setError('Failed to load availability');
                }
                setAvailability(null);
                return;
            }

            const data: DayAvailability = await response.json();
            setAvailability(data);

            if (data.availableSlots.length > 0) {
                setStep("time");
            } else {
                setError('No available time slots for this date');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            setAvailability(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSlotSelect = (slot: AvailableSlot) => {
        setSelectedSlot(slot);
        setStep('details');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSlot) return;

        console.log('Selected slot:', selectedSlot);
        console.log('Start time:', selectedSlot.start);

        setLoading(true);
        setError(null);

        try {
            const bookingRequest: CreateBookingRequest = {
                guestName: formData.guestName,
                guestEmail: formData.guestEmail,
                guestPhone: formData.guestPhone || undefined,
                notes: formData.notes || undefined,
                startTime: selectedSlot.start
            };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/public/${username}/${slug}/book`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingRequest),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to create booking');
                return;
            }

            const confirmationData: BookingConfirmation = await response.json();
            setConfirmation(confirmationData);
            setStep('confirmed');
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetBooking = () => {
        setStep('date');
        setSelectedDate(undefined);
        setAvailability(null);
        setSelectedSlot(null);
        setFormData({ guestName: '', guestEmail: '', guestPhone: '', notes: '' });
        setConfirmation(null);
        setError(null);
    };

    // Date picker config
    const today = new Date();
    const minDate = addDays(today, 1); // Tomorrow
    const maxDate = addDays(today, 60); // 60 days from now

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                {availability && step !== 'confirmed' && (
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {availability.eventType.name}
                        </h1>
                        {availability.eventType.description && (
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                {availability.eventType.description}
                            </p>
                        )}
                        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{availability.eventType.durationMinutes} minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{availability.eventType.location}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <p className="text-red-800 text-center">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Step 1: Date Selection */}
                {step === 'date' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Select a Date
                            </CardTitle>
                            <CardDescription>Choose a date for your meeting</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={[
                                        { before: minDate },
                                        { after: maxDate }
                                    ]}
                                    className="rdp-custom"
                                />
                            </div>
                            {loading && (
                                <p className="text-center text-gray-600 mt-4">Loading availability...</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Time Selection */}
                {step === 'time' && availability && (
                    <Card>
                        <CardHeader>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep('date')}
                                className="mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to date selection
                            </Button>
                            <CardTitle>Select a Time</CardTitle>
                            <CardDescription>
                                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {availability.availableSlots.length === 0 ? (
                                <p className="text-center text-gray-600 py-8">
                                    No available time slots for this date. Please select another date.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {availability.availableSlots.map((slot, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="h-12 hover:bg-blue-50 hover:border-blue-600"
                                            onClick={() => handleSlotSelect(slot)}
                                        >
                                            {format(parseISO(slot.start), 'HH:mm')}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Guest Details Form */}
                {step === 'details' && availability && selectedSlot && (
                    <Card>
                        <CardHeader>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep('time')}
                                className="mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to time selection
                            </Button>
                            <CardTitle>Your Details</CardTitle>
                            <CardDescription>
                                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')} at{' '}
                                {format(parseISO(selectedSlot.start), 'HH:mm')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="guestName">Name *</Label>
                                    <Input
                                        id="guestName"
                                        required
                                        value={formData.guestName}
                                        onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="guestEmail">Email *</Label>
                                    <Input
                                        id="guestEmail"
                                        type="email"
                                        required
                                        value={formData.guestEmail}
                                        onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="guestPhone">Phone (optional)</Label>
                                    <Input
                                        id="guestPhone"
                                        type="tel"
                                        value={formData.guestPhone}
                                        onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                                        placeholder="+48 123 456 789"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Any additional information..."
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Booking...' : 'Confirm Booking'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Confirmation */}
                {step === 'confirmed' && confirmation && (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Booking Confirmed!
                                </h2>
                                <p className="text-gray-600 mb-6">{confirmation.message}</p>

                                <div className="bg-white rounded-lg p-6 mb-6 text-left">
                                    <h3 className="font-semibold mb-4">Booking Details:</h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Event:</dt>
                                            <dd className="font-medium">{confirmation.eventTypeName}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Date & Time:</dt>
                                            <dd className="font-medium">
                                                {format(parseISO(confirmation.startTime), 'PPpp')}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Duration:</dt>
                                            <dd className="font-medium">{confirmation.durationMinutes} minutes</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Location:</dt>
                                            <dd className="font-medium">{confirmation.location}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Guest:</dt>
                                            <dd className="font-medium">{confirmation.guestName}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <Button onClick={resetBooking} variant="outline" size="lg">
                                    Book Another Meeting
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}