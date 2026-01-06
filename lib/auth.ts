import Cookies from 'js-cookie';
import { User } from '@/types';

const TOKEN_EXPIRY_DAYS = 7;

/**
 * Authentication service for managing user sessions
 *
 * Security Note: For production, consider:
 * - Using httpOnly cookies for tokens (requires backend support)
 * - Avoiding localStorage for sensitive data
 * - Implementing token refresh mechanism
 */
export const AuthService = {
    setAuth(token: string, user: User) {
        // Save token in cookies
        Cookies.set('token', token, {
            expires: TOKEN_EXPIRY_DAYS,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production' // HTTPS only in production
        });

        // Save user data in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    getToken(): string | undefined {
        return Cookies.get('token');
    },

    getUser(): User | null {
        if (typeof window !== 'undefined') {
            try {
                const user = localStorage.getItem('user');
                if (!user) return null;

                const parsed = JSON.parse(user);
                return parsed;
            } catch (error) {
                // Handle corrupted data
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('user');
                return null;
            }
        }
        return null;
    },

    logout() {
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};