import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://jpwwsfkwwsxtmwjvzyva.supabase.co',
      environment.supabaseKey
    );
  }

  async signUp(email: string, pass: string, userMetadata?: { name?: string; dni?: string; role?: string }) {
    return await this.supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: userMetadata || {}
      }
    });
  }

  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  async signInWithOAuth(provider: 'google' = 'google') {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:4200/dashboard';
    return await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl
      }
    });
  }

  async signInWithMagicLink(email: string) {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:4200/dashboard';
    return await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
  }

  async updateUserMetadata(userMetadata: { name?: string; dni?: string; role?: string }) {
    return await this.supabase.auth.updateUser({
      data: userMetadata
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async getToken() {
    const session = await this.getSession();
    return session?.access_token;
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}
