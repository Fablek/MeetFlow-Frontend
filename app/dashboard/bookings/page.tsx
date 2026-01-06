'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    Calendar, 
    Clock, 
    MapPin, 
    User, 
    Mail, 
    Phone,
    AlertCircle,
    CheckCircle,
    XCircle,
    Loader2,
    Filter,
    AlertTriangle
} from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { toast } from 'sonner';

interface Booking {
    id: string;
    eventTypeName: string;
    eventTypeSlug: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    notes?: string;
    location: string;
    status: string;
    createdAt: string;
}

type FilterType = 'all' | 'upcoming' | 'past' | 'cancelled';

export default function BookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('upcoming');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = AuthService.getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }

            const data = await response.json();
            setBookings(data);
        } catch (err) {
            setError('Failed to load bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = useCallback(() => {
        const now = new Date();
        let filtered = bookings;

        switch (filter) {
            case 'upcoming':
                filtered = bookings.filter(
                    b => new Date(b.startTime) >= now && b.status.toLowerCase() === 'confirmed'
                );
                break;
            case 'past':
                filtered = bookings.filter(
                    b => new Date(b.startTime) < now && b.status.toLowerCase() === 'confirmed'
                );
                break;
            case 'cancelled':
                filtered = bookings.filter(b => b.status.toLowerCase() === 'cancelled');
                break;
            case 'all':
            default:
                filtered = bookings;
                break;
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.startTime).getTime();
            const dateB = new Date(b.startTime).getTime();
            return filter === 'past' ? dateB - dateA : dateA - dateB;
        });

        setFilteredBookings(filtered);
    }, [bookings, filter]);

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [filterBookings]);

    const getStatusBadge = (status: string) => {
        if (status.toLowerCase() === 'confirmed') {
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Confirmed
                </Badge>
            );
        }
        return (
            <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Cancelled
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getDuration = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
        return `${minutes} min`;
    };

    const handleCancelBooking = (booking: Booking) => {
        setBookingToCancel(booking);
        setShowCancelModal(true);
    };

    const confirmCancelBooking = async () => {
        if (!bookingToCancel) return;

        setCancellingId(bookingToCancel.id);
        setShowCancelModal(false);

        try {
            const token = AuthService.getToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingToCancel.id}`,
                {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel booking');
            }

            setBookings(bookings.map(b => 
                b.id === bookingToCancel.id 
                    ? { ...b, status: 'cancelled' }
                    : b
            ));

            toast.success('Booking cancelled', {
                description: 'The guest will be notified via email.',
                duration: 4000,
            });
        } catch (err) {
            toast.error('Failed to cancel booking', {
                description: err instanceof Error ? err.message : 'Please try again.',
                duration: 5000,
            });
        } finally {
            setCancellingId(null);
            setBookingToCancel(null);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <AppLayout>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </AppLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
                        <p className="text-gray-600 mt-2">Manage your scheduled meetings</p>
                    </div>

                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={filter === 'upcoming' ? 'default' : 'outline'}
                                onClick={() => setFilter('upcoming')}
                                size="sm"
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Upcoming
                            </Button>
                            <Button
                                variant={filter === 'past' ? 'default' : 'outline'}
                                onClick={() => setFilter('past')}
                                size="sm"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Past
                            </Button>
                            <Button
                                variant={filter === 'cancelled' ? 'default' : 'outline'}
                                onClick={() => setFilter('cancelled')}
                                size="sm"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelled
                            </Button>
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilter('all')}
                                size="sm"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                All
                            </Button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Bookings List */}
                    {filteredBookings.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No bookings found
                                </h3>
                                <p className="text-gray-500 text-center mb-4">
                                    {filter === 'upcoming' && "You don't have any upcoming meetings."}
                                    {filter === 'past' && "You don't have any past meetings."}
                                    {filter === 'cancelled' && "You don't have any cancelled meetings."}
                                    {filter === 'all' && "You don't have any bookings yet."}
                                </p>
                                <Button onClick={() => router.push('/dashboard/event-types')}>
                                    Create Event Type
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            {/* Left side - Event info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                            {booking.eventTypeName}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(booking.status)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Date and Time */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    <div className="flex items-start gap-2">
                                                        <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {formatDate(booking.startTime)}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Duration</p>
                                                            <p className="text-sm text-gray-500">
                                                                {getDuration(booking.startTime, booking.endTime)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Location</p>
                                                            <p className="text-sm text-gray-500">{booking.location}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Guest info preview */}
                                                <div className="border-t pt-4">
                                                    <p className="text-sm font-medium text-gray-900 mb-2">Guest</p>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-700">{booking.guestName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side - Actions */}
                                            <div className="flex flex-col gap-2 lg:ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedBooking(booking)}
                                                >
                                                    View Details
                                                </Button>
                                                {booking.status.toLowerCase() === 'confirmed' &&
                                                    new Date(booking.startTime) > new Date() && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleCancelBooking(booking)}
                                                            disabled={cancellingId === booking.id}
                                                        >
                                                            {cancellingId === booking.id ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Cancelling...
                                                                </>
                                                            ) : (
                                                                'Cancel Booking'
                                                            )}
                                                        </Button>
                                                    )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    {bookings.length > 0 && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {bookings.filter(
                                                    b => new Date(b.startTime) >= new Date() && b.status.toLowerCase() === 'confirmed'
                                                ).length}
                                            </p>
                                            <p className="text-sm text-gray-500">Upcoming</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {bookings.filter(b => b.status.toLowerCase() === 'confirmed').length}
                                            </p>
                                            <p className="text-sm text-gray-500">Total Confirmed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {bookings.filter(b => b.status.toLowerCase() === 'cancelled').length}
                                            </p>
                                            <p className="text-sm text-gray-500">Cancelled</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* View Details Modal */}
                {selectedBooking && (
                    <div 
                        className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center p-4 z-50"
                        onClick={() => setSelectedBooking(null)}
                    >
                        <div 
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Status Badge */}
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(selectedBooking.status)}
                                    <span className="text-sm text-gray-500">
                                        Created {new Date(selectedBooking.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Event Type */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {selectedBooking.eventTypeName}
                                    </h3>
                                </div>

                                {/* Date & Time Section */}
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <h4 className="font-medium text-gray-900 mb-3">When</h4>
                                    
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {formatDate(selectedBooking.startTime)}
                                            </p>
                                            <p className="text-gray-600">
                                                {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">Duration</p>
                                            <p className="text-gray-600">
                                                {getDuration(selectedBooking.startTime, selectedBooking.endTime)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">Location</p>
                                            <p className="text-gray-600">{selectedBooking.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Guest Information */}
                                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                    <h4 className="font-medium text-gray-900 mb-3">Guest Information</h4>
                                    
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Name</p>
                                            <p className="font-medium text-gray-900">{selectedBooking.guestName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <a 
                                                href={`mailto:${selectedBooking.guestEmail}`}
                                                className="font-medium text-blue-600 hover:underline"
                                            >
                                                {selectedBooking.guestEmail}
                                            </a>
                                        </div>
                                    </div>

                                    {selectedBooking.guestPhone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-600">Phone</p>
                                                <a 
                                                    href={`tel:${selectedBooking.guestPhone}`}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    {selectedBooking.guestPhone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                {selectedBooking.notes && (
                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Notes from Guest</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedBooking.notes}</p>
                                    </div>
                                )}

                                {/* Booking ID */}
                                <div className="pt-4 border-t">
                                    <p className="text-xs text-gray-500">Booking ID</p>
                                    <p className="font-mono text-xs text-gray-700 break-all">{selectedBooking.id}</p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedBooking(null)}
                                >
                                    Close
                                </Button>
                                
                                {selectedBooking.status.toLowerCase() === 'confirmed' &&
                                    new Date(selectedBooking.startTime) > new Date() && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                setSelectedBooking(null);
                                                handleCancelBooking(selectedBooking);
                                            }}
                                            disabled={cancellingId === selectedBooking.id}
                                        >
                                            {cancellingId === selectedBooking.id ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Cancelling...
                                                </>
                                            ) : (
                                                'Cancel Booking'
                                            )}
                                        </Button>
                                    )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {showCancelModal && bookingToCancel && (
                    <div 
                        className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowCancelModal(false)}
                    >
                        <div 
                            className="bg-white rounded-lg shadow-xl max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Cancel Booking?
                                    </h3>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <p className="text-gray-600">
                                        Are you sure you want to cancel this booking?
                                    </p>
                                    
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <p className="font-medium text-gray-900">
                                            {bookingToCancel.eventTypeName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            with {bookingToCancel.guestName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(bookingToCancel.startTime)} at {formatTime(bookingToCancel.startTime)}
                                        </p>
                                    </div>

                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm text-red-800">
                                            <strong>Warning:</strong> This action cannot be undone. The guest will be notified via email about the cancellation.
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCancelModal(false)}
                                        className="flex-1"
                                    >
                                        Keep Booking
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={confirmCancelBooking}
                                        className="flex-1"
                                    >
                                        Yes, Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AppLayout>
        </ProtectedRoute>
    );
}