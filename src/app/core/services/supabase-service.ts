import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private apiKey: string | undefined;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformServer(this.platformId)) {
      this.apiKey = process.env['SUPABASE_API_KEY'];
    }
    this.supabase = createClient(
      'https://jpwwsfkwwsxtmwjvzyva.supabase.co',
      this.apiKey || ''
    );
  }

  async signUp(email: string, pass: string) {
    return await this.supabase.auth.signUp({ email, password: pass });
  }

  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  async getToken() {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token;
  }
}


