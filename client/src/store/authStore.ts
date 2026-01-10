import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    
    // Actions
    initializeAuth: () => Promise<void>;
    signInWithGithub: () => Promise<{ error: any }>;
    signInWithGoogle: () => Promise<{ error: any }>;
    signOut: () => Promise<{ error: any }>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,

    initializeAuth: async () => {
        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user || null, isLoading: false });

        // Listen for changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user || null, isLoading: false });
        });
    },

    signInWithGithub: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin
            }
        });
        return { error };
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        return { error };
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        set({ session: null, user: null });
        return { error };
    }
}));
