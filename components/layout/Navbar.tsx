'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types'; 
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthService } from '@/lib/auth';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const user = AuthService.getUser();
        if (user) {
            setUser(user);
        }
    }, []);

    const handleLogout = () => {
        AuthService.logout();
        router.push('/');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <nav className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
                            <div className="text-2xl">🗓️</div>
                            <span className="text-xl font-bold text-gray-900">MeetFlow</span>
                        </Link>
                    </div>

                    {/* Navigation - Center */}
                    {user && (
                        <div className="hidden md:flex items-center space-x-8">
                            <Link 
                                href="/dashboard" 
                                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link 
                                href="/dashboard/event-types" 
                                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                Event Types
                            </Link>
                            <Link 
                                href="/availability" 
                                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                Availability
                            </Link>
                        </div>
                    )}

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar>
                                            <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
                                            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user.fullName}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                    Logout
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                             <>
                                <Link href="/login">
                                    <Button variant="ghost">Sign in</Button>
                                </Link>
                                <Link href="/register">
                                    <Button>Get started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}