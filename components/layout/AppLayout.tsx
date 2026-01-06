'use client';

import Navbar from './Navbar';
import Footer from './Footer';
import { ErrorBoundary } from '../ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function AppLayout({ children, showFooter = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}