import Cookies from 'js-cookie';
import { User } from '@/types';

export const AuthService = {
    setAuth(token: string, user: User) {
        // Save in cookies (middleware)
        Cookies.set('token', token, { expires: 7, sameSite: 'strict' });

        // Save user in localStorage (frontend)
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    getToken() {
        return Cookies.get('token');
    },

    getUser() {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
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

    isAuthenticated() {
        return !!this.getToken();
    }
};