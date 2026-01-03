'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
      </div>

      {/* Full-Screen Hero */}
      <section className="relative flex items-center justify-center min-h-[90vh]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 backdrop-blur-sm bg-background/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium">Now in beta — Join early adopters</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-8">
            Scheduling
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60">
              made simple
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Stop the email ping-pong. Share your calendar, let people book time with you instantly.
            <br />
            <span className="text-foreground font-medium">It's that simple.</span>
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Sign in
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background"></div>
                <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-background"></div>
                <div className="w-8 h-8 rounded-full bg-primary/40 border-2 border-background"></div>
              </div>
              <span>1,200+ users</span>
            </div>
            <span>·</span>
            <span>No credit card required</span>
            <span>·</span>
            <span>Free forever</span>
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section className="relative py-32 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-lg text-muted-foreground">Powerful features, simple interface</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="group relative overflow-hidden rounded-xl border bg-card p-8 hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart scheduling</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create event types, set your availability, and share your link. Done.
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative overflow-hidden rounded-xl border bg-card p-8 hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Team collaboration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Manage multiple calendars, coordinate team schedules effortlessly.
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative overflow-hidden rounded-xl border bg-card p-8 hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant sync</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time updates across all devices. Never miss a booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}