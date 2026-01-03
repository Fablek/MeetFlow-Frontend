'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, ArrowRight } from 'lucide-react';

interface PublicEventType {
  name: string;
  slug: string;
  durationMinutes: number;
  description?: string;
  location: string;
  color: string;
}

interface PublicProfile {
  username: string;
  fullName: string;
  eventTypes: PublicEventType[];
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/${username}`);

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || 'The user you\'re looking for doesn\'t exist.'}
            </p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <div className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center text-primary-foreground text-3xl font-bold">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {profile.fullName}
          </h1>
          <p className="text-gray-600 text-lg">@{profile.username}</p>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Welcome! Select a meeting type below to book time with me.
          </p>
        </div>

        {/* Event Types */}
        {profile.eventTypes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">No available meeting types</h3>
              <p className="text-gray-600">
                This user hasn't set up any meeting types yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.eventTypes.map((eventType) => (
              <Card
                key={eventType.slug}
                className="hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <Link href={`/${username}/${eventType.slug}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: eventType.color }}
                          />
                          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                            {eventType.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {eventType.description || 'No description provided'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{eventType.durationMinutes} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{eventType.location}</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <Button className="w-full mt-4 group-hover:bg-blue-700" size="lg">
                        Book Meeting
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by <span className="font-semibold text-blue-600">MeetFlow</span></p>
        </div>
      </div>
    </div>
  );
}