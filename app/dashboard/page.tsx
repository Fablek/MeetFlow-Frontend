'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from '@/lib/auth';
import { User } from '@/types';
import { Calendar, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = AuthService.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  if (!user) {
    return null;
  }

  // Mock data for analytics
  const stats = [
    {
      title: 'Total Bookings',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      description: 'vs last month'
    },
    {
      title: 'Active Events',
      value: '3',
      change: '+1',
      trend: 'up',
      icon: TrendingUp,
      description: 'event types'
    },
    {
      title: 'Total Guests',
      value: '18',
      change: '+8%',
      trend: 'up',
      icon: Users,
      description: 'unique visitors'
    },
    {
      title: 'Avg Duration',
      value: '32m',
      change: '-5m',
      trend: 'down',
      icon: Clock,
      description: 'per meeting'
    }
  ];

  const recentActivity = [
    { event: 'Product Demo', guest: 'John Doe', time: '2 hours ago', status: 'confirmed' },
    { event: '1-on-1 Meeting', guest: 'Jane Smith', time: '5 hours ago', status: 'confirmed' },
    { event: 'Team Sync', guest: 'Mike Johnson', time: '1 day ago', status: 'completed' },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user.fullName}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isPositive = stat.trend === 'up';

              return (
                <Card key={stat.title} className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isPositive ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{activity.event}</p>
                        <p className="text-sm text-muted-foreground">{activity.guest}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'confirmed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Booking Rate</span>
                      <span className="text-sm font-bold">78%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Attendance Rate</span>
                      <span className="text-sm font-bold">92%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold">7</p>
                        <p className="text-sm text-muted-foreground">Meetings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">4.2h</p>
                        <p className="text-sm text-muted-foreground">Total time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}